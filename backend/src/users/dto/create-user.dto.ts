import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    nome!: string;

    @IsEmail()
    email!: string;
    
    @MinLength(6)
    senha!: string;
}
