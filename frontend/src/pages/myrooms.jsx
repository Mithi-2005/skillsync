import { useEffect, useState } from "react";
import { fetchMyRooms } from "../api/rooms";
import { useNavigate } from "react-router-dom";
import "./myrooms.css";

function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyRooms = async () => {
      const res = await fetchMyRooms();

      console.log("API Response:", res);

      const allRooms = [
        ...(res.owned || []).map((r) => ({
          ...r,
          myRole: "Admin",
        })),
        ...(res.active || []).map((r) => ({
          ...r,
          myRole: "Member",
        })),
        ...(res.requested || []).map((r) => ({
          ...r,
          myRole: "Applicant",
        })),
      ];

      setRooms(allRooms);
    };

    loadMyRooms();
  }, []);

  const handleRoomClick = (room) => {
    if (room.myRole === "Admin" || room.myRole === "Member") {
      navigate(`/rooms/${room.roomId}`);
    }
    else {
      navigate(`/announcements#post-${room.post._id}`);
    }
  };

  return (
    <div className="my-rooms-container">
      <div className="mr-header">
        <h3>Your Rooms</h3>
        <p>Manage your active projects and applications.</p>
      </div>

      <div className="mr-grid">
        {rooms.length === 0 && (
          <div className="mr-empty">
            <div className="empty-icon">📂</div>
            <h3>No rooms yet</h3>
            <p>You haven't joined or created any rooms.</p>
          </div>
        )}

        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="mr-card"
            onClick={() => handleRoomClick(room)}
            role="button"
            tabIndex={0}
          >
            <div className="mr-card-top">
              <span className={`role-badge ${room.myRole.toLowerCase()}`}>
                {room.myRole}
              </span>
            </div>

            <div className="mr-card-content">
              <h3>{room.post?.title || "Untitled Post"}</h3>
              <p>{room.post?.description || "No description provided."}</p>
            </div>

            <div className="mr-card-footer">
              {(room.myRole === "Admin" || room.myRole === "Member") && (
                <div className="mr-status-row">
                    <span className="label">Room Status:</span>
                    <span className={`status-text ${room.status?.toLowerCase() || 'active'}`}>
                        {room.status || 'Active'}
                    </span>
                </div>
              )}

              {room.myRole === "Applicant" && (
                <div className="mr-status-row">
                    <span className="label">Application:</span>
                    <span className="status-text pending">
                        Pending Approval
                    </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRooms;