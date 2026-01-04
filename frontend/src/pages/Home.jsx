import React from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import "../styles/HomeNew.css";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Send instant messages with friends and groups with crystal-clear delivery confirmation."
    },
    {
      icon: "🎤",
      title: "Voice Messages",
      description: "Share voice notes for more personal and quick communication with your contacts."
    },
    {
      icon: "✨",
      title: "AI Smart Features",
      description: "Get intelligent suggestions, translations, and sentiment analysis powered by AI."
    },
    {
      icon: "🔒",
      title: "Secure Encryption",
      description: "Your messages are protected with end-to-end encryption for complete privacy."
    },
    {
      icon: "📱",
      title: "Cross Platform",
      description: "Access your chats seamlessly across all your devices anytime, anywhere."
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with millions of users worldwide and build meaningful relationships."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      text: "SmartConnect made staying in touch with friends so much easier! The AI suggestions are amazing.",
      stars: "⭐⭐⭐⭐⭐"
    },
    {
      name: "Mike Chen",
      role: "Professional",
      text: "The voice messages feature saves me so much time. Perfect for when I'm on the go!",
      stars: "⭐⭐⭐⭐⭐"
    },
    {
      name: "Emma Wilson",
      role: "Digital Marketer",
      text: "Love how intuitive and modern the interface is. Best chat app I've used so far.",
      stars: "⭐⭐⭐⭐⭐"
    }
  ];

  return (
    <div className="home-container">
      <HeroSection />
      
      {/* Features Section */}
      <section className="features-section-home" id="features">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need for seamless communication</p>
        </div>
        <div className="features-grid-home">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-item"
              onClick={() => navigate("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <button className="feature-btn" onClick={(e) => { e.stopPropagation(); navigate("/dashboard"); }}>
                Explore →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Connect?</h2>
        <p>Join thousands of users enjoying seamless communication with Connectify AI</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Get Started Now →
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Users Say</h2>
          <p>Join our happy community of connected users</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-stars">{testimonial.stars}</div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-sections">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a onClick={() => navigate("/contact")} style={{ cursor: "pointer" }}>Contact</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
                <li><a href="#gdpr">GDPR</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <ul>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#facebook">Facebook</a></li>
                <li><a href="#linkedin">LinkedIn</a></li>
                <li><a href="#instagram">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Connectify AI. All rights reserved. Made with ❤️ for better communication.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
