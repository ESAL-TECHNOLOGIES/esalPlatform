import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@esal/ui'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Content from './pages/Content'
import Settings from './pages/Settings'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Content', href: '/content', icon: '📝' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

function App() {
  return (
    <Router>
      <Layout 
        title="Admin Portal"
        navigation={navigation}
        userMenu={[
          { name: 'Admin Profile', href: '/profile' },
          { name: 'System Settings', href: '/system' },
          { name: 'Sign out', href: '/logout' },
        ]}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/content" element={<Content />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
