import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { requestToJoinRoom } from "../api/rooms";
import { hasResume } from "../utils/user";
import "./postcard.css";

function PostCard({ post: initialPost, currentUser }) {
  const [post, setPost] = useState(initialPost);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [fullScreenMedia, setFullScreenMedia] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false); 

  const navigate = useNavigate();
  if (!post) return null;

  const media = post.media || [];
  const currentFile = media[currentMediaIndex];

  const getSkillsArray = () => {
    if (!post.skillsRequired) return [];
    if (Array.isArray(post.skillsRequired)) return post.skillsRequired;
    return post.skillsRequired.split(",").map(s => s.trim()).filter(s => s !== "");
  };
  const skills = getSkillsArray();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMediaClick = (e, file) => {
    e.stopPropagation();
    setFullScreenMedia(file);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setFullScreenMedia(null);
    document.body.style.overflow = "auto";
  };

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    const creatorId = post.createdBy?._id || post.createdBy || post.creator; 
    if (String(creatorId) === String(currentUser?.id || currentUser?._id)) {
        Swal.fire({
            icon: 'info',
            title: 'Nice try!',
            text: 'You cannot like your own post.',
            width: '350px',
            padding: '2em',
            buttonsStyling: true
        });
        return;
    }

    try {
      const res = await fetch(`https://skillsync-backend-2mw0.onrender.com/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPost({ ...post, likesCount: data.likesCount, isLikedByCurrentUser: data.liked });
      }
    } catch (err) { showToast("Like failed", "error"); }
  };
  const handleAddComment = async (e) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`https://skillsync-backend-2mw0.onrender.com/posts/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (res.ok) {
        setPost({ ...post, comments: data.comments });
        setCommentText("");
      }
    } catch (err) { showToast("Comment failed", "error"); }
  };

  const handleReplyClick = (commentId, mentionName = "") => {
    setActiveReplyId(commentId);
    setReplyText(mentionName ? `@${mentionName} ` : "");
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`https://skillsync-backend-2mw0.onrender.com/posts/${post._id}/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ text: replyText })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedComments = post.comments.map(c => c._id === commentId ? data.comment : c);
        setPost({ ...post, comments: updatedComments });
        setReplyText("");
        setActiveReplyId(null);
      }
    } catch (err) { showToast("Reply failed", "error"); }
  };

  const handleRequestToJoin = async (e) => {
    e.stopPropagation();
    if (!post.isOpen) return;
    if (!post.room) { showToast("No active room", "error"); return; }
    if (!hasResume()) { showToast("Upload resume first", "error"); return; }
    
    setRequestLoading(true);
    try {
      const roomId = post.room._id || post.room;
      const res = await requestToJoinRoom(roomId);
      showToast(res.message || "Request sent", "success");

      setPost((prev) => {
        const updatedRoom = { ...prev.room };
        
        if (updatedRoom && updatedRoom.applications) {
            updatedRoom.applications = [
                ...updatedRoom.applications,
                { user: currentUser.id, status: "pending" } 
            ];
        } else if (updatedRoom) {
            updatedRoom.applications = [{ user: currentUser.id, status: "pending" }];
        }

        return { ...prev, room: updatedRoom };
      });

    } catch (error) { 
        showToast("Request failed", "error"); 
    } finally {
        setRequestLoading(false);
    }
  };

  const nextSlide = (e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1)); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1)); };

  const renderActionButton = () => {
    if (!post.isOpen) return <button className="pro-btn outline is-closed" disabled>Position Filled</button>;
    if (post.createdBy?._id === currentUser?.id || post.createdBy === currentUser?.id) return <button className="pro-btn outline" disabled>Your Post</button>;
    
    let isMember = post.room?.members?.some(m => String(m.user?._id || m.user || m) === String(currentUser?.id));
    if (isMember) return <button className="pro-btn success" onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${post.room._id || post.room}`); }}>Access Room</button>;
    
    const apps = post.room?.applications || []; 
    let isApplicant = apps.some(app => {
        const appId = app.user?._id || app.user || app;
        return String(appId) === String(currentUser?.id);
    });

    if (isApplicant) return <button className="pro-btn outline" disabled>Requested</button>;
    
    return (
        <button 
            className="pro-btn primary-glow" 
            onClick={handleRequestToJoin}
            disabled={requestLoading}
        >
            {requestLoading ? "Sending..." : "Request to Join"}
        </button>
    );
  };

  return (
    <div id={`post-${post._id}`} className={`pro-card ${isExpanded ? "expanded" : ""}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="pro-header">
        <div className="avatar-circle">{post.createdBy?.name?.charAt(0) || "U"}</div>
        <div className="header-info">
          <div className="header-top-line">
            <h4 className="user-name">{post.createdBy?.name || "User"}</h4>
            {!post.isOpen && <span className="closed-pill">Closed</span>}
          </div>
          <div className="post-meta">{post.category}</div>
        </div>
      </div>

      <div className="pro-body">
        <h3 className="pro-title">{post.title}</h3>
        <p className="pro-desc">{post.description}</p>
      </div>

      {media.length > 0 && (
        <div className="pro-media-wrapper" onClick={(e) => handleMediaClick(e, currentFile)}>
          {currentFile?.type === "video" ? <video src={currentFile.url} className="pro-media" /> : <img src={currentFile?.url} className="pro-media" alt="" />}
          <div className="zoom-hint">🔍 Expand</div>
          {media.length > 1 && (
            <>
              <button className="media-nav left" onClick={prevSlide}>&#10094;</button>
              <button className="media-nav right" onClick={nextSlide}>&#10095;</button>
            </>
          )}
        </div>
      )}

      <div className="social-interaction-bar">
        <div className={`social-item ${post.isLikedByCurrentUser ? 'active-like' : ''}`} onClick={handleToggleLike}>
          <span className="social-icon">{post.isLikedByCurrentUser ? "❤️" : "🤍"}</span>
          <span className="social-count">{post.likesCount || 0}</span>
        </div>
        <div className="social-item">
          <span className="social-icon">💬</span>
          <span className="social-count">{post.comments?.length || 0}</span>
        </div>
        {post.scope === "college" && <div className="campus-mini-badge">🎓 {currentUser?.college || "Campus"}</div>}
      </div>

      <div className="pro-footer">
        <div className="action-area">{renderActionButton()}</div>
        <div className="expand-indicator">{isExpanded ? "▲ Hide" : "▼ Details"}</div>
      </div>

      {isExpanded && (
        <div className="expanded-content-area" onClick={(e) => e.stopPropagation()}>
          {skills.length > 0 && (
            <div className="skills-section">
              <h5 className="section-label">Target Skills</h5>
              <div className="skill-tags">
                {skills.map((skill, i) => (
                  <span key={i} className="skill-tag-pill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="comments-section">
            <h5 className="section-label">Discussion</h5>
            <div className="linkedin-comments-scroll-box">
              {[...post.comments].reverse().map((comment) => (
                <div key={comment._id} className="comment-thread">
                  <div className="comment-bubble">
                    <div className="comment-user-row">
                      <strong>{comment.user?.name || currentUser.name}</strong>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <button className="reply-trigger-btn" onClick={() => handleReplyClick(comment._id)}>Reply</button>
                  </div>
                  {comment.replies?.map((reply, j) => (
                    <div key={j} className="comment-reply">
                      <div className="reply-content">↳ <strong>{reply.user?.name || currentUser.name}:</strong> {reply.text}</div>
                      <button className="reply-trigger-btn small" onClick={() => handleReplyClick(comment._id, reply.user?.name)}>Reply</button>
                    </div>
                  ))}
                  {activeReplyId === comment._id && (
                    <div className="reply-input-wrapper">
                      <input type="text" value={replyText} autoFocus onChange={(e) => setReplyText(e.target.value)} />
                      <button onClick={() => handleAddReply(comment._id)}>↗</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="add-comment-input">
              <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <button className="send-comment-btn" onClick={handleAddComment}>↗</button>
            </div>
          </div>
        </div>
      )}

      {fullScreenMedia && createPortal(
        <div className="media-lightbox-portal" onClick={closeLightbox}>
          <button className="close-btn-top">✕</button>
          <div className="lightbox-image-container" onClick={(e) => e.stopPropagation()}>
            {fullScreenMedia.type === "video" ? <video src={fullScreenMedia.url} controls autoPlay className="full-view-media" /> : <img src={fullScreenMedia.url} className="full-view-media" alt="" />}
          </div>
        </div>,
        document.body
      )}

      {toast && <div className={`pc-toast ${toast.type}`}><span>{toast.message}</span></div>}
    </div>
  );
}

export default PostCard;