import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { JwtPayload } from "#src/auth/guards/jwt-auth.guard.js";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Controller("task")
export class TaskController {
  constructor(private taskService: TaskService) {}
  @Post()
  create(@Req() req: Request & { user: JwtPayload }, @Body() CreateDto: CreateTaskDto) {
    return this.taskService.create(req.user.sub, CreateDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() UpdateDto: UpdateTaskDto) {
    return this.taskService.update(id, UpdateDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.taskService.findOne(id);
  }


  @Delete(":id")
  delete(@Param("id") id:string) {
    return this.taskService.delete(id)
  }
}
