import { Routes, Route } from 'react-router-dom'
import { Button } from '@esal/ui'
import { Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/innovator" element={<Navigate to="/innovator-portal" replace />} />
        <Route path="/investor" element={<Navigate to="/investor-portal" replace />} />
        <Route path="/hub" element={<Navigate to="/hub-portal" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
