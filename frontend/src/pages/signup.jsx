import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { signupUser } from "../api/auth";
import Swal from "sweetalert2"; 

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signupUser({ name, email, password });

      if (res.success) {
        Swal.fire({
          title: 'Welcome to SkillSync!',
          text: 'Account created successfully.',
          icon: 'success',
          background: '#1a1a2e', 
          color: '#ffffff', 
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#e94560' 
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
      } else {
        Swal.fire({
          title: 'Oops...',
          text: res.message || "Signup failed. Please try again.",
          icon: 'error',
          background: '#1a1a2e',
          color: '#ffffff',
          confirmButtonColor: '#e94560'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Network Error',
        text: 'Something went wrong. Check your connection.',
        icon: 'error',
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonColor: '#e94560'
      });
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card">
        <h2 className="title">Create Account</h2>
        <p className="subtitle">Join the hackathon revolution</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                /* Eye Slash Icon (Hide) */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                /* Eye Icon (Show) */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </span>
          </div>

          <button className="btn-glow" type="submit">
            Sign Up
          </button>
        </form>
        
        <p className="footer-text">
          Already have an account? <span className="link" onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;