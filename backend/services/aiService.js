import axios from "axios";
import OpenAI from "openai";

/**
 * AI Service Module for Chat Analysis and Enhancement
 * Features: Sentiment Analysis, Auto-Reply Suggestions, Translation, Text Summarization, Spam Detection, GPT Responses
 */

// Initialize OpenAI client (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize OpenAI client:", error.message);
  }
} else {
  console.log("⚠️ OpenAI API key not configured");
}

// ===========================
// 1. SENTIMENT ANALYSIS
// ===========================
export const analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return { sentiment: "neutral", score: 0 };
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      }
    );

    const result = response.data[0];
    const sentiment = result.label.toLowerCase();
    const score = result.score;

    return {
      sentiment: sentiment,
      score: score,
      label:
        sentiment === "positive"
          ? "😊 Positive"
          : sentiment === "negative"
          ? "😞 Negative"
          : "😐 Neutral",
    };
  } catch (error) {
    console.error("❌ Sentiment analysis error:", error.message);
    return { sentiment: "neutral", score: 0, label: "😐 Neutral" };
  }
};

// ===========================
// 2. AUTO-REPLY SUGGESTIONS
// ===========================
export const getSuggestions = async (message) => {
  try {
    if (!message || message.trim().length === 0) return [];

    if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === "your_huggingface_api_key_here") {
      console.log("⚠️ Hugging Face API key not configured, using fallback suggestions");
      return getFallbackSuggestions(message);
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      { inputs: message },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    const suggestions = [
      response.data[0]?.generated_text || "Thanks for your message!",
      "Sounds good! Let me get back to you on this.",
      "I appreciate that. Let me think about it.",
    ];

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error("❌ Suggestions error:", error.message);
    return getFallbackSuggestions(message);
  }
};

const getFallbackSuggestions = (message) => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return ["Hello! How can I help you today?", "Hi there! What's on your mind?", "Hey! Nice to hear from you."];
  } else if (lowerMessage.includes("thank")) {
    return ["You're welcome!", "Happy to help!", "No problem at all."];
  } else if (lowerMessage.includes("?")) {
    return ["That's a great question! Let me think about it.", "I'll look into that for you.", "Good point! Let me get back to you on this."];
  } else {
    return ["Thanks for your message!", "I appreciate you sharing that.", "Let me get back to you on this."];
  }
};

