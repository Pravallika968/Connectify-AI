import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ✅ Fetch current user info
router.get("/current", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Populate friends with name, email, online status, lastSeen, profilePic, and bio
    const friendUsers = await User.find({ email: { $in: user.friends || [] } });
    const friendsWithNames = friendUsers.map(f => ({
      name: f.name,
      email: f.email,
      profilePic: f.profilePic || "",
      bio: f.bio || "",
      isOnline: f.isOnline || false,
      lastSeen: f.lastSeen || null,
    }));

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic || "",
      bio: user.bio || "",
      gender: user.gender || "",
      username: user.username || "",
      friends: friendsWithNames,
      groups: [],
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update profile details
router.put("/update-profile", async (req, res) => {
  try {
    const { email, username, name, bio, gender, phone, profilePic } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.gender = gender || user.gender;
    user.phone = phone || user.phone;

    // Optional: in case frontend sends Base64 directly
    if (profilePic) {
      user.profilePic = profilePic;
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add friends
router.post("/add-friends", async (req, res) => {
  try {
    const { userEmail, friendEmails } = req.body;

    if (!userEmail || !friendEmails?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedFriends = [...new Set([...(user.friends || []), ...friendEmails])];
    user.friends = updatedFriends;
    await user.save();

    res.status(200).json({
      message: "Friends added successfully",
      friends: user.friends,
    });
  } catch (error) {
    console.error("Error adding friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put("/update-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};
    console.log("update-password request body:", req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
