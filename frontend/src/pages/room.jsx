import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRoom, updateApplicationStatus, requestToJoinRoom, fetchRoomRecommendations, sendRoomInvitation } from "../api/rooms";
import ChatWindow from "../components/chatwindow";
import "./room.css";

function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [recLoading, setRecLoading] = useState(false); 
  const [recommendations, setRecommendations] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRoom = async () => {
    try {
      const res = await fetchRoom(roomId);
      setRoom(res.room || res);
    } catch (err) {
      showToast("Failed to load room details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (room && room.admin === currentUser.id && room.status === "open") {
      setRecLoading(true);
      fetchRoomRecommendations(roomId)
        .then((res) => {
          setRecommendations(res.suggestions || res.recommendations || []);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setRecLoading(false); 
        });
    }
  }, [room]);

  const getInviteStatus = (targetUserId) => {
    if (!room || !room.invitations) {
      return { label: "Invite", disabled: false, className: "btn-outline" };
    }

    const targetString = String(targetUserId);

    const isMember = room.members.some(m => {
       const memberId = m.user._id ? String(m.user._id) : String(m.user);
       return memberId === targetString;
    });

    if (isMember) return { label: "Member", disabled: true, className: "btn-secondary" };

    const invite = room.invitations.find(i => {
       const invitedId = i.user._id ? String(i.user._id) : String(i.user);
       return invitedId === targetString;
    });

    if (invite) {
      if (invite.status === 'pending') return { label: "Pending", disabled: true, className: "btn-warning" };
      if (invite.status === "declined") return { label: "Declined", disabled: true, className: "btn-danger" };
      if (invite.status === 'accepted') return { label: "Joined", disabled: true, className: "btn-success" };
    }

    return { label: "Invite", disabled: false, className: "btn-outline" };
  };

  const handleSendInvite = async (targetUserId) => {
    try {
      await sendRoomInvitation(roomId, targetUserId);
      setRoom(prev => ({
        ...prev,
        invitations: [ ...(prev.invitations || []), { user: targetUserId, status: 'pending' } ]
      }));
      showToast("Invitation sent successfully!", "success");
    } catch (error) {
      showToast("Failed to send invitation", "error");
    }
  };

  if (loading) return (
    <div className="room-container">
        <div className="room-loading">
            <div className="spinner"></div>
            <p>Loading Room Details...</p>
        </div>
    </div>
  );
  
  if (!room) return <div className="room-container"><p className="room-error">Room not found</p></div>;

  const isAdmin = room.admin === currentUser.id;
  const isMember = room.members.some((m) => m.user._id === currentUser.id);
  const myApplication = room.applications.find((app) => app.user._id === currentUser.id);
  const isApplicant = !!myApplication;

  if (!isAdmin && !isMember && !isApplicant) {
    return (
      <div className="room-container">
        <div className="room-card restricted-card">
          <div className="lock-icon">🔒</div>
          <h2>Access Restricted</h2>
          <p className="room-description">You are not a member of this team yet.</p>
          
          <button
            className="btn btn-primary"
            onClick={async () => {
              setActionLoading(true);
              try {
                  await requestToJoinRoom(room._id || room.roomId);
                  showToast("Request sent successfully", "success");
                  loadRoom();
              } catch(e) {
                  showToast("Failed to send request", "error");
              } finally {
                  setActionLoading(false);
              }
            }}
            disabled={actionLoading}
          >
            {actionLoading ? "Requesting..." : "Request to Join"}
          </button>
        </div>
        {toast && <div className={`rc-toast ${toast.type}`}><span>{toast.message}</span></div>}
      </div>
    );
  }

  return (
    <div className="room-container">
      
      <div className="room-dashboard-grid">
        
        <div className="room-left-panel">
            <div className="room-card">
                <div className="rc-header">
                    <h2>{room.post.title}</h2>
                    <span className={`status-pill ${room.status}`}>{room.status}</span>
                </div>
                <p className="room-description">{room.post.description}</p>
                <div className="room-skills">
                <span className="skill-label">Required Skills:</span>
                {room.post.skillsRequired.map((skill, index) => (
                    <span key={index} className="rc-skill-tag">{skill}</span>
                ))}
                </div>
            </div>

            {isApplicant && !isMember && !isAdmin && (
                <div className="room-card">
                <h3>Your Application</h3>
                <div className="application-status-box">
                    <span>Current Status:</span> 
                    <span className={`status-badge ${myApplication.status}`}>{myApplication.status}</span>
                </div>
                </div>
            )}

            {isMember && (
                <div className="room-card">
                <h3>Team Members</h3>
                <div className="member-list">
                    {room.members.map((m) => (
                    <div className="member-item" key={m.user._id}>
                        <img src={m.user.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="profile" />
                        <div className="member-info">
                            <span className="member-name">{m.user.name}</span>
                            <span className="member-role">{m.role}</span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {isAdmin && (
                <>
                <div className="room-card">
                    <div className="code-box">
                        <strong>Room Code:</strong> 
                        <span className="the-code">{room.roomCode}</span>
                    </div>
                </div>

                <div className="room-card">
                    <h3>Pending Applications</h3>
                    {room.applications.filter((app) => app.status === "pending").length === 0 && (
                    <p className="text-muted">No pending applications</p>
                    )}
                    
                    <div className="applications-list">
                        {room.applications
                        .filter((app) => app.status === "pending")
                        .map((app) => (
                            <div className="application-item" key={app._id}>
                                <div className="member-item">
                                    <img src={app.user.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="" />
                                    <div>
                                        <strong>{app.user.name}</strong>
                                        <p className="app-msg">{app.message || "No message"}</p>
                                    </div>
                                </div>
                                <div className="application-actions">
                                    <button className="btn btn-primary btn-sm" onClick={async () => {
                                        await updateApplicationStatus(room._id || room.roomId, app._id, "accept");
                                        showToast(`${app.user.name} accepted!`, "success");
                                        loadRoom();
                                    }}>Accept</button>
                                    
                                    <button className="btn btn-outline btn-sm" onClick={async () => {
                                        await updateApplicationStatus(room._id || room.roomId, app._id, "reject");
                                        showToast("Application rejected", "default");
                                        loadRoom();
                                    }}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {recLoading && (
                    <div className="room-card loading-card">
                        <div className="spinner-sm"></div>
                        <p className="text-muted">AI is analyzing candidate skills...</p>
                    </div>
                )}

                {!recLoading && recommendations.length > 0 && (
                    <div className="room-card">
                    <h3>AI Recommended Candidates</h3>
                    <p className="text-muted small-text">Ranked by skill match & proficiency.</p>
                    <div className="recommendations-list">
                        {recommendations.map((user) => {
                            const btnStatus = getInviteStatus(user.userId);
                            return (
                                <div className="recommendation-item" key={user.userId}>
                                <div className="rec-left">
                                    <img src={user.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="" />
                                    <div className="rec-info">
                                        <div className="rec-name-row">
                                            <strong>{user.name}</strong>
                                            <span className="match-badge">⚡ {user.matchScore}% Match</span>
                                        </div>
                                        <div className="matched-skills-list">
                                            {user.matchedSkills && user.matchedSkills.length > 0 ? (
                                                user.matchedSkills.map((skill, idx) => (
                                                    <span key={idx} className="skill-tag-mini">{skill.name}</span>
                                                ))
                                            ) : <span className="text-muted small-text">No specific tags</span>}
                                        </div>
                                    </div>
                                </div>
                                <button className={`btn ${btnStatus.className} btn-sm`} disabled={btnStatus.disabled} onClick={() => handleSendInvite(user.userId)}>
                                    {btnStatus.label}
                                </button>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                )}

                {!recLoading && recommendations.length === 0 && (
                    <div className="room-card text-center empty-rec">
                        <h3>No Candidates Found</h3>
                        <p>We couldn't find any users matching your exact requirements.</p>
                    </div>
                )}
                </>
            )}
        </div>

        {(isMember || isAdmin) && (
            <div className="room-right-panel">
                <ChatWindow roomId={room._id || room.id || roomId} currentUser={currentUser} />
            </div>
        )}
      </div>

      {toast && <div className={`rc-toast ${toast.type}`}><span>{toast.message}</span></div>}
    </div>
  );
}

export default Room;