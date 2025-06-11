import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Layout, Navbar, Sidebar } from "@esal/ui";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import BrowseStartups from "./pages/BrowseStartups";
import Matching from "./pages/Matching";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerification from "./pages/EmailVerification";
import { BarChart3, Rocket, Target, Calendar, User } from "lucide-react";

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: <BarChart3 size={18} className="stroke-2" />,
  },
  {
    label: "Browse Startups",
    href: "/startups",
    icon: <Rocket size={18} className="stroke-2" />,
  },
  {
    label: "AI Matching",
    href: "/matching",
    icon: <Target size={18} className="stroke-2" />,
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: <Calendar size={18} className="stroke-2" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User size={18} className="stroke-2" />,
  },
];

function AppContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };
  // Check if current route is login, signup, or email verification
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/email-verification";
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-verification" element={<EmailVerification />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <Layout
        navbar={
          <Navbar
            title="Investor Portal"
            user={{
              name: user?.full_name || "Investor",
              role: "Investor",
              avatar_url: user?.avatar_url,
            }}
            onLogout={handleLogout}
          />
        }
        sidebar={
          <Sidebar
            items={sidebarItems}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
            user={{
              name: user?.full_name || "Investor",
              email: user?.email || "",
              role: "Investor",
              avatar_url: user?.avatar_url,
            }}
          />
        }
      >
        {" "}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/startups" element={<BrowseStartups />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
