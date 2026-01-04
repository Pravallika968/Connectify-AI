
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import HomeNavbar from "../components/HomeNavbar";
import defaultImg from "../assets/default.jpeg";
import "../styles/DashboardNew.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [userFriends, setUserFriends] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [members, setMembers] = useState([]);
  const [notifications] = useState(["Let's Connect with new friends"]);

  // Group creation modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupProfilePic, setGroupProfilePic] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  const navigate = useNavigate();

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const email = sessionStorage.getItem("email");
        if (!email) return;

        const response = await fetch(
          `http://localhost:5000/api/user/current?email=${email}`
        );

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();

        setUserName(data.name);

        // ✅ Normalize friends (convert to list of emails)
        const friendEmails = Array.isArray(data.friends)
          ? data.friends.map((f) => (typeof f === "string" ? f : f.email))
          : [];

        setUserFriends(friendEmails);
        setUserGroups(data.groups || []);

        sessionStorage.setItem("name", data.name);
        sessionStorage.setItem("email", data.email);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // ✅ Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/members");
        if (!res.ok) throw new Error("Failed to fetch members");
        setMembers(await res.json());
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  // ✅ Checkbox toggle
  const handleCheckboxChange = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // ✅ Add friends to DB
  const handleAddFriends = async () => {
    if (selectedFriends.length === 0) {
      alert("Please select at least one member.");
      return;
    }

    try {
      const userEmail = sessionStorage.getItem("email");

      // Get selected friends’ emails
      const friendEmails = members
        .filter((m) => selectedFriends.includes(m._id))
        .map((m) => m.email);

      const response = await fetch("http://localhost:5000/api/user/add-friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, friendEmails }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add friends");

      alert(`Friends added: ${friendEmails.join(", ")}`);

      // ✅ Update local state
      setUserFriends((prev) => [...new Set([...prev, ...friendEmails])]);
      setSelectedFriends([]);
      setShowFriendsList(false);
    } catch (err) {
      console.error("Error adding friends:", err);
      alert("Error adding friends. Try again!");
    }
  };

  // ✅ Group member checkbox toggle
  const handleGroupMemberChange = (email) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // ✅ Create group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in to create a group.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          members: selectedGroupMembers,
          profilePic: groupProfilePic,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to create group");

      alert(`Group "${groupName}" created successfully!`);

      // Reset form
      setGroupName("");
      setGroupDescription("");
      setGroupProfilePic("");
      setSelectedGroupMembers([]);
      setShowCreateGroupModal(false);
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Error creating group. Try again!");
    }
  };

  const features = [
    {
      title: "Chat / Messaging",
      description: "Send instant messages",
      onClick: () => navigate("/chat"),
    },
    {
      title: "Voice Messaging",
      description: "Send quick voice messages",
      onClick: () => {
        navigate("/chat");
        // Voice messaging is integrated in the chat interface
      },
    },
    {
      title: "AI Smart Replies",
      description: "AI suggests intelligent responses",
      onClick: () => navigate("/chat"),
    },
    {
      title: "Create Group",
      description: "Create a new group chat",
      onClick: () => setShowCreateGroupModal(true),
    },
    {
      title: "Profile & Settings",
      description: "Manage your account",
      onClick: () => navigate("/profile-settings"),
    },
  ];

  return (
    <>
      <HomeNavbar />

      <div className="dashboard-container">
        <section className="welcome-section">
          <h1>Welcome, {userName ? userName : "Loading..."}!</h1>
          <p>Here’s a quick summary of your notifications and tasks:</p>

          <ul className="notifications-list">
            {notifications.map((note, i) => (
              <li
                key={i}
                className={note.includes("friends") ? "clickable" : ""}
                onClick={
                  note.includes("friends")
                    ? () => setShowFriendsList(!showFriendsList)
                    : undefined
                }
              >
                {note}
              </li>
            ))}
          </ul>

          {showFriendsList && (
            <div className="friends-list">
              <h3>Select Friends to Add ({members.filter((m) => m.email !== sessionStorage.getItem("email") && !userFriends.includes(m.email)).length} available)</h3>
              <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
                <ul>
                  {members.length === 0 ? (
                    <li style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      Loading members...
                    </li>
                  ) : members.filter((m) => {
                    const currentEmail = sessionStorage.getItem("email");
                    return (
                      m.email !== currentEmail &&
                      !userFriends.includes(m.email)
                    );
                  }).length === 0 ? (
                    <li style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      All members are already your friends!
                    </li>
                  ) : (
                    members
                      .filter((m) => {
                        const currentEmail = sessionStorage.getItem("email");
                        return (
                          m.email !== currentEmail &&
                          !userFriends.includes(m.email)
                        );
                      })
                      .map((m) => (
                        <li key={m._id} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={selectedFriends.includes(m._id)}
                              onChange={() => handleCheckboxChange(m._id)}
                            />
                            {m.name} ({m.email})
                          </label>
                        </li>
                      ))
                  )}
                </ul>
              </div>
              <button className="add-friend-btn" onClick={handleAddFriends}>
                Add Selected Friends
              </button>
            </div>
          )}
        </section>

        {/* Groups Section */}
        {userGroups.length > 0 && (
          <section className="groups-section">
            <h2>Your Groups</h2>
            <div className="groups-list">
              {userGroups.map((group, index) => (
                <div key={index} className="group-item">
                  <img
                    src={group.profilePic || defaultImg}
                    alt={group.name}
                    className="group-avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultImg;
                    }}
                  />
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p>{group.description || "No description"}</p>
                    <small>{group.members?.length || 0} members</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="features-section">
          <h2>What you can do</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Create New Group</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Enter group description (optional)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Profile Picture URL</label>
                  <input
                    type="url"
                    value={groupProfilePic}
                    onChange={(e) => setGroupProfilePic(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>Add Friends ({userFriends.length} available)</label>
                  <div className="friends-selection">
                    {userFriends.length === 0 ? (
                      <p style={{ color: "#999", fontStyle: "italic" }}>
                        No friends available. Add friends first to create groups.
                      </p>
                    ) : (
                      userFriends.map((email) => {
                        const friend = members.find((m) => m.email === email);
                        return (
                          <label key={email} className="friend-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedGroupMembers.includes(email)}
                              onChange={() => handleGroupMemberChange(email)}
                            />
                            {friend ? friend.name : email} ({email})
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateGroupModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="create-btn">
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
