import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AuthNew.css";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !phone || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      alert("✅ Signup Successful! Please login to your account.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎉</div>
          <h1>Join Connectify AI</h1>
          <p>Create your account to start messaging</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">
              Full Name
              <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
              <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address
              <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              <span className="required">*</span>
            </label>
            <div className="password-toggle">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title="Show/hide password"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <Link to="/">Terms & Conditions</Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-btn auth-btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button className="social-btn" type="button" title="Sign up with Google">
            🔵
          </button>
          <button className="social-btn" type="button" title="Sign up with GitHub">
            ⚫
          </button>
        </div>

        <div className="auth-links">
          <p>
            Already have an account? 
            <Link to="/login"> Sign in instead</Link>
          </p>
          <p>
            <Link to="/">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
