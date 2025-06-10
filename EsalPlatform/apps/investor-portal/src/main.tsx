import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import AuthErrorBoundary from './components/AuthErrorBoundary'
import './index.css'

// Defensive check for React hooks availability
if (typeof React.useState === 'undefined') {
  console.error('React hooks are not available');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthErrorBoundary>
      <App />
    </AuthErrorBoundary>
  </BrowserRouter>
)
