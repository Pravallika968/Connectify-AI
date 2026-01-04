
import express from "express";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put("/upload-profile-pic", upload.single("profilePic"), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Convert to Base64
    user.profilePic = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    await user.save();

    res.json({ message: "Profile picture updated", profilePic: user.profilePic });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
