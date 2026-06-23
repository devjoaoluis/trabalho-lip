import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { JwtAuthGuard, JwtPayload } from "../auth/guards/jwt-auth.guard";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UseGuards } from "@nestjs/common";
import { Request } from "express";
import { ParseUUIDPipe } from "@nestjs/common";
import { TaskResponseDto } from "./dto/task-response.dto.js";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("task")
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @ApiOperation({
    summary: "Criar tarefa",
    description: "Cria uma nova tarefa para o usuário autenticado.",
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: "Tarefa criada com sucesso.",
    type: TaskResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  create(@Req() req: Request & { user: JwtPayload }, @Body() CreateDto: CreateTaskDto) {
    return this.taskService.create(req.user.sub, CreateDto);
  }

  @Get()
  @ApiOperation({
    summary: "Listar tarefas",
    description: "Lista todas as tarefas do usuário autenticado.",
  })
  @ApiOkResponse({
    description: "Lista de tarefas retornada com sucesso.",
    type: TaskResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.taskService.findAll(req.user.sub);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Atualizar tarefa",
    description: "Atualiza parcialmente uma tarefa do usuário autenticado.",
  })
  @ApiParam({
    name: "id",
    example: "4f8b60c2-81f9-44db-b363-d5e9a219f071",
    description: "ID da tarefa.",
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: "Tarefa atualizada com sucesso.",
  })
  @ApiNotFoundResponse({
    description: "Tarefa não encontrada.",
  })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload },
    @Body() updateDto: UpdateTaskDto
  ) {
    return this.taskService.update(id, req.user.sub, updateDto);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Buscar tarefa por ID",
    description: "Busca uma tarefa específica do usuário autenticado.",
  })
  @ApiParam({
    name: "id",
    example: "4f8b60c2-81f9-44db-b363-d5e9a219f071",
    description: "ID da tarefa.",
  })
  @ApiOkResponse({
    description: "Tarefa encontrada com sucesso.",
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Tarefa não encontrada.",
  })
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload }
  ) {
    return this.taskService.findOne(id, req.user.sub);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Remover tarefa",
    description: "Remove uma tarefa do usuário autenticado.",
  })
  @ApiParam({
    name: "id",
    example: "4f8b60c2-81f9-44db-b363-d5e9a219f071",
    description: "ID da tarefa.",
  })
  @ApiNoContentResponse({
    description: "Tarefa removida com sucesso.",
  })
  @ApiNotFoundResponse({
    description: "Tarefa não encontrada.",
  })
  delete(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload }
  ) {
    return this.taskService.delete(id, req.user.sub);
  }
}
