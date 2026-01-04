import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeNavbar.css";

const HomeNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear(); // clear saved user data
    navigate("/login");
  };

  return (
    <nav className="home-navbar">
      <div className="home-logo">Connectify AI</div>
      <ul className="home-nav-links">
        <li>
          <a onClick={() => navigate("/profile-settings")}>Profile</a>
        </li>
        <li>
          <a onClick={handleLogout}>Logout</a>
        </li>
      </ul>
    </nav>
  );
};

export default HomeNavbar;
