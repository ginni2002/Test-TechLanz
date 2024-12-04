import { Buffer } from "buffer";

export class FileValidator {
  private static readonly fileSignatures = {
    "image/jpeg": [
      [0xff, 0xd8, 0xff, 0xe0],
      [0xff, 0xd8, 0xff, 0xe1],
    ],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  };

  static readonly maxSizes = {
    "image/jpeg": 5 * 1024 * 1024, // 5MB
    "image/png": 5 * 1024 * 1024, // 5MB
    "application/pdf": 10 * 1024 * 1024, // 10MB
  };

  static validateFileType(buffer: Buffer, mimeType: string): boolean {
    const signatures =
      this.fileSignatures[mimeType as keyof typeof this.fileSignatures];
    if (!signatures) return false;

    const fileHeader = [...buffer.slice(0, 4)];
    return signatures.some((signature) =>
      signature.every((byte, index) => byte === fileHeader[index])
    );
  }

  static validateFileSize(size: number, mimeType: string): boolean {
    const maxSize = this.maxSizes[mimeType as keyof typeof this.maxSizes];
    return maxSize ? size <= maxSize : false;
  }

  static getReadableFileSize(size: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  }

  static validateFileName(fileName: string): boolean {
    const validNameRegex = /^[a-zA-Z0-9-_. ]+$/;
    const maxLength = 255;

    return (
      validNameRegex.test(fileName) &&
      fileName.length > 0 &&
      fileName.length <= maxLength
    );
  }
}
