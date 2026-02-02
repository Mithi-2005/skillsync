import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: ["project", "hackathon"],
            required: true
        },

        scope: {
            type: String,
            enum: ["public", "college"],
            default: "public"
        },

        skillsRequired: {
            type: [String],
            default: []
        },

        teamSize: {
            type: Number,
            default: 1
        },

        isOpen: {
            type: Boolean,
            default: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        media: [
            {
                type: {
                    type: String,
                    enum: ["image", "video", "pdf"],
                    required: true
                },
                url: {
                    type: String,
                    required: true
                },
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            }
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        comments: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: String,
                createdAt: { type: Date, default: Date.now },
                replies: [
                    {
                        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                        text: String,
                        createdAt: { type: Date, default: Date.now }
                    }
                ]
            }
        ],

        roomEnabled: {
            type: Boolean,
            default: false,
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null,
        }
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;