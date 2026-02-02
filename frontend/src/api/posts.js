import { getToken } from "../utils/auth";

const API_BASE = "https://skillsync-backend-2mw0.onrender.com";

export const fetchAnnouncements = async () => {
  const res = await fetch(`${API_BASE}/posts/announcements`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};

export const createPost = async (data) => {
  const isFormData = data instanceof FormData;

  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}/posts/create`, {
    method: "POST",
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Something went wrong");
  }

  return res.json();
};

export const fetchMyPostsWithoutRoom = async () => {
  const res = await fetch(`${API_BASE}/posts/my-posts?room=false`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.json();
};
