import Post from "../schemas/post.schema.js";
import cloudinary from "../config/cloudinary.js";
import { createRoom } from "../utils/createRoom.js";


export const createPost = async(req, res) => {
    try{
        const { title, description, category, scope, skillsRequired, teamSize, roomEnabled } = req.body;

        const isRoomEnabled = roomEnabled === true || roomEnabled === "true";

        if (!title || !description || !category) {
            console.log(`[ERROR] Title, description and category fields are required.`)
            return res.status(400).json({
                message: "Title, description and category fields are required."
            });
        }

        let mediaArray = [];

        if (req.files && req.files.length > 0) {
            for (const  file of req.files) {
                const mimeType = file.mimetype;
                let resourceType = "image";
                let mediaType = "image";

                if (mimeType.startsWith("video")) {
                    resourceType = "video";
                    mediaType = "video";
                }
                else if (mimeType === "application/pdf") {
                    resourceType = "raw";
                    mediaType = "pdf";
                }

                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader
                    .upload_stream({ resource_type: resourceType}, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    })
                    .end(file.buffer);
                });

                mediaArray.push({
                    type: mediaType,
                    url: result.secure_url,
                    uploadedBy: req.user.userId
                });
            }
        }

        let skills = [];
        if (skillsRequired) {
            try {
                skills = Array.isArray(skillsRequired)
                  ? skillsRequired
                  : JSON.parse(skillsRequired);
            } 
            catch {
                skills = skillsRequired.split(",").map((s) => s.trim());
            }
        }

        const post = await Post.create({
            title,
            description,
            category,
            scope,
            skillsRequired: skills,
            teamSize,
            roomEnabled: isRoomEnabled,
            createdBy: req.user.userId,
            media: mediaArray
        });

        console.log(`[INFO] Post Created..`)

        if (isRoomEnabled) {
          await createRoom(post, req.user.userId);
          console.log(`[INFO] Room Created..`)
        }
        
        return res.status(201).json({
            message: "Post created successfully",
            post
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
};


export const getAnnouncements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const announcements = await Post.find({
      category: { $in: ["project", "hackathon"] },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profilePic college")
      .populate("comments.user", "name profilePic")
      .populate("comments.replies.user", "name profilePic")
      .populate({
        path: "room",
        select: "members applications status",
      });

    const enrichedAnnouncements = announcements.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      isLikedByCurrentUser: post.likes.some(
        (id) => id.toString() === userId
      ),
    }));

    return res.status(200).json({
      announcements: enrichedAnnouncements,
    });
  }
  catch (error) {
    return res.status(500).json({
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};


export const getRooms = async (req, res) => {
    try{
        const posts = await Post.find({ isOpen: true })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email");

        return res.status(200).json(posts);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch rooms",
            error: error.message
        });
    }
};


export const toggleLikePost = async (req, res) => {
    try{
        const { postId } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message : "Post not found"});
        }

        if (post.createdBy.toString() === userId) {
            return res.status(403).json({
                message: "You cannot like or unlike your own post"
            });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );
        }
        else {
            post.likes.push(userId);
        }

        await post.save();

        return res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            liked: !alreadyLiked,
            likesCount: post.likes.length
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to like/unlike post",
            error: error.message
        });
    }
};


export const addCommentToPost = async (req, res) => {
    try{
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                message: "Empty comment cannot be delivered"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const newComment = {
            user: userId,
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        await post.populate("comments.user", "name profilePic");

        return res.status(201).json({
            message: "Comment added successfully",
            comments: post.comments
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to comment",
            error: error.message
        });
    }
};


export const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Reply text is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.replies.push({
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();
    await post.populate("comments.replies.user", "name");

    return res.status(201).json({
      message: "Reply added successfully",
      comment,
    });
  } 
  catch (error) {
    res.status(500).json({
      message: "Failed to add reply",
      error: error.message,
    });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        message: "You can delete only your own comment",
      });
    }

    comment.remove();
    await post.save();

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};


export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.user.toString() !== userId) {
      return res.status(403).json({
        message: "You can delete only your own reply",
      });
    }

    reply.remove();
    await post.save();

    return res.status(200).json({
      message: "Reply deleted successfully",
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Failed to delete reply",
      error: error.message,
    });
  }
};


export const getMyPostsWithoutRoom = async (req, res) => {
  try {
    const userId = req.user.userId;

    const posts = await Post.find({
      createdBy: userId,
      roomEnabled: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};
