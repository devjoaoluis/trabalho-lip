import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { DrizzleService } from "../db/drizzle.service";

@Module({
  controllers: [ReportController],
  providers: [ReportService, DrizzleService],
})
export class ReportModule {}
