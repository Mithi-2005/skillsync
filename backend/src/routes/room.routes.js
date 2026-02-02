import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createRoomLater, getActiveRooms, applyToRoom, handleApplication, getMyRooms, getRoomDetails, joinRoomByCode, sendRoomInvitation, getMyInvitations, updateInvitationStatus } from "../controllers/room.controller.js";
import { getSuggestedUsers } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getActiveRooms);
router.post("/create", authMiddleware, createRoomLater);
router.post("/:roomId/request", authMiddleware, applyToRoom);
router.put("/:roomId/applications/:applicationId", authMiddleware, handleApplication);
router.get("/my_rooms", authMiddleware, getMyRooms);
router.get("/my_invitations", authMiddleware, getMyInvitations);
router.get("/:roomId", authMiddleware, getRoomDetails);
router.post("/:roomId/invite/:userId", authMiddleware, sendRoomInvitation);
router.patch("/:roomId/my_invitations/:invitationId", authMiddleware, updateInvitationStatus);
router.post("/join-by-code/", authMiddleware, joinRoomByCode);
router.get( "/:roomId/suggestions", authMiddleware, getSuggestedUsers);

export default router;
