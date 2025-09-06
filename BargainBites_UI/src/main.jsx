import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@descope/react-sdk';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider projectId='P32Knh2gZbdKFVXDxPEtzj8K1smi'>
      <App />
    </AuthProvider>
  </StrictMode>,
)
