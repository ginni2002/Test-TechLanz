import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

export type AllowedFileType = "image/jpeg" | "image/png" | "application/pdf";

export const config = {
  port: process.env.PORT || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  fileSize: 5 * 1024 * 1024,
  allowedFileTypes: [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ] as AllowedFileType[],
};
