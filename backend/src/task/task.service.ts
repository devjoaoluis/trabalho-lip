import { DrizzleService } from "../db/drizzle.service.js";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskDto, StatusTarefa } from "./dto/create-task.dto";
import { tarefas } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
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
      messagem: "Task created successfully",
      task: task[0],
    };
  }

  async findAll(usuarioId: string) {
    const tasks = await this.drizzle.db
      .select({
        id: tarefas.id,
        titulo: tarefas.titulo,
        descricao: tarefas.descricao,
        prioridade: tarefas.prioridade,
        status: tarefas.status,
      })
      .from(tarefas)
      .where(eq(tarefas.usuarioId, usuarioId));

    return tasks;
  }

  async update(id: string, usuarioId: string, dto: UpdateTaskDto) {
    const task = await this.drizzle.db
      .update(tarefas)
      .set({
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.prioridade !== undefined && { prioridade: dto.prioridade }),
        ...(dto.status !== undefined && {
          status: dto.status,
          concluidaEm: dto.status === StatusTarefa.CONCLUIDA ? new Date() : null,
        }),
      })
      .where(and(eq(tarefas.id, id), eq(tarefas.usuarioId, usuarioId)))
      .returning();

    if (!task.length) {
      throw new NotFoundException("Task not found");
    }

    return task[0];
  }

  async findOne(id: string, usuarioId: string) {
    const task = await this.drizzle.db
      .select()
      .from(tarefas)
      .where(and(eq(tarefas.id, id), eq(tarefas.usuarioId, usuarioId)));

    if (!task.length) {
      throw new NotFoundException("Task not found");
    }

    return task[0];
  }

  async delete(id: string, usuarioId: string) {
    const task = await this.drizzle.db
      .delete(tarefas)
      .where(and(eq(tarefas.id, id), eq(tarefas.usuarioId, usuarioId)))
      .returning();

    if (!task.length) {
      throw new NotFoundException("Task not found");
    }

    return {
      messagem: "Task deleted successfully",
      task: task[0],
    };
  }
}
