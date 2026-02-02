import User from "../schemas/user.schema.js";
import { extractTextFromPDF } from "../utils/pdfToText.js";
import { parseResumeWithAI } from "../ai/resume.parser.js";
import { normalizeSkills } from "../ai/skillNormalizer.js";

export const uploadResume = async (req, res) => {
    try{
        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required"
            });
        }

        const userId = req.user.userId;

        const resumeText = await extractTextFromPDF(req.file.buffer);

        const rawSkills = await parseResumeWithAI(resumeText);

        const finalSkills = await normalizeSkills(rawSkills);

        const user = await User.findByIdAndUpdate(
            userId,
            { skills: finalSkills },
            { new: true }
        ).select("name email skills");

        return res.status(200).json({
            message: "Resume uploaded and skills are extracted successfully",
            skills: user.skills
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to process resume",
            error: error.message
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { name, college } = req.body;
        
        // 1. FIX: Ensure we get the ID correctly from middleware
        const userId = req.user.id || req.user._id || req.user.userId; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user ID found" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. LOGIC: Update name
        if (name) user.name = name;

        // 3. LOGIC: College update with "Lock" feature
        if (college) {
            // Check if current college is empty (handles null, undefined, or empty string)
            const isCollegeEmpty = !user.college || String(user.college).trim() === "";

            if (isCollegeEmpty) {
                user.college = college;
            } else if (String(user.college).trim() !== String(college).trim()) {
                // Block update if they try to change an existing, different name
                return res.status(403).json({ 
                    message: "College name is locked and cannot be changed once set." 
                });
            }
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college,
                profilePic: user.profilePic,
                skills: user.skills
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};