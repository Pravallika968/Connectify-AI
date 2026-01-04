import React from "react";
import "../styles/FeaturesSection.css";

// Import images explicitly
import userImg from "../assets/user.jpg";
import secureImg from "../assets/secure.jpg";
import aiImg from "../assets/ai.jpg";
import voiceImg from "../assets/voice.jpg";

const features = [
  {
    title: "User Customization",
    description:
      "Personalize your AI workspace to suit your team’s workflow and preferences",
    image: userImg,
  },
  {
    title: "Secure Authentication",
    description:
      "Protect your account and data with advanced AI-powered security measures.",
    image: secureImg,
  },
  {
    title: "AI-Powered Smart Replies",
    description:
      "Get intelligent, context-aware responses to streamline your communication.",
    image: aiImg,
  },
  {
    title: "Voice Messaging",
    description:
      "Send and receive voice messages seamlessly for faster, hands-free communication.",
    image: voiceImg,
  },
];

const FeaturesSection = () => {
  return (
    <section className="features" id="features">
      <h2>Our Features</h2>
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <img src={feature.image} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
