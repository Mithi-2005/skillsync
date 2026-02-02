import { useEffect, useState } from "react";
import { fetchMyPostsWithoutRoom } from "../api/posts";
import { createRoom } from "../api/rooms";
import { useNavigate } from "react-router-dom";
import "./createroom.css";

function CreateRoom() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetchMyPostsWithoutRoom();
        setPosts(res.posts || []);
      } catch (err) {
        showToast("Failed to load eligible posts", "error");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleCreateRoom = async (postId) => {
    try {
        showToast("Setting up your room...", "success");
        const res = await createRoom(postId);
        setTimeout(() => navigate(`/rooms/${res.room.id || res.room._id}`), 1000);
    } catch (error) {
        showToast("Failed to create room", "error");
    }
  };

  return (
    <div className="cr-layout-wrapper">
      <div className="cr-container">
        <div className="cr-header">
            <h2>Create Room</h2>
            <p>Convert an existing post into a private team workspace.</p>
        </div>

        <div className="cr-new-post-box">
            <p>Don't have a post yet?</p>
            <button
                className="cr-btn-outline"
                onClick={() => navigate("/posts/create")}
            >
                <span className="plus-icon">+</span> Create New Post
            </button>
        </div>

        <div className="cr-divider">
            <span>OR SELECT AN EXISTING POST</span>
        </div>

        <div className="cr-posts-grid">
          {loading ? (
            <div className="cr-loading">
                <div className="spinner-cr"></div>
                <p>Fetching your posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="cr-empty">
                <div className="empty-icon">📝</div>
                <h3>No eligible posts found</h3>
                <p>Posts that already have rooms or aren't your own won't appear here.</p>
            </div>
          ) : (
            posts.map((post) => (
                <div
                  key={post._id}
                  className="cr-select-card"
                  onClick={() => handleCreateRoom(post._id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-accent"></div>
                  <div className="card-content">
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                    <div className="card-footer-info">
                        <span>Category: <strong>{post.category}</strong></span>
                        <span className="select-action">Select &rarr;</span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {toast && (
          <div className={`cr-toast ${toast.type}`}>
            {toast.type === "success" ? "✅" : "⚠️"} 
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateRoom;