import { Routes, Route } from 'react-router-dom';
import { Layout, Navbar, Sidebar } from '@esal/ui';
import Dashboard from './pages/Dashboard';
import Startups from './pages/Startups';
import Matching from './pages/Matching';
import Schedule from './pages/Schedule';

const sidebarItems = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Browse Startups', href: '/startups', icon: '🚀' },
  { label: 'AI Matching', href: '/matching', icon: '🎯' },
  { label: 'Schedule', href: '/schedule', icon: '📅' },
];

function App() {
  const user = {
    name: 'Sarah Johnson',
    role: 'Investor'
  };

  const handleLogout = () => {
    // Placeholder logout logic
    console.log('Logging out...');
  };

  return (
    <Layout
      navbar={
        <Navbar
          title="Investor Portal"
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
        <Route path="/startups" element={<Startups />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/schedule" element={<Schedule />} />
      </Routes>
    </Layout>
  );
}

export default App;
