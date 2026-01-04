import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import membersRoute from "./routes/members.js";
import userRoute from "./routes/user.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import User from "./models/User.js";

// ✅ ES module path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config({ path: "./config.env" });

// ✅ Initialize Express and HTTP server
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userConnections = {}; // Store multiple sockets per user

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔹 Register user socket
  socket.on("registerSocket", async (email) => {
    if (!email) return;

    if (!userConnections[email]) userConnections[email] = new Set();
    userConnections[email].add(socket.id);

    const user = await User.findOneAndUpdate(
      { email },
      { socketId: socket.id, isOnline: true },
      { new: true }
    );

    console.log(`🟢 ${email} connected (${userConnections[email].size} tabs)`);

    io.emit("updateUserStatus", {
      email: user.email,
      isOnline: true,
      lastSeen: user.lastSeen,
    });
  });

  // 🔹 Manual logout (user clicked Logout)
  socket.on("userOffline", async (email) => {
    if (!email) return;

    const lastSeen = new Date();
    const user = await User.findOneAndUpdate(
      { email },
      { isOnline: false, lastSeen, socketId: null },
      { new: true }
    );

    if (user) {
      console.log(`🔴 ${email} manually logged out`);
      io.emit("updateUserStatus", { email, isOnline: false, lastSeen });
    }
  });

  // 🔹 Disconnect handling (tab closed / network drop)
  socket.on("disconnect", async () => {
    const user = await User.findOne({ socketId: socket.id });
    if (!user) return;

    const email = user.email;
    if (userConnections[email]) {
      userConnections[email].delete(socket.id);

      if (userConnections[email].size === 0) {
        const lastSeen = new Date();
        await User.findOneAndUpdate(
          { email },
          { isOnline: false, lastSeen, socketId: null },
          { new: true }
        );

        console.log(`🔴 ${email} went offline`);
        io.emit("updateUserStatus", { email, isOnline: false, lastSeen });
      }
    }
  });

  // 🔹 Message relay
  socket.on("sendMessage", (messageData) => {
    const receiverEmail = messageData.receiverEmail || messageData.receiverId?.email;
    if (!receiverEmail) return;

    if (userConnections[receiverEmail]) {
      userConnections[receiverEmail].forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", messageData);
      });
    }
  });
});

// ✅ Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/members", membersRoute);
app.use("/api/user", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ✅ Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend allowed: ${process.env.FRONTEND_URL}`);
});

// ✅ Export io (optional use in other routes)
export { io };
