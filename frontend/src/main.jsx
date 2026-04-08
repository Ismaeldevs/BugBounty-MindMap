import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.98) 0%, rgba(45, 45, 45, 0.98) 100%)',
            color: '#ffffff',
            border: '1px solid rgba(204, 0, 0, 0.3)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(204, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'Fira Code, monospace',
            fontSize: '13px',
            padding: '12px 16px',
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          },
          success: {
            duration: 3000,
            style: {
              border: '1px solid rgba(0, 255, 65, 0.4)',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 255, 65, 0.2)',
            },
            iconTheme: {
              primary: '#00ff41',
              secondary: 'rgba(26, 15, 15, 0.98)',
            },
          },
          error: {
            duration: 4000,
            style: {
              border: '1px solid rgba(204, 0, 0, 0.5)',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(204, 0, 0, 0.3)',
            },
            iconTheme: {
              primary: '#ff4444',
              secondary: 'rgba(26, 15, 15, 0.98)',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
