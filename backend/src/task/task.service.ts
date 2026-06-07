import { DrizzleService } from "#src/db/drizzle.service.js";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskDto, StatusTarefa } from "./dto/create-task.dto";
import { tarefas } from "#src/db/schema.js";
import { eq } from "drizzle-orm";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TaskService {
  constructor(private drizzle: DrizzleService) {}

  async create(usuarioId: string, dto: CreateTaskDto) {
    const task = await this.drizzle.db
      .insert(tarefas)
      .values({
        usuarioId,
        titulo: dto.titulo,
        descricao: dto.descricao,
        ...(dto.prioridade != null && { prioridade: dto.prioridade }),
        ...(dto.status != null && { status: dto.status }),
        ...(dto.dataLimite != null && { dataLimite: dto.dataLimite }),
      })
      .returning();

    return {
      message: "Task created successfully",
      task: task[0],
    };
  }

  async findAll() {
    return await this.drizzle.db
      .select({
        id: tarefas.id,
        titulo: tarefas.titulo,
        descricao: tarefas.descricao,
        prioridade: tarefas.prioridade,
        status: tarefas.status,
      })
      .from(tarefas);
  }

  async findOne(id: string) {
    const task = await this.drizzle.db.select().from(tarefas).where(eq(tarefas.id, id));

    if (!task.length) throw new NotFoundException("Task not found");
    return task[0];
  }

  async update(id: string, dto: UpdateTaskDto) {
    const values: Partial<typeof tarefas.$inferInsert> = {};

    if (dto.titulo !== undefined) values.titulo = dto.titulo;
    if (dto.descricao !== undefined) values.descricao = dto.descricao;
    if (dto.prioridade !== undefined) values.prioridade = dto.prioridade;
    if (dto.status !== undefined) {
      values.status = dto.status;
      values.concluidaEm = dto.status === StatusTarefa.CONCLUIDA ? new Date() : null;
    }

    const task = await this.drizzle.db
      .update(tarefas)
      .set(values)
      .where(eq(tarefas.id, id))
      .returning();

    if (!task.length) throw new NotFoundException("Task not found");
    return task[0];
  }

  async delete(id: string) {
    const task = await this.drizzle.db.delete(tarefas).where(eq(tarefas.id, id)).returning();

    if (!task.length) throw new NotFoundException("Task not found");

    return {
      message: "Task deleted successfully",
      task: task[0],
    };
  }
}
