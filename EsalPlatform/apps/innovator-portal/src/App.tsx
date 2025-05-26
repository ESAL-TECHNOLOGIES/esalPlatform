import { Routes, Route } from 'react-router-dom'
import { RequireRole } from '@esal/auth'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PitchDeck from './pages/PitchDeck'
import Matches from './pages/Matches'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <RequireRole role="innovator">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pitch-deck" element={<PitchDeck />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </RequireRole>
  )
}

export default App