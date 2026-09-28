import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DrizzleService } from "src/db/drizzle.service";
import { DrizzleModule } from "../db/drizzle.module";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";

@Module({
  imports: [CloudinaryModule, DrizzleModule],
  controllers: [UsersController],
  providers: [UsersService, DrizzleService],
  exports: [UsersService],
})
export class UsersModule {}
