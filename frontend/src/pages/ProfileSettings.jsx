import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSettings.css";
import userImg from "../assets/user.jpg";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const [user, setUser] = useState({
    profilePic: userImg, // default
    fullName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    currentPassword: "",
    newPassword: "",
    notifications: { email: true, sms: false, push: true },
    theme: "Light",
    timezone: "GMT+5:30",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = sessionStorage.getItem("email");
        if (!email) return;

        const res = await fetch(
          `http://localhost:5000/api/user/current?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (!res.ok) return;

        setUser((prev) => ({
          ...prev,
          fullName: data.fullName || data.name || prev.fullName,
          username: data.username || prev.username || "",
          email: data.email || prev.email,
          phone: data.phone || prev.phone || "",
          bio: data.bio || prev.bio || "",
          gender: data.gender || prev.gender || "",
          profilePic: data.profilePic || prev.profilePic, // Base64 string from DB
        }));
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // Handle profile input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name in user.notifications) {
      setUser((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [name]: checked },
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Update profile (username, bio, gender)
  const handleUpdateProfile = async () => {
    const emailToSend = user.email || sessionStorage.getItem("email");
    if (!emailToSend) return alert("No email found");

    try {
      const res = await fetch("http://localhost:5000/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToSend,
          username: user.username || "",
          bio: user.bio || "",
          gender: user.gender || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to update profile");
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later");
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!user.currentPassword || !user.newPassword)
      return alert("Please fill in both fields");

    try {
      const res = await fetch("http://localhost:5000/api/user/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: user.currentPassword,
          newPassword: user.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to update password");
      alert("Password updated successfully!");
      setUser((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later");
    }
  };

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  // Upload profile picture to server (Base64)
  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("email", user.email);

    try {
      const res = await fetch("http://localhost:5000/api/user/upload-profile-pic", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to upload photo");

      // Base64 string from backend
      setUser((prev) => ({ ...prev, profilePic: data.profilePic }));
      alert("Profile photo updated!");
    } catch (err) {
      console.error(err);
      alert("Server error while uploading photo");
    }
  };

  return (
    <div className="settings-container">
      <div className="sidebar">
        <button className="back-btn1" onClick={() => navigate("/dashboard")}>
          &larr; Back
        </button>
        <h2>Settings</h2>
        <ul>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </li>
          <li
            className={activeTab === "account" ? "active" : ""}
            onClick={() => setActiveTab("account")}
          >
            Account
          </li>
          <li
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </li>
          <li
            className={activeTab === "preferences" ? "active" : ""}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate("/login")}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeTab === "profile" && (
          <div className="tab-content">
            <h2>Profile</h2>
            <div className="profile-picture">
              <img src={user.profilePic} alt="Profile" />
              <input type="file" accept="image/*" onChange={handleProfilePicChange} />
              <button onClick={handleUploadPhoto}>Upload Photo</button>
            </div>

            {/* Non-editable */}
            <input
              type="text"
              name="fullName"
              value={user.fullName || ""}
              disabled
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={user.email || ""}
              disabled
              placeholder="Email"
            />
            <input
              type="tel"
              name="phone"
              value={user.phone || ""}
              disabled
              placeholder="Phone Number"
            />

            {/* Editable */}
            <input
              type="text"
              name="username"
              value={user.username || ""}
              onChange={handleInputChange}
              placeholder="Username"
            />
            <textarea
              name="bio"
              value={user.bio || ""}
              onChange={handleInputChange}
              placeholder="Bio"
            />
            <label>
              Gender:
              <select name="gender" value={user.gender || ""} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
            <button className="save-btn" onClick={handleUpdateProfile}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="tab-content">
            <h2>Account Settings</h2>
            <div className="change-password-section">
              <h3>Change Password</h3>
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={user.currentPassword || ""}
                onChange={(e) => setUser({ ...user, currentPassword: e.target.value })}
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={user.newPassword || ""}
                onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
              />
              <button onClick={handleUpdatePassword}>Update Password</button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="tab-content">
            <h2>Notification Settings</h2>
            <label>
              <input
                type="checkbox"
                name="email"
                checked={user.notifications.email}
                onChange={handleInputChange}
              />{" "}
              Email Notifications
            </label>
            <label>
              <input
                type="checkbox"
                name="sms"
                checked={user.notifications.sms}
                onChange={handleInputChange}
              />{" "}
              SMS Notifications
            </label>
            <label>
              <input
                type="checkbox"
                name="push"
                checked={user.notifications.push}
                onChange={handleInputChange}
              />{" "}
              Push Notifications
            </label>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="tab-content">
            <h2>App Preferences</h2>
            <label>
              Theme:
              <select name="theme" value={user.theme} onChange={handleInputChange}>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </label>
            <label>
              Timezone:
              <input
                type="text"
                name="timezone"
                value={user.timezone}
                onChange={handleInputChange}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
