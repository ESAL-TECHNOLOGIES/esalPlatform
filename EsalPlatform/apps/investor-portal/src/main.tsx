import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import AuthErrorBoundary from './components/AuthErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthErrorBoundary>
      <App />
    </AuthErrorBoundary>
  </BrowserRouter>
)
