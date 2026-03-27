import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import useToast from './hooks/useToast';
import ThemeSwitcher from './components/ThemeSwitcher';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import InsertWizardView from './views/InsertWizardView';
import SuccessView from './views/SuccessView';

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const { toast, ToastContainer } = useToast();

  // Gestione Tema
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let current = theme;
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

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const ThemeSwitcherWrapper = () => (
    <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
  );

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0B132B]">
        <div className="w-16 h-16 border-4 border-[#0033A0] border-t-[#FFC72C] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <>
      <ToastContainer />
      <Routes>
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
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
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
