# Connectify-AI

**Connectify-AI** is a full-stack messaging platform with AI-powered features, designed for secure, intelligent, and interactive communication. Built with the MERN stack, it combines real-time messaging, AI analysis, and user management in one seamless application.

---

## 🌟 Features

- **Messaging:** Real-time text messaging between users.  
- **Voice Messaging:** Send and receive voice notes seamlessly.  
- **Groups:** Create and manage group chats.  
- **Last Seen:** Track user activity and display last seen status.  
- **Fraud Detection:** AI-powered detection of suspicious or harmful messages.  
- **Sentiment Analysis:** Analyze the sentiment of messages in real-time.  
- **Grammar Correction:** Automatic grammar and spelling corrections in messages.  
- **Profile Management:** Update user profiles, avatars, and personal information.  
- **Intent Analysis:** AI analyzes user intents to improve interactions.  
- **AI Chatbot:** Integrated AI chatbot for answering user queries and assisting in chats.  

---

## 🛠 Technologies Used

- **Frontend:** React.js, HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **Other Tools:** Git, GitHub, VSCode  

---

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/Pravallika968/Connectify-AI.git
cd Connectify-AI

2. **Install Backend Dependencies**
    cd backend
    npm install

3. **Install Frontend Dependencies**
    cd ../frontend
    npm install

4. ⚙️Environment Variables

    Create a .env file in the backend folder based on the example:
    
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    OPENAI_API_KEY=your_openai_api_key
    
    
    Important: Do NOT commit .env or config.env to GitHub.
    Use .gitignore to prevent sensitive files from being pushed.


 🏃 Running the Application

 1. Start the Backend Server
    cd backend
    node server.js
 2. Start the Frontend
    cd frontend
    npm run dev
 3. Open your browser at http://localhost:3000 to access the application.

🔒 Security Notes

gitignore prevents node_modules/ and environment files from being pushed.
Sensitive API keys and credentials are never stored in the repository.
Always use environment variables for secrets like OpenAI API keys.

📂 File Structure

Connectify-AI/
├── backend/
│   ├── config.env       # ignored
│   ├── server.js
│   ├── routes/
│   └── models/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── public/
├── .gitignore
├── README.md


 📞 Contact

Developed by Pravallika Pikkili
GitHub: https://github.com/Pravallika968
Email: pravallikapikkili7@gmail.com
