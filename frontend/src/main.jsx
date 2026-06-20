import { StrictMode } from 'react';
import './styles/no-horizontal-scroll.css';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './i18n/i18n.js';
import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
