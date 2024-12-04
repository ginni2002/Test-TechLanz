import { Request, Response, NextFunction } from "express";
import { FileService } from "../services/file.service";
import { AppError } from "../utils/errors";
import { StorageService } from "../services/storage.service";
import fs from "fs";
import { supabase } from "../utils/supabase";

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

  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const file = await FileService.getFileById(id);

      if (!file) {
        throw new AppError(404, "File not found");
      }

      if (file.storageType === "cloud" || file.storageType === "both") {
        await StorageService.deleteFromCloud(file.filename);
      }

      const deletedFile = await FileService.deleteFile(id);

      res.status(200).json({
        status: "success",
        message: "File deleted successfully",
        data: {
          file: deletedFile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileIds } = req.body;

      if (!Array.isArray(fileIds)) {
        throw new AppError(400, "fileIds must be an array");
      }

      const results = {
        successful: [] as string[],
        failed: [] as { id: string; error: string }[],
      };

      for (const id of fileIds) {
        try {
          const file = await FileService.getFileById(id);

          if (file) {
            if (file.storageType === "cloud" || file.storageType === "both") {
              await StorageService.deleteFromCloud(file.filename);
            }

            await FileService.deleteFile(id);
            results.successful.push(id);
          } else {
            results.failed.push({ id, error: "File not found" });
          }
        } catch (error) {
          results.failed.push({
            id,
            error: error instanceof AppError ? error.message : "Unknown error",
          });
        }
      }

      res.status(200).json({
        status: "success",
        message: "Bulk delete completed",
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await FileService.getFileById(id);

      if (!file) {
        throw new AppError(404, "File not found");
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );

      if (file.storageType === "cloud" || file.storageType === "both") {
        const { data, error } = await supabase.storage
          .from("files")
          .download(file.filename);

        if (error || !data) {
          throw new AppError(500, "Error downloading file from cloud storage");
        }

        const buffer = await data.arrayBuffer();
        res.send(Buffer.from(buffer));
      } else {
        res.sendFile(file.path, { root: "." });
      }
    } catch (error) {
      next(error);
    }
  }
}
