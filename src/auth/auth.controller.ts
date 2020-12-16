import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPairDto } from './dto/jwt-pair.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    /*
    Регистрация пользователя
    */
    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto)
    }

    /*
    Логин, получение пары refresh+acces токенов
    */
    @Post('/signin')
    signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<JwtPairDto> {
        return this.authService.signIn(authCredentialsDto)
    }

    /*
     Обновление refresh токена
    */
    @Post('/refresh')
    refreshToken(@Body(ValidationPipe) JwtPairDto: JwtPairDto): Promise<JwtPairDto> {
        return this.authService.refreshToken(JwtPairDto.accessToken, JwtPairDto.refreshToken)
    }

    /*
      Тест на владение актуальным access токеном
    */
    @Post('/test')
    @UseGuards(AuthGuard())
    test() {
        return {
            status: 'JWT token accepted'
        }
    }
}
