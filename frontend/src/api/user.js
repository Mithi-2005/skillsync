import { getToken } from "../utils/auth";

const API_BASE = "https://skillsync-backend-2mw0.onrender.com";

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_BASE}/profile/upload-resume`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  return res.json();
};

