import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, gte, lt, sql, desc } from "drizzle-orm";
import { DrizzleService } from "../db/drizzle.service";
import { tarefas, relatorios } from "../db/schema";
import { CreateReportDto } from "./dto/create-report.dto";

@Injectable()
export class ReportService {
  constructor(private drizzle: DrizzleService) {}

  async gerarRelatorio(usuarioId: string, dto: CreateReportDto) {
    const { periodoInicio, periodoFim } = dto;

    const inicio = new Date(`${periodoInicio}T00:00:00`);
    const fim = new Date(`${periodoFim}T00:00:00`);

    if (inicio > fim) {
      throw new BadRequestException("A data inicial não pode ser maior que a data final.");
    }

    const fimExclusivo = new Date(fim);
    fimExclusivo.setDate(fimExclusivo.getDate() + 1);

    const [resultadoConcluidas] = await this.drizzle.db
      .select({
        total: sql<number>`cast(count(*) as int)`,
      })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.usuarioId, usuarioId),
          eq(tarefas.status, "CONCLUIDA"),
          gte(tarefas.concluidaEm, inicio),
          lt(tarefas.concluidaEm, fimExclusivo)
        )
      );

    const [resultadoPendentes] = await this.drizzle.db
      .select({
        total: sql<number>`cast(count(*) as int)`,
      })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.usuarioId, usuarioId),
          eq(tarefas.status, "PENDENTE"),
          gte(tarefas.criadoEm, inicio),
          lt(tarefas.criadoEm, fimExclusivo)
        )
      );

    const diaConclusao = sql<string>`to_char(${tarefas.concluidaEm}::date, 'YYYY-MM-DD')`;

    const concluidasPorDiaRows = await this.drizzle.db
      .select({
        dia: diaConclusao,
        total: sql<number>`cast(count(*) as int)`,
      })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.usuarioId, usuarioId),
          eq(tarefas.status, "CONCLUIDA"),
          gte(tarefas.concluidaEm, inicio),
          lt(tarefas.concluidaEm, fimExclusivo)
        )
      )
      .groupBy(diaConclusao)
      .orderBy(diaConclusao);

    const concluidasPorDia = concluidasPorDiaRows.reduce<Record<string, number>>((acc, item) => {
      acc[item.dia] = item.total;
      return acc;
    }, {});

    const totalConcluidas = resultadoConcluidas?.total ?? 0;
    const totalPendentes = resultadoPendentes?.total ?? 0;

    const [relatorioCriado] = await this.drizzle.db
      .insert(relatorios)
      .values({
        usuarioId,
        totalConcluidas,
        totalPendentes,
        concluidasPorDia,
        periodoInicio,
        periodoFim,
      })
      .returning();

    return relatorioCriado;
  }

  async listarRelatorios(usuarioId: string) {
    return this.drizzle.db
      .select()
      .from(relatorios)
      .where(eq(relatorios.usuarioId, usuarioId))
      .orderBy(desc(relatorios.geradoEm));
  }

  async buscarRelatorioPorId(usuarioId: string, relatorioId: string) {
    const [relatorio] = await this.drizzle.db
      .select()
      .from(relatorios)
      .where(and(eq(relatorios.id, relatorioId), eq(relatorios.usuarioId, usuarioId)));

    if (!relatorio) {
      throw new NotFoundException("Relatório não encontrado.");
    }

    return relatorio;
  }
}
