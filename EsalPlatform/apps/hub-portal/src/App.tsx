import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@esal/ui'
import Dashboard from './pages/Dashboard'
import Startups from './pages/Startups'
import Events from './pages/Events'
import Members from './pages/Members'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Startups', href: '/startups', icon: '🚀' },
  { name: 'Events', href: '/events', icon: '📅' },
  { name: 'Members', href: '/members', icon: '👥' },
]

function App() {
  return (
    <Router>
      <Layout 
        title="Hub Portal"
        navigation={navigation}
        userMenu={[
          { name: 'Profile', href: '/profile' },
          { name: 'Settings', href: '/settings' },
          { name: 'Sign out', href: '/logout' },
        ]}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/members" element={<Members />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
