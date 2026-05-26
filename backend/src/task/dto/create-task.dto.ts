import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

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
  @IsString()
  @IsNotEmpty({ message: "titulo não pode ser vazio" })
  titulo!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  descricao?: string;

  @IsEnum(Prioridade)
  @IsOptional()
  prioridade?: Prioridade = Prioridade.MEDIA;

  @IsEnum(StatusTarefa)
  @IsOptional()
  status?: StatusTarefa = StatusTarefa.PENDENTE;
}