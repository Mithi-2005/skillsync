import cloudinary from "../config/cloudinary.js";
import User from "../schemas/user.schema.js";

export const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePic: result.secure_url },
      { new: true }
    );

    return res.status(200).json({
      message: "Profile picture updated",
      profilePic: user.profilePic,
    });
  } 
  catch (error) {
    return res.status(500).json({
      message: "Profile picture update failed",
      error: error.message,
    });
  }
};
