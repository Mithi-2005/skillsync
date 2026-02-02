import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // 🟢 Import SweetAlert2
import PostCard from "../components/postcard.jsx";
import { fetchAnnouncements } from "../api/posts.js";
import "./profile.css";

const COLLEGE_LIST = [
    "Indian Institute of Technology Madras", "Indian Institute of Science Bengaluru",
    "Indian Institute of Technology Bombay", "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Kanpur", "Indian Institute of Technology Kharagpur",
    "All India Institute of Medical Sciences Delhi", "Indian Institute of Technology Roorkee",
    "Indian Institute of Technology Guwahati", "Jawaharlal Nehru University",
    "Banaras Hindu University", "Indian Institute of Technology Hyderabad",
    "Jamia Millia Islamia", "Manipal Academy of Higher Education",
    "University of Delhi", "Aligarh Muslim University",
    "Jadavpur University", "Amrita Vishwa Vidyapeetham",
    "Vellore Institute of Technology", "Anna University",
    "S.R.M. Institute of Science and Technology", "Saveetha Institute of Medical and Technical Sciences",
    "Siksha 'O' Anusandhan", "Kalinga Institute of Industrial Technology",
    "Homi Bhabha National Institute", "University of Hyderabad",
    "Calcutta University", "Birla Institute of Technology and Science - Pilani",
    "Chandigarh University", "National Institute of Technology Tiruchirappalli",
    "National Institute of Technology Karnataka", "Indian Institute of Technology Indore",
    "Indian Institute of Technology (BHU) Varanasi", "Indian Institute of Technology Dhanbad",
    "National Institute of Technology Rourkela", "Amity University",
    "Thapar Institute of Engineering and Technology", "Bharath Institute of Higher Education and Research",
    "JSS Academy of Higher Education and Research", "Osmania University",
    "Lovely Professional University", "King George`s Medical University",
    "Panjab University", "National Institute of Technology Warangal",
    "Indian Institute of Science Education & Research Pune", "Indian Institute of Technology Gandhinagar",
    "Alagappa University", "Indian Institute of Technology Ropar",
    "Indian Institute of Technology Patna", "National Institute of Technology Calicut",
   "Delhi Technological University", "Jamia Hamdard", "University of Kerala",
    "Visva Bharati", "Mysore University", "Koneru Lakshmaiah Education Foundation",
    "Savitribai Phule Pune University", "Madurai Kamaraj University",
    "Sathyabama Institute of Science and Technology", "Maharshi Dayanand University",
    "Guru Nanak Dev University", "SASTRA University", "Andhra University",
    "Tezpur University", "Christ University", "Gujarat University",
    "Indian Institute of Technology Bhubaneswar", "Indian Institute of Technology Mandi",
    "Indian Institute of Technology Jodhpur", "Motilal Nehru National Institute of Technology",
    "Malaviya National Institute of Technology", "Visvesvaraya National Institute of Technology",
    "PSG College of Technology", "M. S. Ramaiah Institute of Technology",
    "Vignan's Foundation for Science, Technology and Research", "Jain University",
    "Nirma University", "Netaji Subhas University of Technology",
    "Shiv Nadar University", "Ashoka University", "Graphic Era University",
    "Birla Institute of Technology Ranchi", "KLE Academy of Higher Education",
    "D.Y. Patil Vidyapeeth", "Symbiosis International University",
    "Pondicherry University", "Mizoram University", "Central University of Punjab",
    "International Institute of Information Technology Hyderabad", "P. S. G. College of Arts and Science",
    "Hindu College", "Miranda House", "St. Stephen's College",
    "Presidency College Chennai", "Loyola College Chennai", "Hans Raj College",
    "Acharya Nagarjuna University", "Amity University Haryana", "Assam University",
    "Banasthali Vidyapith", "Bangalore University", "Bharati Vidyapeeth",
    "Central University of Tamil Nadu", "CCS Haryana Agricultural University",
    "Chettinad Academy of Research and Education", "Chitkara University",
    "Dibrugarh University", "Dr. B R Ambedkar National Institute of Technology Jalandhar",
    "G.B. Pant University of Agriculture and Technology", "Guru Gobind Singh Indraprastha University",
    "Hindustan Institute of Technology and Science", "IIEST Shibpur",
    "IIIT Allahabad", "IIT Palakkad", "IIT Tirupati", "IIT Dharwad",
    "Jawaharlal Nehru Technological University Hyderabad", "Karunya Institute of Technology and Sciences",
    "Kurukshetra University", "Madan Mohan Malaviya University of Technology",
    "Manipal University Jaipur", "National Institute of Technology Delhi",
    "National Institute of Technology Durgapur", "National Institute of Technology Patna",
    "National Institute of Technology Raipur", "National Institute of Technology Srinagar",
    "NITTE Mangaluru", "PES University Bengaluru", "Punjab Engineering College",
    "Rajalakshmi Engineering College", "R.V. College of Engineering",
    "Santal Longowal Institute of Engineering and Technology", "Sharda University",
    "Sri Balaji Vidyapeeth", "Sri Ramachandra Institute of Higher Education",
    "SVKM`s Narsee Monjee Institute of Management Studies", "Tata Institute of Social Sciences",
    "University of Agricultural Sciences Bengaluru", "Veermata Jijabai Technological Institute",
    "Visvesvaraya Technological University Belgaum"
];

