import { Request, Response, NextFunction } from "express";
import { FileService } from "../services/file.service";
import { AppError } from "../utils/errors";
import { StorageService } from "../services/storage.service";
import fs from "fs";

export class FileController {
  static async uploadLocal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded");
      }

      const file = await FileService.createFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        storageType: "local",
      });

      res.status(201).json({
        status: "success",
        data: {
          file,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadCloud(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded");
      }

      const cloudUrl = await StorageService.uploadToCloud(
        req.file.path,
        req.file.filename
      );

      const file = await FileService.createFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        storageType: "cloud",
        cloudUrl,
      });

      fs.unlinkSync(req.file.path);

      res.status(201).json({
        status: "success",
        data: {
          file,
        },
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  static async uploadBoth(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded");
      }

      const cloudUrl = await StorageService.uploadToCloud(
        req.file.path,
        req.file.filename
      );

      const file = await FileService.createFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        storageType: "both",
        cloudUrl,
      });

      res.status(201).json({
        status: "success",
        data: {
          file,
        },
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await FileService.getFileById(id);

      if (!file) {
        throw new AppError(404, "File not found");
      }

      res.status(200).json({
        status: "success",
        data: {
          file,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const files = await FileService.getAllFiles();

      res.status(200).json({
        status: "success",
        data: {
          files,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
