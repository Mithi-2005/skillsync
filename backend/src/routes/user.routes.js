import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { updateProfilePic } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/profile-pic", authMiddleware, upload.single("file"), updateProfilePic);

export default router;
