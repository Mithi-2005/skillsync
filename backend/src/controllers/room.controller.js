import Post from "../schemas/post.schema.js";
import Room from "../schemas/rooms.schema.js";
import User from "../schemas/user.schema.js";
import { createRoom } from "../utils/createRoom.js";


export const createRoomLater = async (req, res) => {
    try{
        const { postId } = req.body;
        const userId = req.user.userId;
        
        if (!postId) {
            return res.status(400).json({
                message: "Post ID is required"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.roomEnabled) {
            return res.status(400).json({
                message: "Room already exists for this post",
            });
        }

        const room = await createRoom(post, userId);

        return res.status(201).json({
            message: "Room created successfully",
            room: {
                id: room._id,
                roomCode: room.roomCode,
                status: room.status
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};


export const getActiveRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: "open" })
      .populate({
        path: "post",
        select: "title description category skillsRequired teamSize scope createdAt",
        populate: {
          path: "createdBy",
          select: "name profilePic",
        },
      })
      .populate("members.user", "_id") 
      .populate("applications.user", "_id") 
      .sort({ createdAt: -1 });

    const formattedRooms = rooms.map((room) => ({
      roomId: room._id,              
      status: room.status,
      teamSize: room.teamSize,
      membersCount: room.members.length,
      admin: room.admin,
      members: room.members,         
      applications: room.applications,
      post: room.post,
      createdAt: room.createdAt,
    }));

    return res.status(200).json({
      rooms: formattedRooms,
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to fetch active rooms",
      error: error.message,
    });
  }
};


export const applyToRoom = async (req, res) => {
  try{
    const { roomId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({
        message: "Resume required to request joining a room",
        requiredResume: true
      });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        message: "Room not found"
      });
    }

    if (room.status !== "open") {
      return res.status(400).json({
        message: "Room is not accepting requests"
      });
    }

    if (room.admin.toString() === userId) {
      return res.status(400).json({
        message: "You cannot apply to your own room"
      });
    }

    const isMember = room.members.some(
      (m) => m.user.toString() === userId
    );
    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this room"
      });
    }

    const applied = room.applications.some(
      (app) => app.user.toString() === userId
    );
    if (applied) {
      return res.status(400).json({
        message: "You have already applied to this room"
      });
    }

    room.applications.push({
      user: userId,
      message: message?.trim() || "",
      status: "pending"
    });

    await room.save();

    return res.status(201).json({
      message: "Request to join sent successfully"
    });
  }
  catch (error) {
    return res.status(500).json({
      message: "Failed to request to room",
      error: error.message
    });
  }
};


export const handleApplication = async (req, res) => {
  try {
    const { roomId, applicationId } = req.params;
    const { action } = req.body;
    const userId = req.user.userId;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Use accept or reject",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only room admin can manage applications",
      });
    }

    const application = room.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "Application already processed",
      });
    }

    if (action === "accept") {
      const alreadyMember = room.members.some(
        (m) => m.user.toString() === application.user.toString()
      );

      if (!alreadyMember) {
        room.members.push({
          user: application.user,
          role: "member",
        });
      }

      application.status = "accepted";

      if (room.members.length >= room.teamSize) {
        room.status = "full";
        await Post.findByIdAndUpdate(room.post, { isOpen: false });
      }
    }

    if (action === "reject") {
      application.status = "rejected";
    }

    await room.save();

    return res.status(200).json({
      message:
        action === "accept"
          ? "User added to room"
          : "Application rejected",
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to process application",
      error: error.message,
    });
  }
};


export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user.userId;

    const rooms = await Room.find({
      $or: [
        { admin: userId },
        { "members.user": userId },
        { "applications.user": userId },
      ],
    })
      .populate({
        path: "post",
        select: "title description category skillsRequired teamSize",
      })
      .populate("members.user", "name profilePic")
      .populate("applications.user", "name profilePic")
      .sort({ createdAt: -1 });

    const requested = [];
    const active = [];
    const owned = [];

    rooms.forEach((room) => {
      if (room.admin.toString() === userId) {
        owned.push({
          roomId: room._id,
          roomCode: room.roomCode,
          status: room.status,
          teamSize: room.teamSize,
          members: room.members,
          applications: room.applications.filter(
            (app) => app.status === "pending"
          ),
          post: room.post,
        });
        return;
      }

      const isMember = room.members.some(
        (m) => m.user._id.toString() === userId
      );
      if (isMember) {
        active.push({
          roomId: room._id,
          roomCode: room.roomCode,
          status: room.status,
          teamSize: room.teamSize,
          membersCount: room.members.length,
          post: room.post,
        });
        return;
      }

      const hasPendingRequest = room.applications.some(
        (app) =>
          app.user._id.toString() === userId &&
          app.status === "pending"
      );

      if (hasPendingRequest) {
        requested.push({
          roomId: room._id,
          status: room.status,
          post: room.post,
        });
      }
    });

    return res.status(200).json({
      requested,
      active,
      owned,
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to fetch my rooms",
      error: error.message,
    });
  }
};


