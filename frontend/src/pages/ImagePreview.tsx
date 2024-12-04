import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
}

export const ImagePreview = ({
  isOpen,
  onClose,
  imageUrl,
  fileName,
}: ImagePreviewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="text-lg font-semibold">{fileName}</DialogTitle>
        <div className="p-4">
          <img
            src={imageUrl}
            alt={fileName}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
