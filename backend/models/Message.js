// models/Message.js
// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema(
//   {
//     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String },
//     fileUrl: { type: String },
//     fileType: { type: String, enum: ["image", "pdf", "audio", "text"], default: "text" },
//     fileName: { type: String },
//     isSeen: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Message", messageSchema);




// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for group messages
    },

    text: {
      type: String, // ✅ will store text + emojis as Unicode
      trim: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "audio", "text"],
      default: "text",
    },
    fileName: {
      type: String,
      default: null,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    // ✅ AI-related fields
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: null,
    },
    sentimentScore: {
      type: Number,
      default: null,
    },
    suggestedReplies: {
      type: [String],
      default: [],
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
    messageIntent: {
      type: String,
      default: "statement",
    },
    translation: {
      language: String,
      text: String,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    deletedFor: {
      type: [String], // Array of emails who deleted this message for themselves
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
