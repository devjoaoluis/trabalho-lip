import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateNotificationPreferenceDto {
  @ApiProperty({
    example: false,
    description: "Define se o usuário deseja receber notificações.",
  })
  @IsBoolean({ message: "receberNotificacoes deve ser verdadeiro ou falso" })
  receberNotificacoes!: boolean;
}
