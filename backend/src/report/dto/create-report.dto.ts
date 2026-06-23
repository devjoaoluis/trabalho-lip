import { IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReportDto {
  @ApiProperty({
    example: "2026-06-01",
    description: "Data inicial do período do relatório.",
  })
  @IsDateString()
  periodoInicio!: string;

  @ApiProperty({
    example: "2026-06-30",
    description: "Data final do período do relatório.",
  })
  @IsDateString()
  periodoFim!: string;
}
