import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginNew from "./pages/LoginNew";
import SignupNew from "./pages/SignupNew";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import ChatMessaging from "./pages/ChatMessaging";
import Contact from "./pages/Contact";

function App() {
  const location = useLocation();

  // Paths where Navbar and Footer should NOT appear
  const hideLayoutPaths = ["/dashboard", "/login", "/signup", "/profile-settings", "/chat"];

  const hideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginNew />} />
        <Route path="/signup" element={<SignupNew />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/chat" element={<ChatMessaging />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {!hideLayout && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

// Wrap App in Router here
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
