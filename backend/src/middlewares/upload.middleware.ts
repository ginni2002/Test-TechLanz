import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";
import { config, AllowedFileType } from "../config/config";
import { AppError } from "../utils/errors";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!config.allowedFileTypes.includes(file.mimetype as AllowedFileType)) {
    cb(new AppError(400, "File type not allowed"));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.fileSize, // 5MB
  },
  fileFilter: fileFilter,
});
