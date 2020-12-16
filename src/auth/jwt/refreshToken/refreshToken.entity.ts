import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";

/*

 @hash: Хэш bcrypt-а, составленный из acces+refresh токенов
 @username: payload для jwt токена  

*/
@Entity()
export class RefreshToken extends BaseEntity {

    @ObjectIdColumn()
    id: string;

    @Column()
    hash: string;

    @Column()
    username: string
}