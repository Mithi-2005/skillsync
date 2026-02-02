import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            reuired: true,
            trim: true
        },
        
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        college: {
            type: String,
            required: false,
            default: "",
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

       skills: [
            {
                name: {
                    type: String,
                    required: true,
                },
                score: {
                    type: Number,
                    required: true,
                },
                category: {
                    type: String,
                    required: true,
                },
                source: {
                    type: String,
                    enum: ["resume", "github", "manual", 'resume_analysis'],
                    default: "resume",
                },
            },
        ],

        profilePic: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        }

    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;