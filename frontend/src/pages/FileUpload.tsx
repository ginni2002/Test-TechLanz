import { useCallback, useState } from "react";
import { Upload, Trash2, Eye, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileMetadata } from "../types/file";
import { api, API_BASE_URL } from "../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProgressBar } from "./ProgressBar";
import { ImagePreview } from "./ImagePreview";

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery<FileMetadata[]>({
    queryKey: ["files"],
    queryFn: api.getAllFiles,
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      storageType,
    }: {
      file: File;
      storageType: "local" | "cloud" | "both";
    }) => api.uploadFile(file, storageType, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: api.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const handleUpload = useCallback(
    async (storageType: "local" | "cloud" | "both") => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,application/pdf";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          setUploading(true);
          await uploadMutation.mutateAsync({ file, storageType });
        } finally {
          setUploading(false);
        }
      };

      input.click();
    },
    [uploadMutation]
  );

  const handleDownload = async (file: FileMetadata) => {
    try {
      const blob = await api.downloadFile(file._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePreview = (file: FileMetadata) => {
    const isImage = file.mimeType.startsWith("image/");
    if (isImage) {
      const url = file.cloudUrl || `${API_BASE_URL}/uploads/${file.filename}`;
      setPreviewImage({ url, name: file.originalName });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 space-x-4">
        <Button onClick={() => handleUpload("local")} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Locally
        </Button>

        <Button
          onClick={() => handleUpload("cloud")}
          disabled={uploading}
          variant="secondary"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload to Cloud
        </Button>

        <Button
          onClick={() => handleUpload("both")}
          disabled={uploading}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Both
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={files.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                files.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  bulkDeleteMutation.mutate(files.map((file) => file._id))
                }
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {uploading && (
        <div className="mb-4">
          <ProgressBar progress={uploadProgress} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          files.map((file) => (
            <Card key={file._id} className="overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex-grow">
                  <h3 className="font-medium">{file.originalName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.storageType}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {file.mimeType.startsWith("image/") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(file._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {previewImage && (
        <ImagePreview
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          fileName={previewImage.name}
        />
      )}
    </div>
  );
}
