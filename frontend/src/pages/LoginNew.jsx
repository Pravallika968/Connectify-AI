import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AuthNew.css";

const LoginNew = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("email", data.user.email);
      sessionStorage.setItem("name", data.user.name);

      navigate("/dashboard");
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
          <div className="auth-logo">🔐</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Connectify AI account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message">{error}</div>}

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
                placeholder="Enter your password"
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
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button 
            type="submit" 
            className="auth-btn auth-btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button className="social-btn" type="button" title="Sign in with Google">
            🔵
          </button>
          <button className="social-btn" type="button" title="Sign in with GitHub">
            ⚫
          </button>
        </div>

        <div className="auth-links">
          <p>
            Don't have an account? 
            <Link to="/signup"> Create one now</Link>
          </p>
          <p>
            <Link to="/">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;
