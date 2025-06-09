import { Routes, Route, Navigate } from "react-router-dom";
import { Layout, Navbar, Sidebar } from "@esal/ui";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Lightbulb,
  Bot,
  TrendingUp,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import DashboardModern from "./pages/Dashboard_fixed";
import AIGenerator from "./pages/AIGenerator";
import Metrics from "./pages/Metrics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmailConfirmed from "./pages/EmailConfirmed";
import EmailVerification from "./pages/EmailVerification";
// New page imports
import IdeaDetails from "./pages/IdeaDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import MyIdeas from "./pages/MyIdeas";

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: <BarChart3 className="w-5 h-5" /> },
  {
    label: "My Ideas",
    href: "/my-ideas",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    label: "AI Generator",
    href: "/ai-generator",
    icon: <Bot className="w-5 h-5" />,
  },
  {
    label: "Metrics",
    href: "/metrics",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  { label: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon className="w-5 h-5" />,
  },
];

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("access_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Auth redirect component - prevents logged-in users from accessing login/signup
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/" replace /> : <>{children}</>;
};

// Auth layout component
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {    // Check for existing token and get user info
    const token = localStorage.getItem("access_token");
    if (token) {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      // Fetch user data from backend with token
      fetch(`${apiUrl}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch user data");
          }
        })
        .then((userData) => {
          setUser({
            name: userData.full_name || userData.email,
            role: userData.role,
            email: userData.email,
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // Clear invalid token
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        });
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/email-confirmed" element={<EmailConfirmed />} />
      <Route path="/email-verification" element={<EmailVerification />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </AuthRedirect>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRedirect>
            <AuthLayout>
              <Signup />
            </AuthLayout>
          </AuthRedirect>
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout
              navbar={
                <Navbar
                  title="Innovator Portal"
                  user={user}
                  onLogout={handleLogout}
                />
              }
              sidebar={
                <Sidebar
                  items={sidebarItems}
                  currentPath={window.location.pathname}
                />
              }
            >
              {" "}
              <Routes>
                <Route path="/" element={<DashboardModern />} />
                <Route path="/ai-generator" element={<AIGenerator />} />
                <Route path="/metrics" element={<Metrics />} />{" "}
                <Route path="/ideas/:ideaId" element={<IdeaDetails />} />{" "}
                <Route path="/my-ideas" element={<MyIdeas />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
