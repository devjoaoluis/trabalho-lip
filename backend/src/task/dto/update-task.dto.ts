import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import {Prioridade, StatusTarefa } from "./create-task.dto";

export class UpdateTaskDto {
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
