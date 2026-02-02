import Message from "../schemas/message.schema.js";

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = await Message.find({ room: roomId })
      .populate("sender", "name profilePic") 
      .sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};