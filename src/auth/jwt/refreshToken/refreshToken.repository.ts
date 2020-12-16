import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { RefreshToken } from './refreshToken.entity'


@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {

    /* 
      Метод генерирует рефреш токен из accessToken-а + соли
      Так-же зашивает в рефреш токен имя пользователя,
      Которое используется для генерации payload-а access токена, при обновлении пары access+refresh токенов
    */
    async generateRefreshToken(accessToken: string, username: string): Promise<string> {
        const salt = await bcrypt.genSalt(10)

        const refreshToken = new RefreshToken()
        refreshToken.username = username
        refreshToken.hash = await bcrypt.hash(accessToken.split('.')[2] + salt, salt)

        try {
            await refreshToken.save()
            return salt;
        } catch (e) {
            throw new InternalServerErrorException();
        }

    }

}
