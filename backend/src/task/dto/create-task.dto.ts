import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum Prioridade {
  BAIXA = "BAIXA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
}

export enum StatusTarefa {
  PENDENTE = "PENDENTE",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CONCLUIDA = "CONCLUIDA",
}

export class CreateTaskDto {
  @ApiProperty({
    example: "Estudar para prova de LIP",
    description: "Título da tarefa.",
  })
  @IsString()
  @IsNotEmpty({ message: "titulo não pode ser vazio" })
  titulo!: string;

  @ApiPropertyOptional({
    example: "Estudar sobre nomes, variáveis, expressões e subprogramas",
    description: "Descrição detalhada da tarefa.",
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  descricao?: string;

  @ApiPropertyOptional({
    enum: Prioridade,
    example: Prioridade.MEDIA,
    description: "Prioridade da tarefa.",
  })
  @IsEnum(Prioridade)
  @IsOptional()
  prioridade?: Prioridade;

  @ApiPropertyOptional({
    enum: StatusTarefa,
    example: StatusTarefa.PENDENTE,
    description: "Status atual da tarefa.",
  })
  @IsEnum(StatusTarefa)
  @IsOptional()
  status?: StatusTarefa;

  @ApiPropertyOptional({
    example: "2026-06-30",
    description: "Data limite da tarefa.",
  })
  @IsDateString()
  @IsOptional()
  dataLimite?: string;
}
