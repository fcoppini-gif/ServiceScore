// =============================================================================
// COMPONENTE PRINCIPALE - Entry point dell'applicazione React
// =============================================================================
// Questo file:
// 1. Avvolge tutto in BrowserRouter per il routing
// 2. Usa useAuth per gestire autenticazione + ruolo + club associati
// 3. Gestisce il tema chiaro/scuro/sistema
// 4. Definisce le route: /login, /dashboard, /insert, /success, /account, /admin/:section
//
// COLLEGAMENTI:
// - useAuth (src/hooks/useAuth.jsx) → legge profilo utente e club
// - useToast (src/hooks/useToast.jsx) → notifiche toast
// - Tutte le view in src/views/
// =============================================================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useToast from './hooks/useToast';
import ThemeSwitcher from './components/ThemeSwitcher';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import InsertWizardView from './views/InsertWizardView';
import SuccessView from './views/SuccessView';
import AccountView from './views/AccountView';
import AdminView from './views/AdminView';

function AppContent() {
  const { user, userProfile, isAdmin, userClubs, loading } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const { toast, ToastContainer } = useToast();

  // =========================================================================
  // GESTIONE TEMA
  // =========================================================================
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let current = theme;
      if (theme === 'system') current = mediaQuery.matches ? 'dark' : 'light';
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
    const listener = () => { if (theme === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const ThemeSwitcherWrapper = () => (
    <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
  );

  // Spinner durante caricamento auth
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0B132B]">
        <div className="w-16 h-16 border-4 border-[#0033A0] border-t-[#FFC72C] rounded-full animate-spin"></div>
      </div>
    );

  // Helper: props comuni per tutte le view autenticate
  const authProps = {
    isAdmin,
    userClubs,
    userProfile,
    resolvedTheme,
    ThemeSwitcher: ThemeSwitcherWrapper,
    toast,
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* LOGIN - accessibile solo se NON loggato */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginView resolvedTheme={resolvedTheme} ThemeSwitcher={ThemeSwitcherWrapper} />
          }
        />

        {/* DASHBOARD - classifica (filtrata per referente, completa per admin) */}
        <Route
          path="/dashboard"
          element={
            user ? <DashboardView {...authProps} /> : <Navigate to="/login" replace />
          }
        />

        {/* INSERT - wizard inserimento (solo club associati se referente) */}
        <Route
          path="/insert"
          element={
            user ? <InsertWizardView {...authProps} /> : <Navigate to="/login" replace />
          }
        />

        {/* SUCCESS - conferma salvataggio */}
        <Route
          path="/success"
          element={
            user ? <SuccessView resolvedTheme={resolvedTheme} /> : <Navigate to="/login" replace />
          }
        />

        {/* ACCOUNT - cambio password + avatar (tutti gli utenti) */}
        <Route
          path="/account"
          element={
            user ? <AccountView {...authProps} /> : <Navigate to="/login" replace />
          }
        />

        {/* ADMIN - pannello amministrazione (solo admin) */}
        <Route
          path="/admin/:section?"
          element={
            user ? (
              isAdmin ? <AdminView {...authProps} /> : <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
