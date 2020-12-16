import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    /*
      Регистрация нового пользователя
      При регистрации пароль хешируется bcrypt-ом, и записывается в user-а, вместе с солью
      В случае если никнейм уже используется - метод выплюнет ConflictException
    */
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto

        const user = new User();
        user.username = username
        user.salt = await bcrypt.genSalt()
        user.password = await this.hashPassword(password, user.salt)

        try {
            await user.save()
        } catch (e) {
            if (e.code === 11000) {  //duplicate username
                throw new ConflictException('Username already exists')
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    /* 
    Валидация пароля пользователя
    В случае несовпадения метод выплёвывает null
    */
    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const { username, password } = authCredentialsDto

        const user = await this.findOne({ username })

        if (user && await user.validatePassword(password)) {
            return user.username;
        } else {
            console.log(`User not found`)
            return null;
        }
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }
}   