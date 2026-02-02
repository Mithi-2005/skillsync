import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import "./navbar.css";

function Navbar() {
    const navigate = useNavigate();
    
    const user = localStorage.getItem("user"); 
    const isLoggedIn = !!user; 

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e94560',
            cancelButtonColor: '#1a1a2e',
            confirmButtonText: 'Yes, Logout',
            background: '#1a1a2e',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("user");
                localStorage.removeItem("token"); 
                
                navigate("/");
                
                Swal.fire({
                    icon: 'success',
                    title: 'Logged Out',
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#1a1a2e',
                    color: '#fff'
                });
            }
        });
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to={isLoggedIn ? "/announcements" : "/login"} className="logo">
                    SkillSync
                </Link>
            </div>

            <div className="navbar-right">
                {isLoggedIn ? (
                    <>
                        <Link to="/announcements" className="nav-link">Dashboard</Link>
                        <Link to="/rooms" className="nav-link">Rooms</Link>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/signup" className="btn-highlight">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;