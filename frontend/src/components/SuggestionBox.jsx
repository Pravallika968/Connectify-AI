import React from "react";
import "../styles/SuggestionBox.css";

/**
 * SuggestionBox Component
 * Displays AI-generated reply suggestions
 */
const SuggestionBox = ({ suggestions = [], onSelectSuggestion = () => {} }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestion-box">
      <div className="suggestion-header">
        <span className="suggestion-icon">💡</span>
        <span className="suggestion-title">Quick Replies</span>
      </div>
      <div className="suggestion-list">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-item"
            onClick={() => onSelectSuggestion(suggestion)}
            title={suggestion}
          >
            <span className="suggestion-text">{suggestion.substring(0, 50)}</span>
            {suggestion.length > 50 && <span className="suggestion-dots">...</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionBox;
