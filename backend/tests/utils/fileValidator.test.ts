import { FileValidator } from "../../src/utils/fileValidator";

describe("FileValidator", () => {
  describe("validateFileName", () => {
    it("should accept valid filenames", () => {
      const validNames = [
        "test.jpg",
        "my-image.png",
        "document_1.pdf",
        "screenshot 2024.jpg",
      ];

      validNames.forEach((name) => {
        expect(FileValidator.validateFileName(name)).toBe(true);
      });
    });

    it("should reject invalid filenames", () => {
      const invalidNames = [
        "", // empty string
        "test/file.jpg", // contains slash
        "image*.png", // contains asterisk
        "a".repeat(256), // too long
      ];

      invalidNames.forEach((name) => {
        expect(FileValidator.validateFileName(name)).toBe(false);
      });
    });
  });

  describe("validateFileSize", () => {
    it("should accept files within size limit", () => {
      const validSizes = {
        "image/jpeg": 4 * 1024 * 1024, // 4MB
        "image/png": 3 * 1024 * 1024, // 3MB
        "application/pdf": 8 * 1024 * 1024, // 8MB
      };

      Object.entries(validSizes).forEach(([mimeType, size]) => {
        expect(FileValidator.validateFileSize(size, mimeType)).toBe(true);
      });
    });

    it("should reject files exceeding size limit", () => {
      const invalidSizes = {
        "image/jpeg": 6 * 1024 * 1024, // 6MB
        "image/png": 10 * 1024 * 1024, // 10MB
        "application/pdf": 11 * 1024 * 1024, // 11MB
      };

      Object.entries(invalidSizes).forEach(([mimeType, size]) => {
        expect(FileValidator.validateFileSize(size, mimeType)).toBe(false);
      });
    });
  });

  describe("getReadableFileSize", () => {
    it("should format file sizes correctly", () => {
      const cases = [
        { input: 512, expected: "512.00 B" },
        { input: 1024, expected: "1.00 KB" },
        { input: 1024 * 1024, expected: "1.00 MB" },
        { input: 1.5 * 1024 * 1024, expected: "1.50 MB" },
      ];

      cases.forEach(({ input, expected }) => {
        expect(FileValidator.getReadableFileSize(input)).toBe(expected);
      });
    });
  });
});
