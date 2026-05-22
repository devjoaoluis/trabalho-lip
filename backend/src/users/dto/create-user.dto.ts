import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  nome!: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty({ message: 'Email não pode ser vazio' })
  email!: string;

  @MinLength(6)
  senha!: string;
}
