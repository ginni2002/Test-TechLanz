import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
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

  console.error("Error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
