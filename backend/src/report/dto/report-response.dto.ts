import { ApiProperty } from "@nestjs/swagger";

export class ReportResponseDto {
  @ApiProperty({
    example: "21d9d859-f8d1-4a80-9947-dc9c19387512",
    description: "ID único do relatório.",
  })
  id!: string;

  @ApiProperty({
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID do usuário dono do relatório.",
  })
  usuarioId!: string;

  @ApiProperty({
    example: 5,
    description: "Total de tarefas concluídas no período.",
  })
  totalConcluidas!: number;

  @ApiProperty({
    example: 3,
    description: "Total de tarefas pendentes no período.",
  })
  totalPendentes!: number;

  @ApiProperty({
    example: {
      "2026-06-10": 1,
      "2026-06-15": 2,
      "2026-06-20": 2,
    },
    description: "Quantidade de tarefas concluídas por dia.",
    type: "object",
    additionalProperties: {
      type: "number",
    },
  })
  concluidasPorDia!: Record<string, number>;

  @ApiProperty({
    example: "2026-06-01",
    description: "Data inicial do período do relatório.",
  })
  periodoInicio!: string;

  @ApiProperty({
    example: "2026-06-30",
    description: "Data final do período do relatório.",
  })
  periodoFim!: string;

  @ApiProperty({
    example: "2026-06-21T01:30:00.000Z",
    description: "Data e hora em que o relatório foi gerado.",
  })
  geradoEm!: Date;
}
