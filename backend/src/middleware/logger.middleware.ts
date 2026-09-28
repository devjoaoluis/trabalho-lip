import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        logger.error(logMessage);
      } else {
        logger.info(logMessage);
      }
    });

    next();
  }
}
