import bcrypt from "bcrypt";
import User from "../schemas/user.schema.js";
import cloudinary from "../config/cloudinary.js";
import { genrateToken } from "../utils/token.js";

export const signup = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            console.log(`[ERROR] Inputs are missing....!`)
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        let profilePicUrl = undefined;

        if(req.file) {

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader
                .upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
                .end(req.file.buffer);
            });

            profilePicUrl = result.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profilePic: profilePicUrl
        });
        console.log(`[SUCCESS] Signup successful..!!!`)
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            },
        });
    }
    catch (error) {
        console.log(`[ERROR] Error occured - ${error.message}`);
        return res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            console.log(`[ERROR] All fields are required..!`);
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne( {email }).select("+password");
        if (!user) {
            console.log(`[ERROR] Error occured - ${error.message}`);
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }

        const token = genrateToken(user._id);

        return res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                skills: user.skills || [],
                college: user.college || "",
            }
        });
    }
    catch (error) {
        console.log(`[ERROR] Error occured - ${error.message}`);
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};