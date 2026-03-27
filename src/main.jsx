// =============================================================================
// ENTRY POINT REACT - Avvia l'applicazione
// =============================================================================
// Questo file è il primo eseguito dal browser.
// Monta il componente <App /> nel div#root di index.html.
// StrictMode attiva controlli aggiuntivi in sviluppo (doppio render, warning).
// =============================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Stili globali + tema brand 01Informatica
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
