import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PostCard from "../components/postcard.jsx";
import ResumeBanner from "../components/resumebanner.jsx";
import { fetchAnnouncements } from "../api/posts.js";
import "./announcements.css";

function Announcements() {
    const { hash } = useLocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [activeFilter, setActiveFilter] = useState("all"); 
    const [sortBy, setSortBy] = useState("newest"); 
    const [scopeFilter, setScopeFilter] = useState("all"); 
    
    const [showSort, setShowSort] = useState(false); 
    const [showScope, setShowScope] = useState(false); 
    
    const sortRef = useRef(null);
    const scopeRef = useRef(null);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isSkillsMissing = !currentUser?.skills || currentUser.skills.length === 0;
    const isCollegeMissing = !currentUser?.college || currentUser.college.trim() === "";

    useEffect(() => {
        const loadAnnouncements = async () => {
            try {
                const res = await fetchAnnouncements();
                setPosts(res.announcements || []);
            } catch (error) {
                console.log(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (!loading && hash && posts.length > 0) {
            const targetId = hash.replace("#", "");
            
            const scrollAttempt = () => {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    element.style.transition = "all 0.5s ease";
                    element.style.borderColor = "#ef4444";
                    element.style.boxShadow = "0 0 40px rgba(239, 68, 68, 0.4)";
                    
                    setTimeout(() => {
                        element.style.borderColor = "";
                        element.style.boxShadow = "";
                    }, 4000);
                    return true;
                }
                return false;
            };

            if (!scrollAttempt()) {
                const interval = setInterval(() => {
                    if (scrollAttempt()) clearInterval(interval);
                }, 100);
                setTimeout(() => clearInterval(interval), 2000);
            }
        }
    }, [loading, hash, posts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) setShowSort(false);
            if (scopeRef.current && !scopeRef.current.contains(event.target)) setShowScope(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const processedPosts = posts
        .filter((post) => {
            const isTargetPost = hash === `#post-${post._id}`;
            if (isTargetPost) return true;

            const isPublic = post.scope === "public";
            const creatorCollege = post.createdBy?.college || post.creator?.college;
            const userCollege = currentUser?.college;

            const isSameCollege = userCollege && 
                                  creatorCollege && 
                                  userCollege.trim().toLowerCase() === creatorCollege.trim().toLowerCase();
            
            if (!isPublic && !isSameCollege) return false;

            if (scopeFilter !== "all" && post.scope !== scopeFilter) return false;

            const matchesCategory = activeFilter === "all" || post.category?.toLowerCase() === activeFilter.toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                post.title?.toLowerCase().includes(query) || 
                post.description?.toLowerCase().includes(query) ||
                post.skillsRequired?.some(skill => skill.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {            
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "popular") return (b.room?.members?.length || 0) - (a.room?.members?.length || 0);
            return 0;
        });

    return (
        <div className="dashboard-layout">
            <div className="feed-section">
               {isSkillsMissing ? (
                    <div className="profile-completion-banner">
                        <div className="banner-content">
                            <span className="banner-icon">📄</span>
                            <div className="banner-text">
                                <strong>Resume Missing</strong>
                                <p>Upload your resume to extract skills and unlock AI matching.</p>
                            </div>
                        </div>
                        <button className="banner-cta-btn" onClick={() => navigate("/profile")}>
                            Upload Resume
                        </button>
                    </div>
                ) : isCollegeMissing ? (
                    <div className="profile-completion-banner">
                        <div className="banner-content">
                            <span className="banner-icon">🎓</span>
                            <div className="banner-text">
                                <strong>Unlock Campus Opportunities</strong>
                                <p>Set your college name to view exclusive projects from your campus.</p>
                            </div>
                        </div>
                        <button className="banner-cta-btn" onClick={() => navigate("/profile")}>
                            Update Profile
                        </button>
                    </div>
                ) : null}
                <div className="search-section-wrapper">
                    <div className="search-glass-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            className="classy-search-input" 
                            placeholder="Search projects or skills..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
                        )}
                    </div>
                </div>

                <div className="feed-header">
                    <h2 className="feed-title">Discover</h2>
                    <span className="feed-count">{processedPosts.length} Results Found</span>
                </div>

                <div className="modern-filter-container">
                    <div className="filter-glass-track">
                        <div className="filter-group">
                            {["all", "hackathon", "project"].map(type => (
                                <button 
                                    key={type}
                                    className={`modern-filter-item ${activeFilter === type ? "active" : ""}`}
                                    onClick={() => setActiveFilter(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)} Feed
                                    {activeFilter === type && <div className="active-dot"></div>}
                                </button>
                            ))}
                        </div>

                        <div className="actions-group">
                            <div className="custom-sort-wrapper" ref={scopeRef}>
                                <button className={`sort-trigger ${showScope ? 'active' : ''}`} onClick={() => setShowScope(!showScope)}>
                                    <span>{scopeFilter === "all" ? "All Scopes" : scopeFilter === "public" ? "🌍 Public" : "🎓 College"}</span>
                                    <span className="sort-arrow">▼</span>
                                </button>
                                {showScope && (
                                    <div className="sort-dropdown-menu">
                                        <div className="sort-option" onClick={() => { setScopeFilter("all"); setShowScope(false); }}>All Scopes</div>
                                        <div className="sort-option" onClick={() => { setScopeFilter("public"); setShowScope(false); }}>🌍 Public</div>
                                        <div className="sort-option" onClick={() => { setScopeFilter("college"); setShowScope(false); }}>🎓 My College</div>
                                    </div>
                                )}
                            </div>

                            <div className="custom-sort-wrapper" ref={sortRef}>
                                <button className={`sort-trigger ${showSort ? 'active' : ''}`} onClick={() => setShowSort(!showSort)}>
                                    <span>{sortBy === "newest" ? "Newest First" : "Most Popular"}</span>
                                    <span className="sort-arrow">▼</span>
                                </button>
                                {showSort && (
                                    <div className="sort-dropdown-menu">
                                        <div className={`sort-option ${sortBy === "newest" ? "selected" : ""}`} onClick={() => { setSortBy("newest"); setShowSort(false); }}>Newest First</div>
                                        <div className={`sort-option ${sortBy === "popular" ? "selected" : ""}`} onClick={() => { setSortBy("popular"); setShowSort(false); }}>Most Popular</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="posts-container">
                    {loading ? (
                        <div className="loading-text">Scanning Feed...</div>
                    ) : processedPosts.length > 0 ? (
                        processedPosts.map((post) => (
                            <PostCard key={post._id} post={post} currentUser={currentUser} />
                        ))
                    ) : (
                        <div className="empty-state-container">
                            <div className="empty-state-icon"><div className="empty-glow-circle"></div><span>🔍</span></div>
                            <h3 className="empty-state-title">No matching opportunities</h3>
                            <button className="empty-state-reset" onClick={() => { setSearchQuery(""); setActiveFilter("all"); setScopeFilter("all"); }}>Clear All Filters</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="sidebar-section"><ResumeBanner /></div>
            <button className="fab-btn" onClick={() => navigate("/posts/create")}>+</button>
        </div>
    );
}

export default Announcements;