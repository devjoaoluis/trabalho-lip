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
      messagem: "Task created successfully",
      task: task[0],
    };
  }

  async findAll() {
    const task = await this.drizzle.db
    .select({
      id: tarefas.id,
      titulo: tarefas.titulo,
      descricao: tarefas.descricao,
      prioridade: tarefas.prioridade,
      status: tarefas.status,

    })
    .from(tarefas);

    return task[0] 
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.drizzle.db
    .update(tarefas)
    .set({
      ...(dto.titulo !== undefined && { titulo: dto.titulo }),
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.prioridade !== undefined && { prioridade: dto.prioridade }),
      ...(dto.status !== undefined && { 
          status: dto.status, 
          concluidaEm: dto.status === StatusTarefa.CONCLUIDA ? new Date(): null,
        }),
    })
    .where(eq(tarefas.id, id)).returning();

    return task[0]; 
  }

  async findOne(id: string) {
    const task = await this.drizzle.db.select().from(tarefas).where(eq(tarefas.id, id));

    return task[0];
  }

  async delete(id: string) {
    const task = await this.drizzle.db.delete(tarefas).where(eq(tarefas.id, id)).returning();

    if (!task.length){
      throw new NotFoundException("Task not found")
    }

    return {
      messagem: "Task deleted successfully",
      task: task[0],
    };
  }
}