function Profile() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null); // 🟢 Ref for file input
    
    const [user, setUser] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", college: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [collegeSearch, setCollegeSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setEditData({ name: storedUser.name, college: storedUser.college || "" });
            setCollegeSearch(storedUser.college || "");
            loadMyPosts(storedUser.id || storedUser._id);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🟢 HANDLE RESUME UPLOAD
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file); // Ensure this key matches backend 'upload.single("resume")'

        try {
            // Show Loading SweetAlert
            Swal.fire({
                title: 'Analyzing Resume...',
                text: 'Extracting skills using AI...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
                background: '#1a1a2e',
                color: '#fff'
            });

            // 🟢 CALL BACKEND API
            // MAKE SURE THIS URL MATCHES YOUR BACKEND PORT/PATH
            const res = await fetch("https://skillsync-backend-2mw0.onrender.com/profile/upload-resume", { 
                method: "POST", // Your controller is "uploadResume", likely a POST or PUT
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                // Update Local State with new skills
                const updatedUser = { ...user, skills: data.skills };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist

                Swal.fire({
                    icon: 'success',
                    title: 'Skills Refreshed!',
                    text: `Found ${data.skills.length} skills. Profile updated.`,
                    background: '#1a1a2e',
                    color: '#fff',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                throw new Error(data.message || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Parsing Error',
                text: 'Could not parse resume. Try a different PDF.',
                background: '#1a1a2e',
                color: '#fff'
            });
        } finally {
            // Reset input so user can select same file again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const loadMyPosts = async (userId) => {
        try {
            const res = await fetchAnnouncements();
            const filtered = res.announcements.filter(p => (p.createdBy?._id || p.createdBy) === userId);
            setMyPosts(filtered);
        } catch (err) { console.error("Error loading personal posts", err); }
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdate = async () => {
        setLoading(true); 
        try {
            const response = await fetch("https://skillsync-backend-2mw0.onrender.com/profile/edit", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(editData)
            });
            const result = await response.json();
            if (response.ok) {
                const updatedUser = result.user || { ...user, ...editData };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setIsEditing(false);
                showToast("Profile updated successfully!", "success");
            } else { showToast(result.message || "Update failed", "error"); }
        } catch (err) { showToast("Connection failed", "error"); }
        finally { setLoading(false); }
    };

    const filteredColleges = COLLEGE_LIST.filter(c => 
        c.toLowerCase().includes(collegeSearch.toLowerCase())
    );

    if (!user) return <div className="loading-text">Loading Hub...</div>;

    return (
        <div className="profile-page-layout">
            <div className="profile-container">
                
                <div className="profile-header-glass">
                    <div className="profile-avatar-large">
                        <div className="avatar-glow"></div>
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    
                    <div className="profile-info-main">
                        {!isEditing ? (
                            <>
                                <h1 className="profile-display-name">{user.name}</h1>
                                <p className="profile-display-email">{user.email}</p>
                                <div className="profile-college-badge">
                                    {user.college ? `🎓 ${user.college}` : "⚠️ College Not Set"}
                                </div>
                            </>
                        ) : (
                            <div className="profile-edit-inputs">
                                <div className="input-field-group">
                                    <label className="cp-crimson-label">Full Name</label>
                                    <input 
                                        className="profile-glass-input" 
                                        value={editData.name} 
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-field-group" ref={dropdownRef}>
                                    <label className="cp-crimson-label">College Selection</label>
                                    <div className="searchable-dropdown-wrapper">
                                        <input 
                                            className="profile-glass-input" 
                                            placeholder="Type to search college..."
                                            value={collegeSearch}
                                            disabled={user.college && user.college !== ""} 
                                            onFocus={() => setShowSuggestions(true)}
                                            onChange={(e) => {
                                                setCollegeSearch(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                        />
                                        
                                        {showSuggestions && !user.college && (
                                            <div className="custom-suggestions-menu">
                                                {filteredColleges.length > 0 ? (
                                                    filteredColleges.map((college, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="suggestion-item"
                                                            onClick={() => {
                                                                setEditData({...editData, college: college});
                                                                setCollegeSearch(college);
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            {college}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="suggestion-no-results">No colleges found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {user.college && <p className="lock-notice">College name cannot be changed.</p>}
                                </div>
                            </div>
                        )}
                        
                        {/* 🟢 NEW: Upload Resume Button */}
                        <div className="resume-action-area" style={{ marginTop: '16px' }}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: "none" }} 
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                            />
                            <button 
                                className="edit-profile-btn" 
                                onClick={() => fileInputRef.current.click()}
                                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }}
                            >
                                📄 Update Resume & Sync Skills
                            </button>
                        </div>
                    </div>

                    <div className="profile-header-actions">
                        {!isEditing ? (
                            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                        ) : (
                            <div className="edit-actions-group">
                                <button className="profile-save-btn" onClick={handleUpdate} disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                                <button className="profile-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-sidebar">
                        <div className="stat-card-glass">
                            <h3 className="cp-crimson-label">Activity</h3>
                            <div className="stat-row">
                                <span className="stat-label">Posts</span>
                                <span className="stat-num">{myPosts.length}</span>
                            </div>
                        </div>

                        <div className="skills-card-glass">
                            <h3 className="cp-crimson-label">Skills</h3>
                            <div className="skill-tags-wrapper">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((s, i) => (
                                        // Handle both string array or object array if your backend changes
                                        <span key={i} className="profile-skill-tag">
                                            {typeof s === 'string' ? s : s.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-skills-text">No skills found. Upload resume.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-main-feed">
                        <div className="feed-header-area">
                            <h2 className="section-header">My Announcements</h2>
                            <div className="header-line"></div>
                        </div>
                        <div className="posts-container-grid">
                            {myPosts.length > 0 ? (
                                myPosts.map(post => <PostCard key={post._id} post={post} currentUser={user} />)
                            ) : (
                                <div className="empty-feed-msg">No opportunities launched yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {toast && (
                  <div className={`cp-toast ${toast.type}`}>
                    <span>{toast.type === "success" ? "✅" : "❌"}</span>
                    <span>{toast.message}</span>
                  </div>
                )}
            </div>
        </div>
    );
}

export default Profile;