import React from "react";
import "../styles/SentimentIndicator.css";

/**
 * SentimentIndicator Component
 * Displays the sentiment of a message with visual indicator and label
 */
const SentimentIndicator = ({ sentiment = null, score = null }) => {
  if (!sentiment) {
    return null;
  }

  const getSentimentColor = () => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "#4CAF50"; // green
      case "negative":
        return "#f44336"; // red
      case "neutral":
        return "#2196F3"; // blue
      default:
        return "#999";
    }
  };

  const getSentimentEmoji = () => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      case "neutral":
        return "😐";
      default:
        return "🤖";
    }
  };

  return (
    <div className="sentiment-indicator" style={{ borderLeftColor: getSentimentColor() }}>
      <span className="sentiment-emoji">{getSentimentEmoji()}</span>
      <div className="sentiment-info">
        <span className="sentiment-label">{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>
        {score && <span className="sentiment-score">{(score * 100).toFixed(1)}%</span>}
      </div>
    </div>
  );
};

export default SentimentIndicator;
