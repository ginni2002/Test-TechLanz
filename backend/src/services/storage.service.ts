import fs from "fs";
import { supabase } from "../utils/supabase";
import { AppError } from "../utils/errors";
import fetch from "node-fetch";
import { logger } from "../utils/logger";

export class StorageService {
  private static readonly BUCKET_NAME = "files";

  static async uploadToCloud(
    filePath: string,
    filename: string
  ): Promise<string> {
    try {
      logger.info(`Starting cloud upload for file: ${filename}`);
      const fileBuffer = fs.readFileSync(filePath);

      //   console.log("Attempting to upload to bucket:", this.BUCKET_NAME);
      //   console.log("File details:", {
      //     filename,
      //     size: fileBuffer.length,
      //   });
      console.log("Starting upload process...");

      const { data, error: signedURLError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUploadUrl(filename);

      if (signedURLError || !data) {
        console.error("Error getting signed URL:", signedURLError);
        throw new AppError(
          500,
          `Error getting signed URL: ${
            signedURLError?.message || "No data returned"
          }`
        );
      }

      console.log("Got signed URL:", data.signedUrl);

      const uploadResponse = await fetch(data.signedUrl, {
        method: "PUT",
        body: fileBuffer,
        headers: {
          "Content-Type": "application/octet-stream",
          "x-upsert": "true",
        },
        timeout: 30000, // 30s
      });

      if (!uploadResponse.ok) {
        throw new AppError(
          500,
          `Upload failed with status: ${uploadResponse.status}`
        );
      }

      console.log("Upload successful, path:", data.path);

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      logger.info(`Successfully uploaded file to cloud: ${filename}`);

      return urlData.publicUrl;
    } catch (error) {
      logger.error(`Cloud upload failed for ${filename}:`, error);
      throw error;
    }
  }

  static async deleteFromCloud(filename: string): Promise<void> {
    try {
      logger.info(`Starting cloud delete for file: ${filename}`);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filename]);

      if (error) {
        console.error("Supabase delete error:", error);
        throw new AppError(
          500,
          `Error deleting from Supabase: ${error.message}`
        );
      }

      logger.info(`Successfully deleted file from cloud: ${filename}`);
    } catch (error) {
      logger.error(`Cloud delete failed for ${filename}:`, error);
      throw error;
    }
  }
}
