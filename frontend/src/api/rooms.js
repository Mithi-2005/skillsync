import { getToken } from "../utils/auth";

const API_BASE = "https://skillsync-backend-2mw0.onrender.com";

export const requestToJoinRoom = async (roomId, message = "") => {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/request`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ message })
    });
    return res.json();
};

export const fetchRoom = async (roomId) => {
  const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const updateApplicationStatus = async (
  roomId,
  applicationId,
  action
) => {
  const res = await fetch(
    `${API_BASE}/rooms/${roomId}/applications/${applicationId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ action }),
    }
  );

  return res.json();
};

export const fetchAllRooms = async () => {
  const res = await fetch(`${API_BASE}/rooms`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchMyRooms = async () => {
  const res = await fetch(`${API_BASE}/rooms/my_rooms`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const createRoom = async (postId) => {
  const res = await fetch(`${API_BASE}/rooms/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ postId }),
  });

  return res.json();
};

export const fetchRoomRecommendations = async (roomId) => {
  const res = await fetch(
    `${API_BASE}/rooms/${roomId}/suggestions`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return res.json();
};

export const sendRoomInvitation = async (roomId, userId) => {
  const res = await fetch(
    `${API_BASE}/rooms/${roomId}/invite/${userId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return res.json();
};

export const fetchMyInvitations = async () => {
  const res = await fetch(`${API_BASE}/rooms/my_invitations`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const updateInvitationStatus = async (
  roomId,
  invitationId,
  status
) => {
  const res = await fetch(
    `${API_BASE}/rooms/${roomId}/my_invitations/${invitationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  return res.json();
};


export const verifyRoomCode = async (code) => {

  const res = await fetch(`${API_BASE}/rooms/join-by-code`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ roomCode: code }), 
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid Code");
  
  return data;
};