// =============================================================================
// COMPONENTE PRINCIPALE - Entry point dell'applicazione React
// =============================================================================
// Questo file fa 3 cose:
// 1. Avvolge tutto in BrowserRouter per abilitare il routing (URL diversi)
// 2. Gestisce lo stato di autenticazione (session Supabase)
// 3. Gestisce il tema chiaro/scuro/sistema
// 4. Definisce tutte le route: /login, /dashboard, /insert, /success
//
// COLLEGAMENTI:
// - Importa supabase.js per verificare se l'utente è loggato
// - Importa tutte le view da src/views/
// - Passa il tema e il ThemeSwitcher come props alle view
// =============================================================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import useToast from './hooks/useToast';
import ThemeSwitcher from './components/ThemeSwitcher';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import InsertWizardView from './views/InsertWizardView';
import SuccessView from './views/SuccessView';

// =============================================================================
// AppContent: componente interno che contiene tutta la logica
// Separato da App() perché BrowserRouter DEVE essere il genitore di useNavigate
// =============================================================================
function AppContent() {
  // session = null se non loggato, oggetto session se loggato
  const [session, setSession] = useState(null);
  // loading = true durante il check iniziale dell'autenticazione (mostra spinner)
  const [loading, setLoading] = useState(true);
  // theme = preferenza utente: 'light' | 'dark' | 'system' (persistita in localStorage)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  // resolvedTheme = tema effettivo dopo aver risolto 'system' (light o dark)
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  // Hook per mostrare notifiche toast (sostituisce gli alert())
  const { toast, ToastContainer } = useToast();

  // ===========================================================================
  // useEffect: GESTIONE TEMA
  // Si attiva ogni volta che 'theme' cambia.
  // Applica la classe 'dark' al <html> e i colori sfondo/body corretti.
  // Ascolta anche i cambiamenti di tema del sistema operativo (prefers-color-scheme).
  // ===========================================================================
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let current = theme;
      // Se l'utente ha scelto 'system', eredita dal OS
      if (theme === 'system') {
        current = mediaQuery.matches ? 'dark' : 'light';
      }
      setResolvedTheme(current);

      if (current === 'dark') {
        root.classList.add('dark');
        body.style.backgroundColor = '#0B132B';
        body.style.color = '#ffffff';
      } else {
        root.classList.remove('dark');
        body.style.backgroundColor = '#f1f5f9';
        body.style.color = '#0B132B';
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listener per aggiornamenti live quando il sistema cambia tema
    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // ===========================================================================
  // useEffect: AUTENTICAZIONE
  // Al primo caricamento, verifica se esiste una sessione Supabase attiva.
  // Registra anche un listener per cambiamenti futuri (login/logout automatici).
  // ===========================================================================
  useEffect(() => {
    // Controlla se c'è una sessione salvata nel browser
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    // Listener per eventi auth (login, logout, refresh token, ecc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Cleanup: disiscrive il listener quando il componente si smonta
    return () => subscription.unsubscribe();
  }, []);

  // Wrapper per passare lo stato del tema al componente ThemeSwitcher
  const ThemeSwitcherWrapper = () => (
    <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
  );

  // ===========================================================================
  // RENDER: mostra uno spinner mentre controlla l'autenticazione
  // ===========================================================================
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0B132B]">
        <div className="w-16 h-16 border-4 border-[#0033A0] border-t-[#FFC72C] rounded-full animate-spin"></div>
      </div>
    );

  // ===========================================================================
  // RENDER: Routing dell'applicazione
  // - /login: accessibile solo se NON loggato (altrimenti reindirizza a dashboard)
  // - /dashboard, /insert, /success: accessibili solo se loggato (altrimenti reindirizza a login)
  // - * (qualsiasi altro URL): reindirizza in base allo stato di login
  // ===========================================================================
  return (
    <>
      {/* Contenitore per i toast (notifiche) - sempre visibile */}
      <ToastContainer />
      <Routes>
        {/* Rotta LOGIN - pagine di accesso/registrazione */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginView
                resolvedTheme={resolvedTheme}
                ThemeSwitcher={ThemeSwitcherWrapper}
              />
            )
          }
        />
        {/* Rotta DASHBOARD - classifica club e pulsante nuova analisi */}
        <Route
          path="/dashboard"
          element={
            session ? (
              <DashboardView
                resolvedTheme={resolvedTheme}
                ThemeSwitcher={ThemeSwitcherWrapper}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Rotta INSERT - wizard a 3 step per inserire una nuova valutazione */}
        <Route
          path="/insert"
          element={
            session ? (
              <InsertWizardView
                resolvedTheme={resolvedTheme}
                toast={toast}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Rotta SUCCESS - conferma dopo salvataggio riuscito */}
        <Route
          path="/success"
          element={
            session ? (
              <SuccessView resolvedTheme={resolvedTheme} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Catch-all: qualsiasi URL non definito sopra */}
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

// =============================================================================
// App: componente esportato (wrappa AppContent in BrowserRouter)
// BrowserRouter DEVE essere il genitore più esterno per far funzionare useNavigate
// =============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
