import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";
import multer from "multer";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Error details:", {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`);
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    logger.warn(`MulterError: ${err.message}`);
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        status: "error",
        message: "File size exceeds 5MB limit",
      });
      return;
    }

    res.status(400).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  logger.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
