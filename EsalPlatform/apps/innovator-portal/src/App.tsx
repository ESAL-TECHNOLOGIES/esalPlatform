import { Routes, Route, Navigate } from "react-router-dom";
import { Layout, Navbar, Sidebar } from "@esal/ui";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AIGenerator from "./pages/AIGenerator";
import Metrics from "./pages/Metrics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Upload Idea", href: "/upload", icon: "📤" },
  { label: "AI Generator", href: "/ai-generator", icon: "🤖" },
  { label: "Metrics", href: "/metrics", icon: "📈" },
];

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("access_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Auth layout component
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and get user info
    const token = localStorage.getItem("access_token");
    if (token) {
      // TODO: Fetch user data from backend with token
      // For now, use placeholder data
      setUser({
        name: "John Doe",
        role: "Innovator",
        email: "john@example.com",
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
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthLayout>
            <Signup />
          </AuthLayout>
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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/ai-generator" element={<AIGenerator />} />
                <Route path="/metrics" element={<Metrics />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
