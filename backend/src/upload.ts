import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { GlobalExceptionFilter } from "./common/filters/exception.filter";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./config/logger";
import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3300);
}
bootstrap();
