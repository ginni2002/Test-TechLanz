import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  storageType: "local" | "cloud" | "both";
  cloudUrl?: string;
  uploadedAt: Date;
}

const fileSchema = new Schema<IFile>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  storageType: {
    type: String,
    required: true,
    enum: ["local", "cloud", "both"],
  },
  cloudUrl: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export const File = mongoose.model<IFile>("File", fileSchema);
