import { IsDateString } from "class-validator";

export class CreateReportDto {
  @IsDateString()
  periodoInicio!: string;

  @IsDateString()
  periodoFim!: string;
}
