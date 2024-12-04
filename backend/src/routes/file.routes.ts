import { Router } from "express";
import { FileController } from "../controllers/file.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/upload/local", upload.single("file"), FileController.uploadLocal);
router.post("/upload/cloud", upload.single("file"), FileController.uploadCloud);
router.post("/upload/both", upload.single("file"), FileController.uploadBoth);
router.get("/:id", FileController.getFile);
router.get("/", FileController.getAllFiles);

export default router;
