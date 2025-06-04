import { Routes, Route, useLocation } from "react-router-dom";
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

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Browse Startups", href: "/startups", icon: "🚀" },
  { label: "AI Matching", href: "/matching", icon: "🎯" },
  { label: "Schedule", href: "/schedule", icon: "📅" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

function AppContent() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Check if current route is login or signup
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/signup";
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
          <Sidebar items={sidebarItems} currentPath={location.pathname} />
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
