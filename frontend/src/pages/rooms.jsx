import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./rooms.css";

function Rooms() {
  const navigate = useNavigate();

  return (
    <div className="rooms-layout-wrapper">
      <div className="rooms-header">
        <div className="header-text">
          <h2>Rooms</h2>
          <p className="header-subtitle">Join the conversation or start your own.</p>
        </div>
        
        <button
          className="fab"
          onClick={() => navigate("/rooms/create")}
          title="Create New Room"
        >
          <span className="fab-icon">+</span>
        </button>
      </div>

      <div className="rooms-tabs">
        <NavLink to="discover" className="tab">
          Discover Rooms
        </NavLink>
        <NavLink to="my-rooms" className="tab">
          My Rooms
        </NavLink>
        <NavLink to="invitations" className="tab">
          Invitations
        </NavLink>
      </div>

      <div className="rooms-content-area">
        <Outlet />
      </div>
    </div>
  );
}

export default Rooms;