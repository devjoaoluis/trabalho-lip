import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "joao@gmail.com",
    description: "E-mail do usuário que deseja redefinir a senha.",
  })
  @IsNotEmpty({ message: "E-mail é obrigatório" })
  @IsEmail({}, { message: "E-mail inválido" })
  email!: string;
}
