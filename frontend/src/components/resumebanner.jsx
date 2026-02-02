import { useState, useEffect } from "react";
import { uploadResume } from "../api/user";
import "./resumebanner.css";

function ResumeBanner() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false); 

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const skills = user?.skills || [];
  const hasSkills = skills.length > 0;

  useEffect(() => {
    if (hasSkills) {
      const timer = setTimeout(() => setIsAnimated(true), 350);
      return () => clearTimeout(timer);
    }
  }, [hasSkills]);

  const getProficiency = (score) => {
    if (score >= 78) return { label: "Expert", class: "p-expert" };
    if (score >= 50) return { label: "Intermediate", class: "p-inter" };
    return { label: "Beginner", class: "p-begin" };
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await uploadResume(file);
      showToast("Analysis Complete", "success");
      const updatedUser = { ...user, skills: res.skills };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      showToast("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!hasSkills) {
    return (
      <div className="rb-outer-card">
        <h2 className="rb-main-label">YOUR PROFILE</h2>
        <div className="rb-glass-inner">
           <div className="rb-upload-content">
              <div className="rb-icon-circle">📂</div>
              <h3>Analyze Resume</h3>
              <p>Generate your skill profile</p>
              <label className="rb-premium-btn">
                {loading ? "Analyzing..." : "Upload PDF"}
                <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
              </label>
           </div>
        </div>
      </div>
    );
  }

  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="rb-outer-card">
      <h2 className="rb-main-label">YOUR PROFILE</h2>
      
      <div className="rb-glass-inner">
        <div className="sb-top-row">
          <span className="sb-section-title">TOP SKILLS</span>
          <span className="sb-total-tag">{skills.length} Total</span>
        </div>

        <div className="sb-skills-stack">
          {topSkills.map((skill, index) => {
            const prof = getProficiency(skill.score);
            return (
              <div className="sb-skill-row" key={index}>
                <div className="sb-skill-meta">
                  <span className="sb-skill-name">{skill.name}</span>
                  <span className={`sb-prof-label ${prof.class}`}>{prof.label}</span>
                </div>
                <div className="sb-progress-track">
                  <div 
                    className={`sb-progress-glow ${prof.class}`} 
                    style={{ width: isAnimated ? `${skill.score}%` : "0%" }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <div className={`pc-toast ${toast.type}`}><span>{toast.message}</span></div>}
    </div>
  );
}

export default ResumeBanner;