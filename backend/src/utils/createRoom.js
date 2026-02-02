import { generateRoomCode } from "./generateRoomCode.js";
import Room from "../schemas/rooms.schema.js";
import Post from "../schemas/post.schema.js";

export const createRoom = async (post, userId) => {
    if (post.createdBy.toString() !== userId) {
        throw new Error("Only post owner can create a room");
    }

    if (post.room) {
        throw new Error("Room already exists for this post");
    }

    const roomCode = await generateRoomCode();

    const room = await Room.create({
        post: post._id,
        admin: userId,
        roomCode,
        teamSize: post.teamSize,
        members: [
            {
                user: userId,
                role: "admin"
            },
        ],
    });

    post.roomEnabled = true;
    post.room = room._id;
    await post.save();

    return room;
};