// ===========================
// 3. MESSAGE TRANSLATION
// ===========================
export const translateMessage = async (text, targetLanguage = "es") => {
  try {
    if (!text || text.trim().length === 0) return { original: text, translated: text, language: targetLanguage };

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-${targetLanguage}`,
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    const translated = response.data[0]?.translation_text || text;
    return { original: text, translated, language: targetLanguage };
  } catch (error) {
    console.error("❌ Translation error:", error.message);
    return { original: text, translated: text, language: targetLanguage };
  }
};

// ===========================
// 4. TEXT SUMMARIZATION
// ===========================
export const summarizeConversation = async (messages) => {
  try {
    if (!messages || messages.length === 0) return "No messages to summarize.";

    const conversationText = messages.map((msg) => `${msg.senderName}: ${msg.text}`).join(" ");
    if (conversationText.length < 50) return conversationText;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: conversationText, parameters: { max_length: 150, min_length: 50 } },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    return response.data[0]?.summary_text || conversationText.substring(0, 150);
  } catch (error) {
    console.error("❌ Summarization error:", error.message);
    return "Unable to summarize at the moment.";
  }
};

// ===========================
// 5. SPAM DETECTION (IMPROVED)
// ===========================
export const detectSpam = async (text) => {
  try {
    if (!text || text.trim().length === 0) return { isSpam: false, confidence: 0 };

    // Normalize text: lowercase and remove punctuation
    const cleanedText = text.toLowerCase().replace(/[^\w\s]/gi, " ");

    const spamKeywords = ["click", "buy now", "limited offer", "congratulations", "verify", "free", "winner", "prize", "cash", "earn money"];

    const matchedKeywords = spamKeywords.filter((keyword) => cleanedText.includes(keyword));
    const isSpam = matchedKeywords.length > 0;
    const confidence = isSpam ? Math.min(0.8 + 0.05 * matchedKeywords.length, 0.99) : 0.05;

    console.log("🔹 Spam check:", { text, isSpam, matchedKeywords, confidence }); // debug log
    return { isSpam, confidence };
  } catch (error) {
    console.error("❌ Spam detection error:", error.message);
    return { isSpam: false, confidence: 0 };
  }
};

// ===========================
// 6. INTENT RECOGNITION
// ===========================
export const recognizeIntent = async (message) => {
  try {
    if (!message || message.trim().length === 0) return { intent: "unknown", confidence: 0 };

    const intents = {
      greeting: ["hi", "hello", "hey", "greetings"],
      goodbye: ["bye", "goodbye", "see you", "farewell"],
      question: ["?", "what", "how", "why", "when", "where"],
      request: ["please", "can you", "could you", "would you"],
      gratitude: ["thanks", "thank you", "appreciate", "grateful"],
    };

    const lowerMessage = message.toLowerCase();
    let detectedIntent = "statement";
    let confidence = 0.5;

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        detectedIntent = intent;
        confidence = 0.8;
        break;
      }
    }

    return { intent: detectedIntent, confidence, message };
  } catch (error) {
    console.error("❌ Intent recognition error:", error.message);
    return { intent: "unknown", confidence: 0, message };
  }
};

// ===========================
// 7. PROFANITY FILTER
// ===========================
export const filterProfanity = async (text) => {
  try {
    if (!text || text.trim().length === 0) return { filtered: text, hasProfanity: false };

    const profanityList = ["badword1", "badword2", "offensive"];
    let filtered = text;
    let hasProfanity = false;

    profanityList.forEach((word) => {
      const regex = new RegExp(word, "gi");
      if (regex.test(text)) {
        hasProfanity = true;
        filtered = filtered.replace(regex, "*".repeat(word.length));
      }
    });

    return { filtered, hasProfanity };
  } catch (error) {
    console.error("❌ Profanity filter error:", error.message);
    return { filtered: text, hasProfanity: false };
  }
};

// ===========================
// 8. GPT CHAT RESPONSE
// ===========================
export const getGPTResponse = async (userMessage) => {
  try {
    if (!openai) {
      console.error("❌ OpenAI client not initialized - check API key");
      return "Sorry, I'm having trouble responding right now. Please try again later.";
    }

    if (!userMessage || userMessage.trim().length === 0) {
      return "I'm sorry, I didn't receive a message to respond to.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are SmartBot, a helpful AI assistant in a chat application. Keep responses friendly, concise, and helpful. Respond naturally to user queries."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ GPT response error:", error.message);
    // Check if it's a quota exceeded error
    if (error.message && error.message.includes("quota")) {
      return "I'm currently out of API credits. Please try again later or contact support.";
    }
    return "Sorry, I'm having trouble responding right now. Please try again later.";
  }
};

// ===========================
// 9. RULE-BASED RESPONSES
// ===========================
export const getRuleBasedResponse = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  // Greetings
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hello! How can I help you today?";
  }

  // Goodbyes
  if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye") || lowerMessage.includes("see you")) {
    return "Goodbye! Have a great day!";
  }

  // Thanks
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're welcome! Is there anything else I can help with?";
  }

  // Help
  if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
    return "I'm here to help! You can ask me questions, get information, or just chat. What would you like to know?";
  }

  // Time/Date
  if (lowerMessage.includes("time") || lowerMessage.includes("date")) {
    return `Current time is ${new Date().toLocaleString()}.`;
  }

  // Weather (placeholder)
  if (lowerMessage.includes("weather")) {
    return "I don't have access to real-time weather data, but I can suggest checking a weather app or website!";
  }

  // Default fallback
  return null; // Return null to indicate no rule-based response, use GPT
};

// ===========================
// 10. BOT RESPONSE HANDLER
// ===========================
export const getBotResponse = async (userMessage) => {
  // First, try rule-based response
  const ruleResponse = getRuleBasedResponse(userMessage);
  if (ruleResponse) {
    return ruleResponse;
  }

  // Fallback to GPT
  return await getGPTResponse(userMessage);
};

// ===========================
// 11. EXPORT ALL FUNCTIONS
// ===========================
export default {
  analyzeSentiment,
  getSuggestions,
  translateMessage,
  summarizeConversation,
  detectSpam,
  recognizeIntent,
  filterProfanity,
  getGPTResponse,
  getRuleBasedResponse,
  getBotResponse,
};
