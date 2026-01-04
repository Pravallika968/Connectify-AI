import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

import multer from "multer";
import path from "path";
import fs from "fs";
import AIService from "../services/aiService.js"; // ✅ Make sure path is correct
import { io } from "../server.js"; // Import io for socket emission

const router = express.Router();

// Edit (update) a message by ID (WhatsApp-like: only sender, within 15 minutes)
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, userEmail } = req.body;

    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });
    if (!userEmail) return res.status(400).json({ success: false, message: 'userEmail is required' });

    const message = await Message.findById(id).populate('senderId', 'email');
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only sender can edit
    if (message.senderId.email !== userEmail) {
      return res.status(403).json({ success: false, message: 'Only sender can edit the message' });
    }

    // Check if within 15 minutes
    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    if (timeDiff > fifteenMinutes) {
      return res.status(400).json({ success: false, message: 'Cannot edit message after 15 minutes' });
    }

    const updated = await Message.findByIdAndUpdate(id, { text }, { new: true })
      .populate("senderId", "name email")

    res.json({ success: true, message: 'Message updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete a message by ID (WhatsApp-like: delete for me or delete for everyone)
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, deleteForEveryone = false } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'userEmail is required' });
    }

    const message = await Message.findById(id).populate('senderId', 'email').populate('receiverId', 'email');
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const isSender = message.senderId.email === userEmail;
    const isReceiver = message.receiverId.email === userEmail;

    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
    }

    if (deleteForEveryone) {
      // Only sender can delete for everyone, and within 15 minutes
      if (!isSender) {
        return res.status(403).json({ success: false, message: 'Only sender can delete for everyone' });
      }
      const timeDiff = Date.now() - new Date(message.createdAt).getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      if (timeDiff > fifteenMinutes) {
        return res.status(400).json({ success: false, message: 'Cannot delete for everyone after 15 minutes' });
      }
      // Hard delete the message
      await Message.findByIdAndDelete(id);
      res.json({ success: true, message: 'Message deleted for everyone' });
    } else {
      // Delete for me: Add userEmail to deletedFor array
      if (!message.deletedFor.includes(userEmail)) {
        message.deletedFor.push(userEmail);
        await message.save();
      }
      res.json({ success: true, message: 'Message deleted for you' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ✅ Proper folder setup for chat files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/chat_files/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Fetch messages between two users
router.get("/getMessages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { senderEmail: user1, receiverEmail: user2 },
      { senderEmail: user2, receiverEmail: user1 },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// ===========================
// ✅ SEND MESSAGE (Modified for Group Support)
// ===========================
router.post("/send", upload.single("file"), async (req, res) => {
  try {
    const { senderEmail, receiverEmail, text } = req.body;

    if (!senderEmail) {
      return res.status(400).json({ message: "Missing sender email" });
    }

    if (!receiverEmail) {
      return res.status(400).json({ message: "Missing receiver email" });
    }

    const sender = await User.findOne({ email: senderEmail });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const recipientEmails = [receiverEmail];

    let fileUrl = null;
    let fileType = "text";
    let fileName = null;

    if (req.file) {
      fileUrl = `/uploads/chat_files/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).toLowerCase();

      if ([".mp3", ".wav", ".webm", ".m4a"].includes(ext)) fileType = "audio";
      else if (ext === ".pdf") fileType = "pdf";
      else if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) fileType = "image";
      fileName = req.file.originalname;
    }

    // ✅ AI Analysis
    const spamResult = await AIService.detectSpam(text || "");
    const sentimentResult = await AIService.analyzeSentiment(text || "");
    const intentResult = await AIService.recognizeIntent(text || "");

    const newMessage = new Message({
      senderId: sender._id,
      receiverId: receiver._id,
      text: text || "",
      fileUrl,
      fileType,
      fileName,
      isSpam: spamResult.isSpam,
      sentimentScore: sentimentResult.score,
      messageIntent: intentResult.intent,
      suggestedReplies: await AIService.getSuggestions(text || "")
    });
    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    console.log("✅ Message saved:", populatedMessage);

    // ✅ Emit to all recipients via Socket.IO
    recipientEmails.forEach(email => {
      io.to(email).emit("receiveMessage", populatedMessage);
    });

    // ✅ Bot Response Logic - Enhanced for automatic responses to SmartBot
    if (receiverEmail === "bot@smartconnect.ai" && text && text.trim().length > 0) {
      try {
        const botResponse = await AIService.getBotResponse(text.trim());

        const botUser = await User.findOne({ email: "bot@smartconnect.ai" });
        if (botUser) {
          const botReply = new Message({
            senderId: botUser._id,
            receiverId: sender._id,
            text: botResponse,
            isBot: true,
          });
          await botReply.save();

          const populatedBotReply = await Message.findById(botReply._id)
            .populate("senderId", "name email")
            .populate("receiverId", "name email");

          // Emit bot response via socket
          io.to(senderEmail).emit("receiveMessage", populatedBotReply);
        }
      } catch (botError) {
        console.error("❌ Bot response error:", botError);
      }
    }

    // Keep @bot prefix logic for manual bot triggering if needed
    if (text && text.trim().toLowerCase().startsWith("@bot")) {
      console.log("🔹 @bot detected:", text);
      const botMessage = text.trim().substring(4).trim(); // Remove "@bot" prefix
      console.log("🔹 Bot message:", botMessage);

      if (botMessage.length > 0) {
        try {
          const botResponse = await AIService.getBotResponse(botMessage);
          console.log("🔹 Bot response generated:", botResponse);

          const botUser = await User.findOne({ email: "bot@smartconnect.ai" });
          if (botUser) {
            const botReply = new Message({
              senderId: botUser._id,
              receiverId: sender._id,
              text: botResponse,
              isBot: true,
            });
            await botReply.save();

            const populatedBotReply = await Message.findById(botReply._id)
              .populate("senderId", "name email")
              .populate("receiverId", "name email");

            console.log("🔹 Emitting bot response to:", senderEmail);
            // Emit bot response via socket
            io.to(senderEmail).emit("receiveMessage", populatedBotReply);
          } else {
            console.log("❌ Bot user not found");
          }
        } catch (botError) {
          console.error("❌ Bot response error:", botError);
        }
      } else {
        console.log("🔹 Bot message is empty");
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Fetch conversation between two users (filter out deleted messages for the user)
router.get("/conversation", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.query;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver)
      return res.status(404).json({ message: "User not found" });

    const messages = await Message.find({
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id },
      ],
      deletedFor: { $ne: senderEmail }, // Exclude messages deleted for sender
    })
      .populate("senderId", "email name")
      .populate("receiverId", "email name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Mark messages as seen
router.put("/mark-seen", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.body;

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver)
      return res.status(404).json({ message: "User not found" });

    await Message.updateMany(
      { senderId: receiver._id, receiverId: sender._id, isSeen: false },
      { $set: { isSeen: true } }
    );

    res.json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Unread message count
router.get("/unread-count", async (req, res) => {
  const { senderEmail, receiverEmail } = req.query;

  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    const count = await Message.countDocuments({
      senderId: sender._id,
      receiverId: receiver._id,
      isSeen: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching unread count" });
  }
});

// Last message time
router.get("/last-message-time", async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Missing users" });
    }

    const lastMessage = await Message.findOne({
      $or: [
        { senderEmail: user1, receiverEmail: user2 },
        { senderEmail: user2, receiverEmail: user1 },
      ],
    })
      .sort({ createdAt: -1 })
      .select("createdAt");

    res.json({
      lastMessageTime: lastMessage ? lastMessage.createdAt : null,
    });
  } catch (error) {
    console.error("Error getting last message time:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear chat (soft delete all messages for the user)
router.delete("/clear-chat", async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.body;

    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ message: "Missing senderEmail or receiverEmail" });
    }

    // Soft delete: Add senderEmail to deletedFor for all messages in the conversation
    await Message.updateMany(
      {
        $or: [
          { senderId: { $exists: true }, receiverId: { $exists: true } },
          { senderEmail, receiverEmail },
          { senderEmail: receiverEmail, receiverEmail: senderEmail },
        ],
      },
      { $addToSet: { deletedFor: senderEmail } }
    );

    res.json({ success: true, message: "Chat cleared for you" });
  } catch (err) {
    console.error("Error clearing chat:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// Share message to multiple users (WhatsApp-like: only sender can share)
router.post("/share", async (req, res) => {
  try {
    const { senderEmail, recipientEmails, text, fileUrl, fileType, originalMessageId } = req.body;

    if (!senderEmail || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({ message: "Missing senderEmail or recipientEmails" });
    }

    // Verify sender permission: only sender of original message can share
    if (originalMessageId) {
      const originalMessage = await Message.findById(originalMessageId).populate('senderId', 'email');
      if (!originalMessage) {
        return res.status(404).json({ message: "Original message not found" });
      }
      if (originalMessage.senderId.email !== senderEmail) {
        return res.status(403).json({ message: "Only sender can share the message" });
      }
    }

    const sender = await User.findOne({ email: senderEmail });
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const recipients = await User.find({ email: { $in: recipientEmails } });
    if (!recipients || recipients.length === 0) {
      return res.status(404).json({ message: "No valid recipients found" });
    }

    const docs = recipients.map((r) => ({
      senderId: sender._id,
      receiverId: r._id,
      text: text || undefined,
      fileUrl: fileUrl || undefined,
      fileType: fileType || undefined,
      createdAt: new Date(),
    }));

    const created = await Message.insertMany(docs);

    const populated = await Message.find({ _id: { $in: created.map((c) => c._id) } })
      .populate("senderId", "email name")
      .populate("receiverId", "email name");

    return res.status(201).json({ success: true, created: populated });
  } catch (err) {
    console.error("Error in /chat/share:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
