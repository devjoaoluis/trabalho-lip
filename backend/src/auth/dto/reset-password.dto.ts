import { IsString, MinLength, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    description: "Token usado para autorizar a redefinição de senha.",
  })
  @IsNotEmpty({ message: "Token é obrigatório" })
  @IsString({ message: "Token inválido" })
  token!: string;

  @ApiProperty({
    example: "senha123",
    description: "Nova senha do usuário.",
    minLength: 8,
  })
  @IsNotEmpty({ message: "Nova senha é obrigatória" })
  @IsString()
  @MinLength(8, { message: "Senha deve ter no mínimo 8 caracteres" })
  newPassword!: string;
}
