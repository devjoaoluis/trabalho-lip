import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty({
    example: "Logout realizado com sucesso",
    description: "Mensagem de confirmação do logout.",
  })
  message!: string;
}
