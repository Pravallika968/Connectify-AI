// // routes/members.js
// import express from "express";
// import User from "../models/User.js"; // assuming you have a User model

// const router = express.Router();

// // Get all members
// router.get("/", async (req, res) => {
//   try {
//     const members = await User.find({}, "name email"); // only fetch required fields
//     res.json(members);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch members" });
//   }
// });

// export default router;



import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get all members with status and last seen
router.get("/", async (req, res) => {
  try {
    // Fetch all users except their passwords
    const members = await User.find({}, "name email profilePic isOnline lastSeen");

    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

export default router;
