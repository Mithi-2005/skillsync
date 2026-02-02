import { useEffect, useState } from "react";
import { fetchAllRooms } from "../api/rooms";
import { useNavigate } from "react-router-dom";
import JoinByCode from "../components/joinbycode"; 
import "./discoverrooms.css";

function DiscoverRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetchAllRooms();
        setRooms(res.rooms || []);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  if (loading) return (
    <div className="discover-loading">
      <div className="spinner"></div>
      <p>Finding active rooms...</p>
    </div>
  );

  const localData = JSON.parse(localStorage.getItem("user"));
  const currentUser = localData?.user || localData;
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;

  if (!currentUserId) {
      console.error("❌ Could not find User ID in localStorage:", localData);
      return (
        <div className="discover-error">
          <p>User session invalid. Please log out and log in again.</p>
        </div>
      );
  }

  const filteredRooms = rooms.filter((room) => {
    const adminId = room.admin?._id || room.admin || room.createdBy;
    const isAdmin = String(adminId) === String(currentUserId);

    const members = room.members || [];
    const isMember = members.some((m) => {
        const memberId = m.user?._id || m.user;
        return String(memberId) === String(currentUserId);
    });

    const applications = room.applications || [];
    const isApplicant = applications.some((app) => {
        const applicantId = app.user?._id || app.user;
        return String(applicantId) === String(currentUserId);
    });

    return !isAdmin && !isMember && !isApplicant;
  });

  return (
    <div className="discover-container">
      <div className="discover-header-row">
        <div className="dh-text">
            <h3>Available Rooms</h3>
            <p>Browse projects looking for your skills.</p>
        </div>
        
        <button 
          className="btn-join-code"
          onClick={() => setShowCodeModal(true)}
        >
          <span className="icon">#</span> Join via Code
        </button>
      </div>

      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <div className="rooms-empty">
            <div className="empty-icon">🔍</div>
            <h3>No new rooms found</h3>
            <p>You seem to be part of every active room, or there are no new openings right now.</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.roomId || room._id}
              className="discover-card"
              onClick={() => navigate(`/announcements#post-${room.post._id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="dc-header">
                <div className="dc-top-row">
                    <span className={`status-badge ${room.status?.toLowerCase() || 'open'}`}>
                    {room.status || 'Open'}
                    </span>
                </div>
                <h3 className="dc-title">{room.post?.title || "Untitled Room"}</h3>
              </div>

              <div className="dc-body">
                <p className="dc-description">
                  {room.post?.description || "No description provided."}
                </p>
                
                <div className="dc-skills-list">
                  {room.post?.skillsRequired?.length > 0 ? (
                    room.post.skillsRequired.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <span className="skill-tag general">General</span>
                  )}
                  {(room.post?.skillsRequired?.length || 0) > 3 && (
                    <span className="skill-tag more">+{room.post.skillsRequired.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="dc-footer">
                <span className="dc-link">View Details &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showCodeModal && (
        <JoinByCode onClose={() => setShowCodeModal(false)} />
      )}
    </div>
  );
}

export default DiscoverRooms;