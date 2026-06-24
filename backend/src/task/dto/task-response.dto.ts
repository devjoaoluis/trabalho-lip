import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Prioridade, StatusTarefa } from "./create-task.dto.js";

export class TaskResponseDto {
  @ApiProperty({
    example: "4f8b60c2-81f9-44db-b363-d5e9a219f071",
    description: "ID único da tarefa.",
  })
  id!: string;

  @ApiProperty({
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID do usuário dono da tarefa.",
  })
  usuarioId!: string;

  @ApiProperty({
    example: "Estudar NestJS",
    description: "Título da tarefa.",
  })
  titulo!: string;

  @ApiPropertyOptional({
    example: "Revisar autenticação, Swagger e relatórios.",
    description: "Descrição detalhada da tarefa.",
    nullable: true,
  })
  descricao!: string | null;

  @ApiProperty({
    enum: Prioridade,
    example: Prioridade.ALTA,
    description: "Prioridade da tarefa.",
  })
  prioridade!: Prioridade;

  @ApiProperty({
    enum: StatusTarefa,
    example: StatusTarefa.PENDENTE,
    description: "Status atual da tarefa.",
  })
  status!: StatusTarefa;

  @ApiPropertyOptional({
    example: "2026-06-30",
    description: "Data limite da tarefa.",
    nullable: true,
  })
  dataLimite!: string | null;

  @ApiPropertyOptional({
    example: "2026-06-21T15:30:00.000Z",
    description: "Data e hora em que a tarefa foi concluída.",
    nullable: true,
  })
  concluidaEm!: Date | null;

  @ApiProperty({
    example: "2026-06-21T01:30:00.000Z",
    description: "Data de criação da tarefa.",
  })
  criadoEm!: Date;

  @ApiProperty({
    example: "2026-06-21T01:30:00.000Z",
    description: "Data da última atualização da tarefa.",
  })
  atualizadoEm!: Date;
}
