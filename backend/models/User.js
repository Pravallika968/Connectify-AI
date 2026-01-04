// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: String }],

  profilePic: String,
  bio: String,
  gender: String,
  username: String,
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: () => new Date() }, // Set to now on creation
  socketId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);


