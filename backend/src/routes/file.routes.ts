import { Router } from "express";
import { FileController } from "../controllers/file.controller";
import { upload, validateUploadedFile } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/upload/local",
  upload.single("file"),
  validateUploadedFile,
  FileController.uploadLocal
);
router.post(
  "/upload/cloud",
  upload.single("file"),
  validateUploadedFile,
  FileController.uploadCloud
);
router.post(
  "/upload/both",
  upload.single("file"),
  validateUploadedFile,
  FileController.uploadBoth
);
router.get("/:id", FileController.getFile);
router.get("/", FileController.getAllFiles);
router.delete("/:id", FileController.deleteFile);
router.post("/bulk-delete", FileController.bulkDelete);

router.get("/:id/download", FileController.downloadFile);

export default router;
