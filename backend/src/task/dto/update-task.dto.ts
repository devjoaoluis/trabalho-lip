import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { CreateTaskDto, Prioridade, StatusTarefa } from "./create-task.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(Prioridade)
  @IsOptional()
  prioridade?: Prioridade;

  @IsEnum(StatusTarefa)
  @IsOptional()
  status?: StatusTarefa;

  @IsDateString()
  @IsOptional()
  dataLimite?: string;
}
