import React from "react";
import "../styles/Navbar.css";


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Connectify AI</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
};

export default Navbar; 