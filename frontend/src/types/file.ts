export interface FileMetadata {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  storageType: "local" | "cloud" | "both";
  cloudUrl?: string;
  uploadedAt: string;
}
