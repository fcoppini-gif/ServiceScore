// =============================================================================
// CONFIGURAZIONE COSTANTI DELL'APPLICAZIONE
// =============================================================================
// Centralizza tutti i valori hardcoded usati nel progetto.
// Modificare qui per cambiare logo o URL in tutto il sito.
// =============================================================================

// Percorso del logo 01Informatica (file nella cartella /public)
export const LOGO_01INFORMATICA = "/logo_01informatica_retina.png";

// URL pubblico dell'app (usato per link esterni e QR code)
// In locale: fallback su servicescore.vercel.app
// Su Vercel: viene letto da VITE_APP_URL nel .env
export const APP_URL = import.meta.env.VITE_APP_URL || "https://servicescore.vercel.app";
