import { useState } from 'react';
import { Mail, ArrowRight, UserPlus, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/BrandLogo';

export default function LoginView({ resolvedTheme, ThemeSwitcher }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: username } },
      });
      if (error) {
        setError(error.message);
      } else {
        if (data?.session) {
          // login automatico dopo registrazione
        } else {
          setConfirmationSent(true);
        }
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 relative overflow-y-auto ${
        resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'
      }`}
    >
      <div className="mb-8 z-50">
        <ThemeSwitcher />
      </div>
      <div className="z-10 w-full max-w-md bg-white dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0033A0] via-[#E31837] to-[#FFC72C]"></div>
        {!confirmationSent ? (
          <>
            <BrandLogo className="h-14 sm:h-20 mb-10" />
            <h1 className="text-2xl font-black text-brand-blue dark:text-white uppercase tracking-tighter mb-1 text-center">
              {authMode === 'login' ? 'Area Riservata' : 'Registrazione'}
            </h1>
            <p className="text-center text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold italic">
              {authMode === 'login' ? 'Sincronizzazione Operatore' : 'Crea Profilo 01Informatica'}
            </p>
            {error && (
              <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red/30 rounded-2xl text-brand-red text-sm font-bold text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4 text-brand-dark">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">
                    Referente / Club
                  </label>
                  <input
                    type="text"
                    placeholder="Nome o Club..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold"
                    required
                  />
                </div>
              )}
              <div className="space-y-1 text-brand-dark">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="esempio@01info.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold"
                  required
                />
              </div>
              <div className="space-y-1 text-brand-dark">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-brand-blue hover:bg-blue-800 dark:bg-gradient-to-r dark:from-[#0033A0] dark:via-[#E31837] dark:to-[#FFC72C] text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4 flex justify-center items-center gap-2 border-none"
              >
                {isSubmitting ? (
                  <Activity className="animate-spin" />
                ) : authMode === 'login' ? (
                  'ACCEDI'
                ) : (
                  'REGISTRATI'
                )}
              </button>
            </form>
            <div className="mt-8 text-center border-t border-slate-100 dark:border-white/5 pt-6">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="group flex items-center justify-center gap-3 w-full text-[12px] font-black text-brand-blue dark:text-[#FFC72C] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer p-4 rounded-2xl bg-brand-blue/5 dark:bg-white/5 border border-brand-blue/10 dark:border-[#FFC72C]/20 shadow-md"
              >
                {authMode === 'login' ? (
                  <>
                    <UserPlus size={16} /> Crea Profilo
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} className="rotate-180" /> Torna al Login
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-yellow shadow-inner">
              <Mail size={40} className="animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-brand-blue dark:text-white uppercase mb-4 tracking-tighter">
              Attesa Conferma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed text-balance font-bold">
              Abbiamo inviato un'email a <span className="text-brand-blue dark:text-white">{email}</span>.
              <br />
              Clicca sul link per attivare l'account.
            </p>
            <button
              onClick={() => {
                setConfirmationSent(false);
                setAuthMode('login');
              }}
              className="px-8 py-4 bg-slate-200 dark:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-brand-blue dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer border-none"
            >
              Torna al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
