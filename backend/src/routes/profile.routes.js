import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadResume, updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-resume", authMiddleware, upload.single("resume"), uploadResume);
router.put("/edit", authMiddleware, updateProfile);

export default router;
