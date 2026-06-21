import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "exemplo@gmail.com",
    description: "E-mail cadastrado do usuário.",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "senha123",
    description: "Senha do usuário. Deve possuir no mínimo 6 caracteres.",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
