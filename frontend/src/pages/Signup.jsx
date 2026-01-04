// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Frontend validation
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

      alert("Signup Successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <form onSubmit={handleSignup} className="signup-form">
        {error && <p className="error">{error}</p>}

        <label>Name:</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Phone Number:</label>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Signup;
