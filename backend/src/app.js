import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import roomRoutes from "./routes/room.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use("/", userRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/rooms", roomRoutes);
app.use("/chat", chatRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("SkillSync API running");
});

export default app;
