import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import * as bcrypt from 'bcrypt'

/* 
   @password: Хешированый с помощью bcrypt-а пароль
   @salt: Bcrypt соль, с помощью которой можно валидировать полученный от пользователя пароль
*/
@Entity()
export class User extends BaseEntity {

    @ObjectIdColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    salt: string
    

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt)
        return hash === this.password
    }
}