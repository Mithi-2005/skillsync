import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createPost, getAnnouncements, getRooms, toggleLikePost, addCommentToPost, replyToComment, deleteComment, deleteReply, getMyPostsWithoutRoom } from "../controllers/post.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, upload.array("files", 5), createPost);
router.get("/announcements", authMiddleware, getAnnouncements);
router.get( "/my-posts", authMiddleware, getMyPostsWithoutRoom );
router.get("/rooms",authMiddleware, getRooms);
router.post("/:postId/like", authMiddleware, toggleLikePost);
router.post("/:postId/comments", authMiddleware, addCommentToPost);
router.post("/:postId/comments/:commentId/reply", authMiddleware, replyToComment);
router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);
router.delete("/:postId/comments/:commentId/replies/:replyId", authMiddleware, deleteReply);

export default router;
