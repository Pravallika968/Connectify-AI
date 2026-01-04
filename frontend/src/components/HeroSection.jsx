import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleLearnMore = () => {
    const featuresSection = document.querySelector(".features-section-home");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Welcome to Connectify AI</h1>
        <p>Your ultimate AI-powered real-time communication platform for seamless collaboration with intelligent features.</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleGetStarted}>
            Get Started →
          </button>
          <button className="btn-secondary" onClick={handleLearnMore}>
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
