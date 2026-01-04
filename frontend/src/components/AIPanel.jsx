import React, { useState, useEffect } from "react";
import "../styles/AIPanel.css";

/**
 * AIPanel Component
 * Comprehensive panel showing AI analysis of messages and conversation
 */
const AIPanel = ({ selectedMessage = null, conversation = [] }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"); // analysis, translate, summarize

  // Analyze sentiment of selected message
  const analyzeSentiment = async () => {
    if (!selectedMessage) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedMessage.text }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        sentiment: data,
      });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Detect message intent
  const detectIntent = async () => {
    if (!selectedMessage) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/recognize-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: selectedMessage.text }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        intent: data,
      });
    } catch (error) {
      console.error("Error detecting intent:", error);
    } finally {
      setLoading(false);
    }
  };

  // Detect spam
  const detectSpam = async () => {
    if (!selectedMessage) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/detect-spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedMessage.text }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        spam: data,
      });
    } catch (error) {
      console.error("Error detecting spam:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get reply suggestions
  const getSuggestions = async () => {
    if (!selectedMessage) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/get-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: selectedMessage.text }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        suggestions: data.suggestions,
      });
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Translate message
  const translateMessage = async (language = "es") => {
    if (!selectedMessage) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedMessage.text, targetLanguage: language }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        translation: data,
      });
    } catch (error) {
      console.error("Error translating:", error);
    } finally {
      setLoading(false);
    }
  };

  // Summarize conversation
  const summarizeConversation = async () => {
    if (!conversation || conversation.length === 0) return;

    setLoading(true);
    try {
      const messages = conversation.map((msg) => ({
        senderName: msg.senderId?.name || "User",
        text: msg.text,
      }));

      const response = await fetch("http://localhost:5000/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();
      setAiAnalysis({
        ...aiAnalysis,
        summary: data.summary,
      });
    } catch (error) {
      console.error("Error summarizing:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMessage) {
      setAiAnalysis(null);
      setActiveTab("analysis");
    }
  }, [selectedMessage]);

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h3>🤖 AI Assistant</h3>
        <span className="ai-icon">✨</span>
      </div>

      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === "analysis" ? "active" : ""}`}
          onClick={() => setActiveTab("analysis")}
        >
          Analysis
        </button>
        <button
          className={`ai-tab ${activeTab === "translate" ? "active" : ""}`}
          onClick={() => setActiveTab("translate")}
        >
          Translate
        </button>
        <button
          className={`ai-tab ${activeTab === "summarize" ? "active" : ""}`}
          onClick={() => setActiveTab("summarize")}
        >
          Summary
        </button>
      </div>

      <div className="ai-content">
        {!selectedMessage && activeTab === "analysis" && (
          <div className="ai-placeholder">
            <p>👈 Select a message to analyze</p>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && selectedMessage && (
          <div className="ai-analysis">
            <p className="ai-message-preview">{selectedMessage.text.substring(0, 100)}...</p>

            <div className="ai-buttons">
              <button onClick={analyzeSentiment} disabled={loading} className="ai-btn">
                {loading ? "🔄 Analyzing..." : "😊 Sentiment"}
              </button>
              <button onClick={detectIntent} disabled={loading} className="ai-btn">
                {loading ? "🔄 Detecting..." : "🎯 Intent"}
              </button>
              <button onClick={detectSpam} disabled={loading} className="ai-btn">
                {loading ? "🔄 Checking..." : "🚫 Spam"}
              </button>
              <button onClick={getSuggestions} disabled={loading} className="ai-btn">
                {loading ? "🔄 Suggesting..." : "💡 Suggestions"}
              </button>
            </div>

            {aiAnalysis && (
              <div className="ai-results">
                {aiAnalysis.sentiment && (
                  <div className="ai-result-item">
                    <strong>Sentiment:</strong>
                    <span className="result-value">
                      {aiAnalysis.sentiment.label} ({(aiAnalysis.sentiment.score * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
                {aiAnalysis.intent && (
                  <div className="ai-result-item">
                    <strong>Intent:</strong>
                    <span className="result-value">{aiAnalysis.intent.intent}</span>
                  </div>
                )}
                {aiAnalysis.spam && (
                  <div className="ai-result-item">
                    <strong>Spam Check:</strong>
                    <span className={`result-value ${aiAnalysis.spam.isSpam ? "spam" : "safe"}`}>
                      {aiAnalysis.spam.isSpam ? "⚠️ Possible Spam" : "✅ Safe"}
                    </span>
                  </div>
                )}
                {aiAnalysis.suggestions && (
                  <div className="ai-result-item">
                    <strong>Suggestions:</strong>
                    <div className="suggestions-list">
                      {aiAnalysis.suggestions.map((sugg, idx) => (
                        <p key={idx} className="suggestion">{sugg}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Translate Tab */}
        {activeTab === "translate" && selectedMessage && (
          <div className="ai-translate">
            <p className="ai-message-preview">{selectedMessage.text.substring(0, 100)}...</p>

            <div className="language-buttons">
              <button onClick={() => translateMessage("es")} disabled={loading} className="lang-btn">
                🇪🇸 Spanish
              </button>
              <button onClick={() => translateMessage("fr")} disabled={loading} className="lang-btn">
                🇫🇷 French
              </button>
              <button onClick={() => translateMessage("de")} disabled={loading} className="lang-btn">
                🇩🇪 German
              </button>
              <button onClick={() => translateMessage("it")} disabled={loading} className="lang-btn">
                🇮🇹 Italian
              </button>
              <button onClick={() => translateMessage("pt")} disabled={loading} className="lang-btn">
                🇵🇹 Portuguese
              </button>
            </div>

            {aiAnalysis?.translation && (
              <div className="translation-result">
                <h4>Translation</h4>
                <p className="translated-text">{aiAnalysis.translation.translated}</p>
              </div>
            )}
          </div>
        )}

        {/* Summarize Tab */}
        {activeTab === "summarize" && (
          <div className="ai-summarize">
            <button
              onClick={summarizeConversation}
              disabled={loading || conversation.length === 0}
              className="summarize-btn"
            >
              {loading ? "🔄 Summarizing..." : "📝 Summarize Conversation"}
            </button>

            {aiAnalysis?.summary && (
              <div className="summary-result">
                <h4>Conversation Summary</h4>
                <p>{aiAnalysis.summary}</p>
              </div>
            )}

            {conversation.length === 0 && (
              <p className="no-conversation">No conversation to summarize</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
