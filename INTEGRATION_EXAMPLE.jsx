/**
 * QUICK START: AI Integration Example for ChatMessaging.jsx
 * 
 * This file shows how to integrate AI components into your existing ChatMessaging page.
 * Copy and paste the relevant sections into your actual ChatMessaging.jsx file.
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatMessaging.css";
import defaultImg from "../assets/default.jpeg";
import EmojiPicker from "emoji-picker-react";
import socket from "../socket.js";
import axios from "axios";

// ===== ADD THESE IMPORTS =====
import AIPanel from "../components/AIPanel.jsx";
import SentimentIndicator from "../components/SentimentIndicator.jsx";
import SuggestionBox from "../components/SuggestionBox.jsx";

const ChatMessaging = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const messagesEndRef = useRef(null);
  const selectedMessageRef = useRef(null);

  // ===== EXISTING STATE =====
  const [friends, setFriends] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [file, setFile] = useState(null);
  const currentUser = sessionStorage.getItem("email");

  // ===== ADD THESE NEW STATE VARIABLES =====
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [messageAISentiments, setMessageAISentiments] = useState({});

  // ===== SCROLL TO BOTTOM =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedFriend && messages[selectedFriend]) {
      scrollToBottom();
    }
  }, [messages, selectedFriend]);

  // ===== AI HELPER: Get sentiment for all messages =====
  const fetchMessageSentiments = async (msgs) => {
    try {
      for (const msg of msgs) {
        if (msg.text && !messageAISentiments[msg._id]) {
          const response = await fetch(
            `${BASE_URL}/api/ai/analyze-sentiment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: msg.text }),
            }
          );
          const sentiment = await response.json();
          setMessageAISentiments((prev) => ({
            ...prev,
            [msg._id]: sentiment,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching sentiments:", error);
    }
  };

  // ===== AI HELPER: Get suggestions when message is selected =====
  const handleMessageRightClick = async (e, message) => {
    e.preventDefault();
    setSelectedMessage(message);
    setShowAIPanel(true);

    // Get suggestions for the message
    try {
      const response = await fetch(`${BASE_URL}/api/ai/get-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.text }),
      });
      const data = await response.json();
      setSuggestedReplies(data.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    }
  };

  // ===== AI HELPER: Handle suggestion selection =====
  const handleSuggestionSelect = (suggestion) => {
    setNewMessage(suggestion);
    setSuggestedReplies([]);
  };

  // ===== FETCH MESSAGES (Modified to include sentiment) =====
  const fetchMessages = async (user1, user2) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/chat/conversation?senderEmail=${user1}&receiverEmail=${user2}`
      );
      const msgs = response.data;
      setMessages((prev) => ({
        ...prev,
        [user2]: msgs,
      }));

      // Fetch sentiments for these messages
      fetchMessageSentiments(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ===== MESSAGE SEND (You can add sentiment analysis here) =====
  const sendMessage = async () => {
    if (!newMessage.trim() && !file) {
      alert("Message cannot be empty");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("senderEmail", currentUser);
      formData.append("receiverEmail", selectedFriend);
      formData.append("text", newMessage);

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(`${BASE_URL}/api/chat/send`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send");

      // Add to messages state
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: [...(prev[selectedFriend] || []), data.data],
      }));

      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  // ===== CLOSE AI PANEL =====
  const closeAIPanel = () => {
    setShowAIPanel(false);
    setSelectedMessage(null);
    setSuggestedReplies([]);
  };

  return (
    <div className="chat-messaging-container">
      {/* Friends List */}
      <div className="friends-sidebar">
        <h2>Chats</h2>
        <div className="friends-list">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className={`friend-item ${selectedFriend === friend.email ? "active" : ""}`}
              onClick={() => {
                setSelectedFriend(friend.email);
                fetchMessages(currentUser, friend.email);
              }}
            >
              <img src={friend.profilePic || defaultImg} alt={friend.name} />
              <div className="friend-info">
                <h4>{friend.name}</h4>
                <p>{friend.isOnline ? "🟢 Online" : "🔴 Offline"}</p>
              </div>
              {unreadCounts[friend.email] > 0 && (
                <span className="unread-badge">
                  {unreadCounts[friend.email]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <h3>{selectedFriend}</h3>
              <div className="header-actions">
                <button
                  className="ai-toggle-btn"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  title="Toggle AI Panel"
                >
                  🤖 AI
                </button>
              </div>
            </div>

            {/* Messages Display */}
            <div className="messages-container">
              {messages[selectedFriend]?.map((message) => (
                <div
                  key={message._id}
                  className={`message ${
                    message.senderId?.email === currentUser
                      ? "sent"
                      : "received"
                  }`}
                  onContextMenu={(e) => handleMessageRightClick(e, message)}
                >
                  <div className="message-content">
                    {message.text && <p>{message.text}</p>}

                    {/* Show Sentiment Indicator */}
                    {messageAISentiments[message._id] && (
                      <SentimentIndicator
                        sentiment={messageAISentiments[message._id].sentiment}
                        score={messageAISentiments[message._id].score}
                      />
                    )}

                    {message.fileUrl && (
                      <a
                        href={`${BASE_URL}${message.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📎 {message.fileName}
                      </a>
                    )}
                  </div>
                  <span className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Box */}
            {suggestedReplies.length > 0 && (
              <SuggestionBox
                suggestions={suggestedReplies}
                onSelectSuggestion={handleSuggestionSelect}
              />
            )}

            {/* Message Input */}
            <div className="message-input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>

              {/* Emoji Picker */}
              <div className="emoji-picker-container" ref={emojiRef}>
                {showEmojiPicker && (
                  <EmojiPicker onEmojiClick={(e) => setNewMessage(newMessage + e.emoji)} />
                )}
              </div>

              {/* File Upload */}
              <input
                type="file"
                id="file-input"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>

      {/* AI Panel Sidebar */}
      {showAIPanel && selectedFriend && (
        <div className="ai-panel-sidebar">
          <button className="close-ai-btn" onClick={closeAIPanel}>
            ✕
          </button>
          <AIPanel
            selectedMessage={selectedMessage}
            conversation={messages[selectedFriend] || []}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessaging;

/**
 * ===== CSS ADDITIONS FOR INTEGRATION =====
 * Add these styles to your ChatMessaging.css:
 */

/*
.chat-messaging-container {
  display: flex;
  gap: 16px;
  height: 100vh;
  background: #f5f5f5;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.ai-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.ai-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.message.sent {
  justify-content: flex-end;
}

.message-content {
  background: #667eea;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 60%;
  word-wrap: break-word;
}

.message.received .message-content {
  background: #e0e0e0;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
  align-self: flex-end;
}

.ai-panel-sidebar {
  width: 350px;
  background: white;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-ai-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  z-index: 10;
}

@media (max-width: 1024px) {
  .ai-panel-sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .chat-messaging-container {
    flex-direction: column;
  }

  .ai-panel-sidebar {
    width: 100%;
    height: 300px;
  }

  .message-content {
    max-width: 100%;
  }
}
*/
