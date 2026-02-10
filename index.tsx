import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("System initializing...");

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("System mounted successfully.");
  } catch (error) {
    console.error("Mounting error:", error);
  }
} else {
  console.error("Fatal: Root element not found in index.html");
}