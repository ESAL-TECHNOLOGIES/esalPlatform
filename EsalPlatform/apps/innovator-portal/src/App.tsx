import { Routes, Route } from "react-router-dom";
import { Layout, Navbar, Sidebar } from "@esal/ui";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AIGenerator from "./pages/AIGenerator";
import Metrics from "./pages/Metrics";

const sidebarItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Upload Idea", href: "/upload", icon: "📤" },
  { label: "AI Generator", href: "/ai-generator", icon: "🤖" },
  { label: "Metrics", href: "/metrics", icon: "📈" },
];

function App() {
  const user = {
    name: "John Doe",
    role: "Innovator",
  };

  const handleLogout = () => {
    // Placeholder logout logic
    console.log("Logging out...");
  };

  return (
    <Layout
      navbar={
        <Navbar title="Innovator Portal" user={user} onLogout={handleLogout} />
      }
      sidebar={
        <Sidebar items={sidebarItems} currentPath={window.location.pathname} />
      }
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/ai-generator" element={<AIGenerator />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
    </Layout>
  );
}

export default App;
