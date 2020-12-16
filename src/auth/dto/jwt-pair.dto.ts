import {  IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator"

export class JwtPairDto {

    @IsNotEmpty()
    @IsString()
    accessToken: string

    @IsNotEmpty()
    @IsString()
    @Matches(/^\$2b\$10\$/, {message: 'Incorrect header of Refresh Token'})
    @MinLength(29)
    @MaxLength(29)
    refreshToken: string
}
