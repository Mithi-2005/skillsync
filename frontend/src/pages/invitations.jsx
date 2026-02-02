import { useEffect, useState } from "react";
import { fetchMyInvitations, updateInvitationStatus } from "../api/rooms";
import { useNavigate } from "react-router-dom";
import "./invitations.css";

function RoomInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); 

  const navigate = useNavigate();

  const loadInvitations = async () => {
    try {
      const res = await fetchMyInvitations();
      setInvitations(res.invitations || []);
    } catch (error) {
      console.error("Failed to load invitations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); 
  };

  const handleAction = async (roomId, invitationId, status) => {
    try {
      await updateInvitationStatus(roomId, invitationId, status);

      setInvitations((prev) => 
        prev.filter((inv) => inv.invitationId !== invitationId)
      );

      if (status === 'accepted') {
        showToast("Joined successfully! Redirecting...", "success");
        setTimeout(() => navigate(`/rooms/${roomId}`), 1500);
      }
      if (status === 'declined') {
        showToast("Invitation declined", "default");
      }
    } catch (error) {
      showToast("Action failed. Please try again.", "error");
    }
  };

  if (loading) return (
    <div className="invitations-container">
        <div className="ri-loading">
            <div className="spinner"></div>
            <p>Checking inbox...</p>
        </div>
    </div>
  );

  return (
    <div className="invitations-container">
      <div className="ri-header">
        <h3>Pending Invitations</h3>
        <p>Accept or decline requests to join new teams.</p>
      </div>

      {invitations.length === 0 && (
        <div className="ri-empty">
           <div className="empty-icon">📭</div>
           <h3>No pending invitations</h3>
           <p>You're all caught up! Check back later.</p>
        </div>
      )}

      <div className="ri-grid">
        {invitations.map((inv) => (
          <div className="ri-card" key={inv.invitationId}>
            <div className="ri-card-body">
                <span className="ri-label">Invited to join:</span>
                <h3 className="ri-card-title">{inv.post.title}</h3>
                <p className="ri-card-desc">{inv.post.description}</p>
            </div>

            <div className="ri-actions">
              <button
                className="ri-btn ri-btn-accept"
                onClick={() => handleAction(inv.roomId, inv.invitationId, "accepted")}
              >
                Join Team
              </button>

              <button
                className="ri-btn ri-btn-decline"
                onClick={() => handleAction(inv.roomId, inv.invitationId, "declined")}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className={`ri-toast ${toast.type}`}>
          {toast.type === "success" && "✅"}
          {toast.type === "error" && "⚠️"}
          {toast.type === "default" && "ℹ️"} 
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default RoomInvitations;