// =============================================================================
// CLIENT SUPABASE - Connessione al backend cloud
// =============================================================================
// Questo file crea e configura il client Supabase usato da TUTTI i componenti
// per comunicare con il database e il sistema di autenticazione.
//
// Le chiavi vengono dal file .env (variabili d'ambiente) per non esporle nel codice.
// In locale: il file .env nella root del progetto
// Su Vercel: Settings > Environment Variables nella dashboard
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// URL dell'istanza Supabase (collega al database specifico del progetto)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Chiave pubblica "anon" - progettata per stare nel browser, la sicurezza vera
// è nelle Row Level Security (RLS) configurate su Supabase
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Istanza singleton: tutti i file importano lo stesso client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
