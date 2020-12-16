import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'

import { UserRepository } from './user/user.repository';
import { RefreshTokenRepository } from './jwt/refreshToken/refreshToken.repository';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPairDto } from './dto/jwt-pair.dto';

import { JwtPayload } from './jwt/jwt-payload.interface'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(RefreshTokenRepository)
        private refreshTokenRepository: RefreshTokenRepository,
        private jwtService: JwtService,
    ) { }

    /* 
      Регистрация пользователя
    */
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userRepository.signUp(authCredentialsDto)
    }

    /*
     Логин пользователя
     Выплёвывает пару новых access+refresh токенов при успехе
     В ином случае - UnathorizedException
    */

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<JwtPairDto> {

        /*
         Сюда падает null, в случае если валидация пользователя не происходит
        */
        const username = await this.userRepository.validateUserPassword(authCredentialsDto)

        if (!username) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload: JwtPayload = { username };
        const accessToken = await this.jwtService.sign(payload)
        const refreshToken = await this.refreshTokenRepository.generateRefreshToken(accessToken, username)

        return { accessToken, refreshToken }
    }

    /* 
     Обновление пары access+refresh токенов

     В случае неудачи метод выдаёт UnauthorizedException

     В случае успеха метод выдаст новую пару access+refresh токенов, если:
     Refresh токен совпадает с имеющимся в базе, и был выдан вместе с access токеном который метод получает на вход

     По факту в бд хранится хеш access+refresh токенов
     Соль, которым происходило хеширование, выдаётся юзеру в виде refresh токена
     
     Метод же хеширует пару access_token + соль (refreshToken), и затем ищет получившийся хеш в бд
     Если хеш не будет найден - у юзера либо невалидный рефреш токен
     Либо невалидный access token, который выдавался не вместе с имеющимся рефшер токеном

     
    */
    async refreshToken(oldAccessToken: string, oldRefreshToken: string): Promise<JwtPairDto> {
        
        const refreshTokenHash = await bcrypt.hash(oldAccessToken.split('.')[2] + oldRefreshToken, oldRefreshToken)
        const refreshTokenDB = await this.refreshTokenRepository.findOne({ hash: refreshTokenHash })

        if (!refreshTokenDB) {
            throw new UnauthorizedException(`Invalid tokens`);
        }

        const payload: JwtPayload = { username: refreshTokenDB.username };

        const newAccesToken = await this.jwtService.sign(payload)
        const salt = await bcrypt.genSalt(10)

        refreshTokenDB.hash = await bcrypt.hash(newAccesToken.split('.')[2] + salt, salt)

        try {
            await refreshTokenDB.save()
            return { accessToken: newAccesToken, refreshToken: salt };
        } catch (e) {
            throw new InternalServerErrorException();
        }
    }
}