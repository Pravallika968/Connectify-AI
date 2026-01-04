import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = [
      {
        name: "Alice Johnson",
        phone: "+1234567890",
        email: "alice@example.com",
        password: await bcrypt.hash("password123", 10),
        friends: [],
        profilePic: "",
        bio: "Hello, I'm Alice!",
        gender: "Female",
        username: "alice_j",
        isOnline: false,
        lastSeen: new Date(),
      },
      {
        name: "Bob Smith",
        phone: "+1234567891",
        email: "bob@example.com",
        password: await bcrypt.hash("password123", 10),
        friends: [],
        profilePic: "",
        bio: "Hi, I'm Bob!",
        gender: "Male",
        username: "bob_s",
        isOnline: false,
        lastSeen: new Date(),
      },
      {
        name: "Charlie Brown",
        phone: "+1234567892",
        email: "charlie@example.com",
        password: await bcrypt.hash("password123", 10),
        friends: [],
        profilePic: "",
        bio: "Hey, I'm Charlie!",
        gender: "Male",
        username: "charlie_b",
        isOnline: false,
        lastSeen: new Date(),
      },
      {
        name: "SmartBot",
        phone: "+0000000000",
        email: "bot@smartconnect.ai",
        password: await bcrypt.hash("botpassword", 10),
        friends: [],
        profilePic: "",
        bio: "I'm SmartBot, your AI assistant!",
        gender: "Other",
        username: "smartbot",
        isOnline: true,
        lastSeen: new Date(),
      },
    ];

    // Check if users already exist and insert only if not
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`User ${userData.name} created`);
      } else {
        console.log(`User ${userData.name} already exists`);
      }
    }

    console.log("Sample users seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error);
    mongoose.connection.close();
  }
};

seedUsers();
