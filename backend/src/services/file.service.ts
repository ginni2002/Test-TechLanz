import { File, IFile } from "../models/file.model";

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
      const file = new File(fileData);
      await file.save();
      return file;
    } catch (error) {
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
}
