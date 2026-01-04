// src/components/FeatureCard.jsx
import React from "react";
import "../styles/DashboardNew.css";

const FeatureCard = ({ title, description, onClick }) => {
  const getEmoji = (title) => {
    const emojiMap = {
      "Chat / Messaging": "💬",
      "Voice Messaging": "🎤",
      "AI Smart Replies": "✨",
      "Profile & Settings": "⚙️",
    };
    return emojiMap[title] || "🚀";
  };

  return (
    <div className="feature-card" onClick={onClick}>
      <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>
        {getEmoji(title)}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="feature-card-button">Get Started →</button>
    </div>
  );
};

export default FeatureCard;
