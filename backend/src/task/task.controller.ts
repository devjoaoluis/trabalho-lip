import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { JwtAuthGuard, JwtPayload } from "../auth/guards/jwt-auth.guard";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UseGuards } from "@nestjs/common";
import { Request } from "express";
import { ParseUUIDPipe } from "@nestjs/common";
@UseGuards(JwtAuthGuard)
@Controller("task")
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@Req() req: Request & { user: JwtPayload }, @Body() CreateDto: CreateTaskDto) {
    return this.taskService.create(req.user.sub, CreateDto);
  }

  @Get()
  findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.taskService.findAll(req.user.sub);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload },
    @Body() updateDto: UpdateTaskDto
  ) {
    return this.taskService.update(id, req.user.sub, updateDto);
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload }
  ) {
    return this.taskService.findOne(id, req.user.sub);
  }

  @Delete(":id")
  delete(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() req: Request & { user: JwtPayload }
  ) {
    return this.taskService.delete(id, req.user.sub);
  }
}
