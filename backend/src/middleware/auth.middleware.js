import { verifyToken } from "../utils/token.js";

const authMiddleware = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization failed - [Missing token]"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token - [...Please login again...]",
        });
    }
};

export default authMiddleware;