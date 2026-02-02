import Room from "../schemas/rooms.schema.js";
import User from "../schemas/user.schema.js";

export const getSuggestedUsers = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.userId;
        
        const room = await Room.findById(roomId).populate("post");
        if (!room) return res.status(404).json({ message: "Room not found" });

        if (room.admin.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const rawSkills = room.post.skillsRequired || [];
        const requiredSkills = rawSkills.map((s) => s.trim().toLowerCase());

        const adminId = room.admin?._id ? room.admin._id.toString() : room.admin.toString();
        const memberIds = (room.members || []).map(m => 
            m.user?._id ? m.user._id.toString() : m.user.toString()
        );
        const excludedIds = [adminId, ...memberIds];

        const candidates = await User.find({
            _id: { $nin: excludedIds },
            skills: { $exists: true, $ne: [] }
        }).select("name skills email profilePic");

        const suggestions = candidates.map((user) => {
            let totalRawScore = 0;
            const matchedSkillsDetails = [];

            if (user.skills && Array.isArray(user.skills)) {
                user.skills.forEach((userSkill) => {
                    if (!userSkill.name) return;
                    const uSkillName = userSkill.name.trim().toLowerCase();

                    const isMatch = requiredSkills.some((reqSkill) => {
                        return uSkillName === reqSkill || 
                               uSkillName.includes(reqSkill) || 
                               reqSkill.includes(uSkillName);
                    });

                    if (isMatch) {
                        const sScore = userSkill.score || 0;
                        totalRawScore += sScore;
                        matchedSkillsDetails.push({ 
                            name: userSkill.name, 
                            score: sScore 
                        });
                    }
                });
            }

            const count = matchedSkillsDetails.length;
            const meanScore = count > 0 ? Math.round(totalRawScore / count) : 0;

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                matchScore: meanScore,
                matchedSkillsCount: count,
                matchedSkills: matchedSkillsDetails
            };
        })
        .filter((u) => u.matchedSkillsCount > 0)
        .sort((a, b) => {
            if (b.matchedSkillsCount !== a.matchedSkillsCount) {
                return b.matchedSkillsCount - a.matchedSkillsCount;
            }
            return b.matchScore - a.matchScore;
        })
        .slice(0, 5);

        return res.status(200).json({
            suggestions,
            note: suggestions.length === 0
                ? "No candidates matched. Try simpler skill names."
                : undefined
        });
    }
    catch (error) {
        console.error("Suggestion Error:", error);
        return res.status(500).json({
            message: "Failed to fetch recommendations",
            error: error.message
        });
    }
};