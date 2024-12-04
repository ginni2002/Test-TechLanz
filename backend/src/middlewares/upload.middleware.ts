import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import { AppError } from "../utils/errors";
import { FileValidator } from "../utils/fileValidator";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-");
    if (!FileValidator.validateFileName(originalName)) {
      cb(new AppError(400, "Invalid filename"), "");
      return;
    }

    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const extension = path.extname(originalName);
    cb(null, uniqueSuffix + extension);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!config.allowedFileTypes.includes(file.mimetype as any)) {
    cb(
      new AppError(
        400,
        `File type ${
          file.mimetype
        } not allowed. Allowed types: ${config.allowedFileTypes.join(", ")}`
      )
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(FileValidator.maxSizes)),
  },
});

export const validateUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError(400, "No file uploaded");
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileSize = fileBuffer.length;

    if (!FileValidator.validateFileSize(fileSize, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      throw new AppError(
        400,
        `File size exceeds limit. Maximum size for ${
          req.file.mimetype
        }: ${FileValidator.getReadableFileSize(
          FileValidator.maxSizes[
            req.file.mimetype as keyof typeof FileValidator.maxSizes
          ]
        )}`
      );
    }

    if (!FileValidator.validateFileType(fileBuffer, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      throw new AppError(400, "File content does not match its extension");
    }

    next();
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
