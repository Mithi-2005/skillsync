import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("file"), signup);
router.post("/login", login);

export default router