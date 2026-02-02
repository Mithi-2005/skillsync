import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./chatwindow.css";

const SOCKET_URL = "https://skillsync-backend-2mw0.onrender.com"; 

function ChatWindow({ roomId, currentUser }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  
  const [typingUsers, setTypingUsers] = useState([]); 

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null); 

  useEffect(() => {
    if (!roomId) return;
    const newSocket = io.connect(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit("join_room", roomId);

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      setTypingUsers((prev) => prev.filter(u => u._id !== data.sender._id));
    });

    newSocket.on("display_typing", (user) => {
      setTypingUsers((prev) => {
        if (prev.some(u => u._id === user._id)) return prev;
        return [...prev, user];
      });

      setTimeout(() => {
         setTypingUsers((prev) => prev.filter(u => u._id !== user._id));
      }, 3000);
    });

    return () => newSocket.disconnect();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/chat/${roomId}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]); 

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);

    if (socket) {
        socket.emit("typing", { 
            room: roomId, 
            user: { _id: currentUser.id, name: currentUser.name, profilePic: currentUser.profilePic } 
        });
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== "" && socket) {
      const messageData = {
        room: roomId,
        authorId: currentUser.id,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <h3>Team Chat</h3>
        <span className="live-indicator">● Live</span>
      </div>

      <div className="chat-body">
        {messages.map((msg, index) => {
          const isMe = msg.sender._id === currentUser.id || msg.sender === currentUser.id;
          return (
            <div key={index} className={`message-row ${isMe ? "you" : "other"}`}>
              {!isMe && (
                <div className="chat-avatar">
                   {msg.sender.profilePic ? <img src={msg.sender.profilePic} alt="" /> : (msg.sender.name?.charAt(0) || "U")}
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble"><p>{msg.text}</p></div>
                <div className="message-meta">
                  {!isMe && <span className="sender-name">{msg.sender.name} • </span>}
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
            <div className="typing-indicator-container">
                {typingUsers.map(user => (
                    <div key={user._id} className="typing-row">
                        <div className="chat-avatar small">
                            {user.profilePic ? <img src={user.profilePic} alt="" /> : (user.name?.charAt(0) || "U")}
                        </div>
                        <div className="typing-bubble">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={handleInputChange} 
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default ChatWindow;