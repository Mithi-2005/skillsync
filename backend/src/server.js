import "./envloader.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import http from "http";
import Message from "./schemas/message.schema.js";

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data.user);
  });

  socket.on("send_message", async (data) => {
    try {

      const newMessage = new Message({
        room: data.room,
        sender: data.authorId,
        text: data.message,
      });
      await newMessage.save();

      await newMessage.populate("sender", "name profilePic");

      io.to(data.room).emit("receive_message", newMessage);
      
    } catch (err) {
      console.error("Socket Error:", err);
    }
  });

  socket.on("disconnect", () => {
  });
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server (HTTP + Socket) running on http://localhost:${PORT}`);
});