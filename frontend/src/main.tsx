import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, you might want to log this to an error reporting service
  // Example: logErrorToService(event.error, { type: 'global' });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, you might want to log this to an error reporting service
  // Example: logErrorToService(event.reason, { type: 'unhandled-promise' });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
