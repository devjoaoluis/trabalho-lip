import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { DrizzleService } from "#src/db/drizzle.service.js";

@Module({
  controllers: [TaskController],
  providers: [TaskService, DrizzleService],
  exports: [TaskService],
})
export class TaskModule {}
