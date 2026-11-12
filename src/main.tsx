// Import React StrictMode for detecting potential problems and enforcing best practices during development
import { StrictMode } from 'react';
// Import createRoot from react-dom/client to enable Concurrent React 19 rendering
import { createRoot } from 'react-dom/client';
// Import the root application coordinator component
import App from './App.tsx';
// Import global application styles, design tokens, and utility CSS
import './index.css';

// Locate the single DOM entry mount container element (#root) in index.html
const rootElement = document.getElementById('root');

// Ensure rootElement is present before mounting to guarantee a safe DOM initialization
if (rootElement) {
  // Create the React root instance attached to the DOM element
  createRoot(rootElement).render(
    // StrictMode performs double-render checks and flags legacy or unsafe lifecycles
    <StrictMode>
      {/* Mount the primary CivicBridge application */}
      <App />
    </StrictMode>
  );
}
