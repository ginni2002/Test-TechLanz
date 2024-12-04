import axios from "axios";
import { FileMetadata } from "../types/file";

export const API_BASE_URL = "http://localhost:5000/api";

export const api = {
  uploadFile: async (
    file: File,
    storageType: "local" | "cloud" | "both",
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/files/upload/${storageType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },

  getAllFiles: async (): Promise<FileMetadata[]> => {
    const response = await axios.get(`${API_BASE_URL}/files`);
    return response.data.data.files;
  },

  deleteFile: async (fileId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/files/${fileId}`);
    return response.data;
  },

  bulkDelete: async (fileIds: string[]) => {
    const response = await axios.post(`${API_BASE_URL}/files/bulk-delete`, {
      fileIds,
    });
    return response.data;
  },

  downloadFile: async (fileId: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/files/${fileId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
