
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/tarot.css';
import './styles/animations.css';
import './styles/buttons.css';
import './styles/cards.css';
import './styles/themes/crypto.css';

// Log the current commit SHA (if available) for debugging
if (import.meta.env.VITE_COMMIT_SHA) {
  console.log(`App version: ${import.meta.env.VITE_COMMIT_SHA.substring(0, 8)}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