export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Room.findById(roomId)
      .populate({
        path: "post",
        select: "title description category skillsRequired teamSize createdBy",
        populate: {
          path: "createdBy",
          select: "name profilePic",
        },
      })
      .populate("members.user", "name profilePic")
      .populate("applications.user", "name profilePic")
      .select("+invitations");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isAdmin = room.admin.toString() === userId;
    const isMember = room.members.some(
      (m) => m.user._id.toString() === userId
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this room",
      });
    }

    return res.status(200).json({
      roomId: room._id,
      status: room.status,
      teamSize: room.teamSize,
      roomCode: room.roomCode,
      post: room.post,
      members: room.members,
      applications: isAdmin
        ? room.applications.filter((a) => a.status === "pending")
        : [],
      admin: room.admin.toString(),
      invitations: room.invitations
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to fetch room details",
      error: error.message,
    });
  }
};


export const joinRoomByCode = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.userId;

    if (!roomCode) {
      return res.status(400).json({
        message: "Room code is required",
      });
    }

    const room = await Room.findOne({ roomCode })
      .populate({
        path: "post",
        select: "title description category skillsRequired teamSize",
        populate: {
          path: "createdBy",
          select: "name profilePic",
        },
      });

    if (!room) {
      return res.status(404).json({
        message: "Invalid room code",
      });
    }

    const isAdmin = room.admin.toString() === userId;
    const isMember = room.members.some(
      (m) => m.user.toString() === userId
    );

    return res.status(200).json({
      roomId: room._id,
      status: room.status,
      isAdmin,
      isMember,
      post: room.post,
      teamSize: room.teamSize,
      membersCount: room.members.length,
      canApply:
        room.status === "open" && !isAdmin && !isMember,
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to join room by code",
      error: error.message,
    });
  }
};


export const sendRoomInvitation = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found in request" });
    }

    const adminId = req.user.userId;


    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    
    if (room.admin.toString() !== adminId) {
      return res.status(403).json({ message: "Only admin can invite" });
    }

    if (!room.invitations) {
        console.log("Debug - Invitations array is undefined. Check Schema!");
        room.invitations = [];
    }

    const alreadyInvited = room.invitations.some(
      (i) => i.user.toString() === userId
    );
    const alreadyMember = room.members.includes(userId);

    if (alreadyInvited || alreadyMember) {
      return res.status(400).json({
        message: "User already invited or member",
      });
    }

    room.invitations.push({ user: userId });
    await room.save();

    res.status(200).json({ message: "Invitation sent" });
    
  } catch (error) {
    console.error("SERVER CRASH ERROR:", error); 
    res.status(500).json({
      message: "Failed to send invitation",
      error: error.message,
    });
  }
};


export const getMyInvitations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const rooms = await Room.find({
      invitations: {
        $elemMatch: {
          user: userId,
          status: "pending"
        }
      }
    }).populate("post");

    const invitations = rooms.map((room) => {
      const invite = room.invitations.find(
        (i) => i.user.toString() === userId
      );

      if (!invite || invite.status !== 'pending') return null;

      return {
        roomId: room._id,
        post: room.post,
        invitationId: invite._id,
        status: invite.status 
      };
    }).filter(item => item !== null); 

    res.status(200).json({ invitations });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      message: "Failed to fetch invitations",
      error: error.message,
    });
  }
};



export const updateInvitationStatus = async (req, res) => {
  try {
    const { roomId, invitationId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    console.log(`DEBUG: Updating Invite. Room: ${roomId}, InviteID: ${invitationId}, NewStatus: ${status}`);

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const invite = room.invitations.find((i) => i._id.toString() === invitationId);

    if (!invite) {
      console.log("DEBUG: Invitation NOT found in array");
      return res.status(404).json({ message: "Invitation not found" });
    }

    console.log(`DEBUG: Found Invite. Old Status: ${invite.status}`);
    
    if (["accepted", "declined", "rejected"].includes(status)) {
        invite.status = status;
    } else {
        return res.status(400).json({ message: "Invalid status sent" });
    }

    if (status === "accepted") {
      const isAlreadyMember = room.members.some(m => m.user.toString() === userId);
      if (!isAlreadyMember) {
         room.members.push({ user: userId, role: "member" });
      }
    }

    await room.save();
    console.log(`DEBUG: Saved successfully. New Status: ${invite.status}`);

    res.status(200).json({ message: "Status updated", invitation: invite });

  } catch (error) {
    console.error("DEBUG: Update Failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};