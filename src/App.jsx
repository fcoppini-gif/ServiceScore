// =============================================================================
// COMPONENTE PRINCIPALE - Entry point dell'applicazione React
// =============================================================================
import { useState, useEffect, useMemo } from 'react';
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
import { I18nProvider } from './lib/i18n';

function AppContent() {
  const { user, userProfile, isAdmin, userClubs, loading, refresh } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const { toast, ToastContainer } = useToast();

  // Redirect new visitors to installazione.html ONLY on first visit AND only from browser (not installed app)
  useEffect(() => {
    if (loading) return;
    const hasVisited = localStorage.getItem('hasVisited');
    const isStandalone = window.matchMedia('display-mode: standalone').matches;
    const fromInstall = new URLSearchParams(window.location.search).get('from') === 'install';
    
    // Se arriva da "Apri nel Browser", salta il redirect
    if (fromInstall) {
      localStorage.setItem('hasVisited', 'true');
      return;
    }
    
    if (!hasVisited && !user && isStandalone) {
      localStorage.setItem('hasVisited', 'true');
    } else if (!hasVisited && !user && !isStandalone) {
      window.location.href = '/installazione.html';
    } else if (user) {
      localStorage.setItem('hasVisited', 'true');
    }
  }, [loading, user]);

  // Gestione tema
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
        body.style.backgroundColor = '#060D1F';
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

  // Mark user as visited after first interaction
  useEffect(() => {
    if (user && !localStorage.getItem('hasVisited')) {
      localStorage.setItem('hasVisited', 'true');
    }
  }, [user]);

  // Memoizzo il ThemeSwitcherWrapper per evitare re-mount
  const ThemeSwitcherWrapper = useMemo(
    () => () => <ThemeSwitcher theme={theme} onThemeChange={setTheme} />,
    [theme]
  );

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#060D1F]">
        <div className="w-16 h-16 border-4 border-[#0033A0] border-t-[#FFC72C] rounded-full animate-spin"></div>
      </div>
    );

  // Props comuni per tutte le view autenticate
  const authProps = {
    isAdmin,
    userClubs,
    userProfile,
    resolvedTheme,
    ThemeSwitcher: ThemeSwitcherWrapper,
    toast,
    refresh,
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginView resolvedTheme={resolvedTheme} ThemeSwitcher={ThemeSwitcherWrapper} />
        } />
        <Route path="/dashboard" element={
          user ? <DashboardView {...authProps} /> : <Navigate to="/login" replace />
        } />
        <Route path="/insert" element={
          user ? <InsertWizardView {...authProps} /> : <Navigate to="/login" replace />
        } />
        <Route path="/success" element={
          user ? <SuccessView resolvedTheme={resolvedTheme} toast={toast} /> : <Navigate to="/login" replace />
        } />
        <Route path="/account" element={
          user ? <AccountView {...authProps} /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/:section?" element={
          user ? (isAdmin ? <AdminView {...authProps} /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </BrowserRouter>
  );
}
