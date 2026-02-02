import express from "express";
import { getRoomMessages } from "../controllers/chat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:roomId", authMiddleware, getRoomMessages);

export default router;