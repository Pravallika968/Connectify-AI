import React, { useState } from "react";
import "../styles/ContactPage.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <h1>Get In Touch</h1>
        <p>Have questions? We'd love to hear from you. Send us a message!</p>
      </section>

      <div className="contact-content">
        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button type="submit" className="submit-btn">
              {submitted ? "Message Sent! ✓" : "Send Message"}
            </button>
          </form>
        </div>

        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <h3>Email</h3>
            <p>support@connectifyai.com</p>
            <a href="mailto:support@connectifyai.com">Send Email</a>
          </div>

          <div className="info-card">
            <div className="info-icon">📱</div>
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
            <a href="tel:+15551234567">Call Us</a>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Location</h3>
            <p>123 Tech Street, San Francisco, CA 94105</p>
            <a href="#">Get Directions</a>
          </div>

          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p className="hours-note">Saturday & Sunday: Closed</p>
          </div>
        </div>
      </div>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How do I reset my password?</h4>
            <p>Click on "Forgot Password" on the login page and follow the instructions sent to your email.</p>
          </div>

          <div className="faq-item">
            <h4>Is my data secure?</h4>
            <p>Yes! We use end-to-end encryption and follow industry best practices to protect your data.</p>
          </div>

          <div className="faq-item">
            <h4>Can I use SmartConnect on mobile?</h4>
            <p>Absolutely! SmartConnect is fully responsive and works on all devices including mobile phones.</p>
          </div>

          <div className="faq-item">
            <h4>How do I create a group chat?</h4>
            <p>In the Dashboard, click "Create Group" and add members. You can customize group settings anytime.</p>
          </div>

          <div className="faq-item">
            <h4>What are voice messages?</h4>
            <p>Voice messages let you send audio recordings instead of typing. Great for quick updates!</p>
          </div>

          <div className="faq-item">
            <h4>How does AI assist me?</h4>
            <p>Our AI provides smart suggestions, translations, and sentiment analysis to enhance communication.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
