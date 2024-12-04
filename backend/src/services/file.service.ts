import { File, IFile } from "../models/file.model";
import fs from "fs";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

interface FileData {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  storageType: "local" | "cloud" | "both";
  cloudUrl?: string;
}

export class FileService {
  static async createFile(fileData: FileData): Promise<IFile> {
    try {
      logger.info(`Creating file record: ${fileData.filename}`);
      const file = new File(fileData);
      await file.save();
      logger.info(`File record created successfully: ${file._id}`);
      return file;
    } catch (error) {
      logger.error(`File record creation failed:`, error);
      throw error;
    }
  }

  static async getFileById(fileId: string): Promise<IFile | null> {
    try {
      return await File.findById(fileId);
    } catch (error) {
      throw error;
    }
  }

  static async getAllFiles(): Promise<IFile[]> {
    try {
      return await File.find().sort({ uploadedAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<IFile> {
    try {
      const file = await File.findById(fileId);

      if (!file) {
        throw new AppError(404, "File not found");
      }

      await file.deleteOne();

      if (file.storageType === "local" || file.storageType === "both") {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      return file;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, "Error deleting file");
    }
  }
}
