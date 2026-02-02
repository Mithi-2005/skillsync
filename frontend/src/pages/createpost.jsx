import { useState, useRef, useEffect } from "react";
import { createPost } from "../api/posts";
import "./createpost.css";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const catRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false); 

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "project",
    scope: "public",
    skillsRequired: "",
    teamSize: 4, 
    roomEnabled: false,
  });

  const [files, setFiles] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scopeRef.current && !scopeRef.current.contains(event.target)) setShowScopeDropdown(false);
      if (catRef.current && !catRef.current.contains(event.target)) setShowCatDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (files.length + newFiles.length > 5) {
        showToast("Max 5 files allowed.", "error");
        return;
    }
    setFiles([...files, ...newFiles]);
    e.target.value = ""; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
          formData.append(key, form[key]);
      });
      files.forEach(file => formData.append("files", file));

      await createPost(formData);
      showToast(`Opportunity posted!`, "success");
      setTimeout(() => navigate(form.roomEnabled ? "/rooms/my-rooms" : "/announcements"), 1500);
    } catch (error) {
      showToast("Failed to create post.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-layout">
      <div className="create-post-container">
        <div className="cp-header">
            <h2>Create New Post</h2>
            <p>Define your project visibility and team preferences.</p>
        </div>

        <form className="cp-form" onSubmit={handleSubmit}>
          <div className="cp-group">
              <label className="cp-crimson-label">Project Title</label>
              <input 
                className="cp-glass-input" 
                placeholder="Title..." 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})} 
                required 
              />
          </div>

          <div className="cp-group">
              <label className="cp-crimson-label">Description</label>
              <textarea 
                className="cp-glass-input cp-textarea" 
                placeholder="Details..." 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})} 
                required 
              />
          </div>

          <div className="cp-row">
              <div className="cp-group">
                  <label className="cp-crimson-label">Category</label>
                  <div className="custom-scope-wrapper" ref={catRef}>
                      <div className={`scope-trigger ${showCatDropdown ? 'active' : ''}`} onClick={() => setShowCatDropdown(!showCatDropdown)}>
                          <span>{form.category === "project" ? "🚀 Project" : "🏆 Hackathon"}</span>
                          <span className="scope-arrow">▼</span>
                      </div>
                      {showCatDropdown && (
                          <div className="scope-dropdown-menu">
                              <div className="scope-option" onClick={() => { setForm({...form, category: 'project'}); setShowCatDropdown(false); }}>🚀 Project</div>
                              <div className="scope-option" onClick={() => { setForm({...form, category: 'hackathon'}); setShowCatDropdown(false); }}>🏆 Hackathon</div>
                          </div>
                      )}
                  </div>
              </div>

              <div className="cp-group">
                  <label className="cp-crimson-label">Visibility</label>
                  <div className="custom-scope-wrapper" ref={scopeRef}>
                      <div className={`scope-trigger ${showScopeDropdown ? 'active' : ''}`} onClick={() => setShowScopeDropdown(!showScopeDropdown)}>
                          <span>{form.scope === "public" ? "🌍 Public" : "🎓 College"}</span>
                          <span className="scope-arrow">▼</span>
                      </div>
                      {showScopeDropdown && (
                          <div className="scope-dropdown-menu">
                              <div className="scope-option" onClick={() => { setForm({...form, scope: 'public'}); setShowScopeDropdown(false); }}>🌍 Public (All)</div>
                              <div className="scope-option" onClick={() => { setForm({...form, scope: 'college'}); setShowScopeDropdown(false); }}>🎓 My College</div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="cp-group">
            <label className="cp-crimson-label">Skills (Comma separated)</label>
            <input 
                className="cp-glass-input" 
                placeholder="React, AI, Python..." 
                value={form.skillsRequired}
                onChange={(e) => setForm({...form, skillsRequired: e.target.value})} 
            />
          </div>

          <div className="file-upload-section">
              <label className="file-drop-zone">
                <input type="file" multiple hidden onChange={handleFileChange} />
                <span className="upload-icon">📁</span>
                <span className="upload-text">Attach Media</span>
              </label>
              {files.length > 0 && (
                <ul className="cp-file-list">
                    {files.map((file, i) => (
                        <li key={i} className="cp-file-item">
                            <span>{file.name}</span>
                            <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>✕</button>
                        </li>
                    ))}
                </ul>
              )}
          </div>

          <div className="cp-toggle-area">
              <label className="cp-checkbox-container">
                <input 
                    type="checkbox" 
                    checked={form.roomEnabled}
                    onChange={(e) => setForm({...form, roomEnabled: e.target.checked})} 
                />
                <span className="checkmark"></span>
                <div className="toggle-text">
                    <strong>Enable Team Room</strong>
                    <span>Creates a private collaboration space.</span>
                </div>
              </label>
          </div>

          {form.roomEnabled && (
            <div className="cp-group animate-slide-down">
                <label className="cp-crimson-label">Required Team Size</label>
                <input 
                    type="number" 
                    className="cp-glass-input" 
                    min="2" 
                    max="20"
                    value={form.teamSize}
                    onChange={(e) => setForm({...form, teamSize: parseInt(e.target.value) || 2})}
                />
                <p className="cp-hint-text">Includes yourself and team members.</p>
            </div>
          )}

          <button className="cp-submit-btn" type="submit" disabled={loading}>
            {loading ? "Processing..." : "Launch Opportunity"}
          </button>
        </form>

        {toast && <div className={`cp-toast ${toast.type}`}><span>{toast.message}</span></div>}
      </div>
    </div>
  );
}
export default CreatePost;