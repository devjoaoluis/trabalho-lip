import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    example: "João Luis Gomes",
    description: "Nome completo do usuário",
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  @IsNotEmpty({ message: "Nome não pode ser vazio" })
  nome!: string;

  @ApiProperty({
    example: "joaoluis@gmail.com",
    description: "E-mail do usuário",
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty({ message: "Email não pode ser vazio" })
  email!: string;

  @ApiProperty({
    example: "senha123",
    description: "Senha do usuário com no mínimo 6 caracteres.",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  senha!: string;
}
