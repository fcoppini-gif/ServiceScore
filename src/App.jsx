import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  Trophy, Plus, ChevronLeft, Save, AlertCircle, 
  CheckCircle2, LogOut, User, TrendingUp, ArrowRight, Sparkles,
  Zap, Activity, Target, Rocket, Award, Monitor, ShieldCheck,
  BarChart3, Cpu, Sun, Moon, Laptop, KeyRound, Mail, UserPlus
} from 'lucide-react';

// =========================================================================
// 🚀 CONFIGURAZIONE ELITE 01INFORMATICA
// =========================================================================
const LOGO_01INFORMATICA = "/logo_01informatica_retina.png"; 
const SUPABASE_URL = "https://uywtfwjkyiacdfgsbtgo.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_BcNN8eqhJt4rUtCM91Ew1g__myBBLLO";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BrandLogo = ({ className = "h-16" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    {LOGO_01INFORMATICA ? (
      <img src={LOGO_01INFORMATICA} alt="01Informatica" className="h-full object-contain drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
    ) : (
      <span className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] via-[#E31837] to-[#0033A0]">01 INFORMATICA</span>
    )}
  </div>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); 
  const [view, setView] = useState('login'); 
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [confirmationSent, setConfirmationSent] = useState(false);

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
        body.style.backgroundColor = "#0B132B";
        body.style.color = "#ffffff";
      } else {
        root.classList.remove('dark');
        body.style.backgroundColor = "#f1f5f9";
        body.style.color = "#0B132B";
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);
    
    const listener = () => { if (theme === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Stati App
  const [clubs, setClubs] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [allRules, setAllRules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stati Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setView('dashboard');
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setView(session ? 'dashboard' : 'login');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchInitialData();
      fetchLeaderboard();
    }
  }, [session]);

  async function fetchInitialData() {
    const { data: userClubs } = await supabase.from('club').select('*');
    const { data: types } = await supabase.from('tipi_service').select('*');
    const { data: params } = await supabase.from('parametri').select('*');
    const { data: rules } = await supabase.from('regole_calcolo').select('*');
    setClubs(userClubs || []);
    setServiceTypes(types || []);
    setParameters(params || []);
    setAllRules(rules || []);
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('service_inseriti')
      .select(`punteggio_totale, id_club, club(nome)`);

    if (error) {
      console.error("Errore fetch classifica:", error);
      return;
    }

    if (data) {
      const scores = data.reduce((acc, item) => {
        const name = item.club?.nome || `Club ID: ${item.id_club}`;
        acc[name] = (acc[name] || 0) + (item.punteggio_totale || 0);
        return acc;
      }, {});
      
      const sorted = Object.entries(scores)
        .map(([nome, score]) => ({ nome, score }))
        .sort((a, b) => b.score - a.score);
      
      setLeaderboard(sorted);
    }
  }

  const currentRules = useMemo(() => allRules.filter(r => r.id_tipo_service === Number(selectedService)), [selectedService, allRules]);
  const maxPossibleScore = useMemo(() => currentRules.reduce((sum, r) => sum + r.punti_max, 0), [currentRules]);
  const totalScore = useMemo(() => {
    let total = 0;
    currentRules.forEach(rule => {
      const val = formValues[rule.id_parametro];
      if (val !== undefined && val !== '' && !formErrors[rule.id_parametro]) {
        total += (Number(val) / rule.range_max) * rule.punti_max;
      }
    });
    return total;
  }, [formValues, currentRules, formErrors]);

  const handleInputChange = (paramId, value, rule) => {
    const numVal = value === '' ? '' : Number(value);
    setFormValues(prev => ({ ...prev, [paramId]: numVal }));
    if (numVal !== '' && (numVal < rule.range_min || numVal > rule.range_max)) {
      setFormErrors(prev => ({ ...prev, [paramId]: `Max: ${rule.range_max}` }));
    } else {
      setFormErrors(prev => { const n = {...prev}; delete n[paramId]; return n; });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Accesso negato: " + error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: username } }
      });
      if (error) {
        alert("Errore registrazione: " + error.message);
      } else {
        if (data?.session) {
          alert("Registrazione completata! Benvenuto.");
        } else {
          setConfirmationSent(true);
        }
      }
    }
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: header, error: hErr } = await supabase.from('service_inseriti').insert({
        id_club: Number(selectedClub), 
        id_tipo_service: Number(selectedService), 
        punteggio_totale: totalScore
      }).select().single();
      
      if (hErr) {
        if (hErr.code === '23505') {
            throw new Error("Dati già esistenti. Questo club ha già registrato questo service.");
        }
        if (hErr.code === '23503') {
            throw new Error("Errore di integrità: il Club o il Service selezionato non sono validi.");
        }
        throw hErr;
      }

      const details = currentRules.map(rule => ({
        id_service_inserito: header.id, 
        id_parametro: rule.id_parametro,
        valore_dichiarato: Number(formValues[rule.id_parametro] || 0),
        punti_ottenuti: (Number(formValues[rule.id_parametro] || 0) / rule.range_max) * rule.punti_max
      }));

      const { error: dErr } = await supabase.from('dettaglio_inserimenti').insert(details);
      if (dErr) throw dErr;

      setView('success');
      fetchLeaderboard();
    } catch (e) { 
        alert("ATTENZIONE:\n" + e.message); 
    }
    finally { setIsSubmitting(false); }
  };

  const ThemeSwitcher = () => (
    <div className="flex bg-white/30 dark:bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
      {[
        { id: 'light', icon: Sun },
        { id: 'system', icon: Laptop },
        { id: 'dark', icon: Moon }
      ].map((item) => (
        <button 
          key={item.id} 
          onClick={() => setTheme(item.id)} 
          className={`p-3 rounded-xl transition-all cursor-pointer ${theme === item.id ? 'bg-brand-blue dark:bg-brand-red text-white shadow-md' : 'text-brand-blue dark:text-slate-500 hover:text-brand-blue dark:hover:text-white'}`}
        >
          <item.icon size={20} />
        </button>
      ))}
    </div>
  );

  const ProgressRing = ({ score, max, size = 180 }) => {
    const percentage = max > 0 ? (score / max) * 100 : 0;
    const stroke = 12;
    const radius = size / 2;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg height={size} width={size} className="transform -rotate-90">
          <circle stroke="currentColor" className="text-slate-200 dark:text-white/5" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke="url(#lionsGrad)" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius}
          />
          <defs>
            <linearGradient id="lionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0033A0" />
              <stop offset="50%" stopColor="#E31837" />
              <stop offset="100%" stopColor="#FFC72C" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
           <span className="text-4xl font-black text-brand-blue dark:text-white tracking-tighter leading-none">{score.toFixed(1)}</span>
           <span className="text-[10px] font-black text-brand-red dark:text-[#FFC72C] uppercase tracking-widest mt-2">Punteggio</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0B132B]">
      <div className="w-16 h-16 border-4 border-[#0033A0] border-t-[#FFC72C] rounded-full animate-spin"></div>
    </div>
  );

  // --- LOGIN ---
  if (view === 'login') return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 relative overflow-y-auto ${resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'}`}>
      <div className="mb-8 z-50">
        <ThemeSwitcher />
      </div>
      <div className="z-10 w-full max-w-md bg-white dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0033A0] via-[#E31837] to-[#FFC72C]"></div>
        {!confirmationSent ? (
          <>
            <BrandLogo className="h-14 sm:h-20 mb-10" />
            <h1 className="text-2xl font-black text-brand-blue dark:text-white uppercase tracking-tighter mb-1 text-center font-black">
                {authMode === 'login' ? 'Area Riservata' : 'Registrazione'}
            </h1>
            <p className="text-center text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold italic">
                {authMode === 'login' ? 'Sincronizzazione Operatore' : 'Crea Profilo 01Informatica'}
            </p>
            <form onSubmit={handleAuth} className="space-y-4 text-brand-dark">
              {authMode === 'signup' && (
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">Referente / Club</label>
                    <input type="text" placeholder="Nome o Club..." value={username} onChange={e=>setUsername(e.target.value)}
                        className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" required />
                </div>
              )}
              <div className="space-y-1 text-brand-dark">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">Email</label>
                <input type="email" placeholder="esempio@01info.it" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"
                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" required />
              </div>
              <div className="space-y-1 text-brand-dark">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-slate-500 ml-2 font-bold">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"
                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" required />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-brand-blue hover:bg-blue-800 dark:bg-gradient-to-r dark:from-[#0033A0] dark:via-[#E31837] dark:to-[#FFC72C] text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4 flex justify-center items-center gap-2 border-none font-bold">
                {isSubmitting ? <Activity className="animate-spin" /> : (authMode === 'login' ? 'ACCEDI' : 'REGISTRATI')}
              </button>
            </form>
            <div className="mt-8 text-center border-t border-slate-100 dark:border-white/5 pt-6">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="group flex items-center justify-center gap-3 w-full text-[12px] font-black text-brand-blue dark:text-[#FFC72C] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer p-4 rounded-2xl bg-brand-blue/5 dark:bg-white/5 border border-brand-blue/10 dark:border-[#FFC72C]/20 shadow-md font-bold">
                    {authMode === 'login' ? <><UserPlus size={16}/> Crea Profilo</> : <><ArrowRight size={16} className="rotate-180"/> Torna al Login</>}
                </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-yellow shadow-inner"><Mail size={40} className="animate-bounce" /></div>
            <h2 className="text-2xl font-black text-brand-blue dark:text-white uppercase mb-4 tracking-tighter">Attesa Conferma</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed text-balance font-bold">Abbiamo inviato un'email a <span className="text-brand-blue dark:text-white">{email}</span>.<br/>Clicca sul link per attivare l'account.</p>
            <button onClick={() => { setConfirmationSent(false); setAuthMode('login'); }} className="px-8 py-4 bg-slate-200 dark:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-brand-blue dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer border-none font-bold">Torna al Login</button>
          </div>
        )}
      </div>
    </div>
  );

  // --- DASHBOARD ---
  if (view === 'dashboard') return (
    <div className={`min-h-screen transition-colors duration-500 ${resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'}`}>
      <nav className="px-6 py-4 sm:py-5 flex justify-between items-center border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <BrandLogo className="h-8 sm:h-10" />
        <div className="flex items-center gap-4"><ThemeSwitcher /><button onClick={() => supabase.auth.signOut()} className="p-3 bg-red-50 dark:bg-white/5 rounded-2xl text-brand-red hover:bg-brand-red hover:text-white transition-all shadow-sm cursor-pointer border-none font-bold"><LogOut size={20}/></button></div>
      </nav>
      <div className="max-w-5xl mx-auto p-4 sm:p-12 space-y-10 pb-24 text-brand-dark dark:text-white">
        <div className="p-10 rounded-[3.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl group">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all duration-700"></div>
           <div className="relative z-10 text-center sm:text-left">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red dark:text-brand-yellow mb-3 font-bold">Lions District Network</h2>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-10 uppercase">Classifica Club</h1>
              <button onClick={() => {setView('insert'); setStep(1); setFormValues({}); setSelectedService('');}} className="w-full sm:w-auto cursor-pointer bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black px-10 py-5 rounded-3xl flex items-center justify-center gap-4 shadow-2xl hover:scale-105 transition-all text-lg border-none font-bold font-black"><Plus size={24} className="bg-white dark:bg-brand-dark text-brand-blue dark:text-white rounded-xl p-1"/> NUOVA ANALISI</button>
           </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 ml-4"><Trophy className="text-brand-yellow drop-shadow-sm" /> Ranking Live</h3>
          <div className="grid grid-cols-1 gap-4 font-bold">
            {leaderboard.length === 0 ? (
                <div className="text-center p-16 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-slate-400 font-bold uppercase tracking-widest text-xs italic">Nessun dato visibile. Controlla i permessi SELECT di Supabase.</div>
            ) : leaderboard.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-brand-blue/40 transition-all shadow-sm group">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] font-black text-xl shadow-inner transition-transform group-hover:scale-110 ${i === 0 ? 'bg-gradient-to-br from-brand-yellow to-amber-500 text-brand-dark' : i === 1 ? 'bg-slate-300 text-slate-700' : 'bg-slate-50 dark:bg-white/5 text-brand-blue/60 dark:text-white border dark:border-white/10 font-bold'}`}>#{i + 1}</div>
                  <span className="text-lg font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">{item.nome}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-brand-blue dark:text-white leading-none">{item.score.toFixed(1)}</div>
                  <div className="text-[9px] font-black uppercase text-brand-red dark:text-brand-yellow tracking-widest mt-1">Punti Totali</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- INSERTION WIZARD ---
  if (view === 'insert') return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden ${resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'}`}>
      <nav className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button onClick={() => setView('dashboard')} className="p-4 bg-slate-200/50 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-slate-300 shadow-inner active:scale-90 cursor-pointer border-none font-bold"><ChevronLeft size={24}/></button>
        <div className="flex gap-2 sm:gap-3">{[1, 2, 3].map(s => (<div key={s} className={`h-2.5 rounded-full transition-all duration-500 ${step >= s ? (step === s ? 'w-10 sm:w-12 bg-brand-blue dark:bg-brand-yellow shadow-sm' : 'w-4 bg-brand-red') : 'w-4 bg-slate-300 dark:bg-white/10'}`}></div>))}</div>
        <div className="w-10 sm:w-12"></div>
      </nav>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className={`lg:w-[400px] bg-white dark:bg-black/30 border-r border-slate-200 dark:border-white/5 p-12 flex flex-col items-center justify-center transition-all duration-1000 ${step === 1 ? 'lg:-translate-x-full opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
           <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[3rem] shadow-xl border border-slate-200 dark:border-white/10"><ProgressRing score={totalScore} max={maxPossibleScore} /></div>
           <div className="mt-12 w-full space-y-6 max-w-sm px-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow text-center mb-8 bg-brand-blue/5 dark:bg-white/5 py-2 rounded-full font-bold shadow-sm">Analisi Parametrica</h4>
              {currentRules.map(rule => {
                const val = formValues[rule.id_parametro] || 0;
                const perc = (val / rule.range_max) * 100;
                return (
                  <div key={rule.id} className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black uppercase opacity-60 px-1 text-brand-blue dark:text-slate-400 font-bold"><span className="truncate max-w-[150px] font-bold">{parameters.find(p=>p.id===rule.id_parametro)?.nome}</span><span>{Math.round(perc)}%</span></div>
                     <div className="h-1.5 bg-slate-300 dark:bg-white/5 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-brand-blue to-brand-red transition-all duration-700" style={{ width: `${perc}%` }}></div></div>
                  </div>
                );
              })}
           </div>
        </aside>
        <section className="flex-1 p-6 sm:p-16 overflow-y-auto bg-white/20 dark:bg-transparent text-brand-dark dark:text-white">
          <div className="max-w-3xl mx-auto pb-32 lg:pb-0 font-bold">
            {step === 1 && (
              <div className="space-y-10 sm:y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4 text-center sm:text-left"><h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-tight">Configura<br/><span className="text-brand-red dark:text-brand-yellow font-black">Analisi</span></h2><p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg font-bold italic">Seleziona i dati per la nuova valutazione ufficiale.</p></div>
                <div className="space-y-8 bg-white dark:bg-white/5 p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl">
                  <div className="space-y-3"><label className="text-xs font-black uppercase tracking-widest text-brand-blue/60 dark:text-brand-yellow ml-2 font-bold">Lions Club Referente</label><div className="relative text-brand-dark dark:text-white"><select value={selectedClub} onChange={e=>setSelectedClub(e.target.value)} className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-[2.5rem] text-lg font-bold outline-none focus:ring-4 focus:ring-brand-yellow/20 appearance-none shadow-inner"><option value="">Seleziona Club...</option>{clubs.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white font-bold"><ArrowRight size={20} className="rotate-90"/></div></div></div>
                  <div className="space-y-3"><label className="text-xs font-black uppercase tracking-widest text-brand-red ml-2 font-bold">Categoria Progetto</label><div className="relative text-brand-dark dark:text-white"><select value={selectedService} onChange={e=>setSelectedService(e.target.value)} className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-[2.5rem] text-lg font-bold outline-none focus:ring-4 focus:ring-brand-red/20 appearance-none shadow-inner"><option value="">Seleziona Service...</option>{serviceTypes.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}</select><div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white font-bold"><ArrowRight size={20} className="rotate-90"/></div></div></div>
                </div>
                <button onClick={() => setStep(2)} disabled={!selectedClub || !selectedService || isSubmitting} className="w-full cursor-pointer py-7 bg-brand-blue text-white font-black rounded-[2.5rem] uppercase tracking-widest text-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3 border-none font-bold font-black">CONTINUA <ArrowRight size={24}/></button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-center sm:text-left"><div className="space-y-2"><h2 className="text-4xl font-black uppercase tracking-tighter text-brand-red dark:text-brand-yellow leading-none text-balance font-bold font-black text-bold">Dati Operativi</h2><p className="text-slate-600 dark:text-slate-400 font-medium italic text-base font-bold font-bold">Sincronizzazione parametri.</p></div><div className="px-6 py-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-brand-blue dark:text-brand-yellow text-[10px] font-black uppercase tracking-widest shadow-sm border-slate-200">{serviceTypes.find(s=>s.id===Number(selectedService))?.nome}</div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1 text-brand-dark dark:text-white font-bold">
                  {currentRules.map(rule => {
                    const p = parameters.find(x => x.id === rule.id_parametro);
                    const err = formErrors[rule.id_parametro];
                    return (
                      <div key={rule.id} className="p-8 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 hover:border-brand-blue/30 transition-all shadow-md group">
                        <div className="flex justify-between items-start mb-6"><div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 font-bold font-bold">{p?.nome}</span><span className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase font-bold font-bold">Limite: {rule.range_max}</span></div><Activity size={18} className="text-brand-blue/20 dark:text-white/10 group-hover:text-brand-yellow transition-colors" /></div>
                        <input type="number" placeholder="0" value={formValues[rule.id_parametro] || ''} onChange={e=>handleInputChange(rule.id_parametro, e.target.value, rule)}
                          className={`w-full bg-transparent text-5xl font-black outline-none border-b-4 transition-all pb-2 cursor-text text-brand-blue dark:text-white font-bold font-bold ${err ? 'border-brand-red text-brand-red' : 'border-slate-100 dark:border-white/10 focus:border-brand-blue'}`} />
                        {err && <div className="text-[9px] font-black text-brand-red uppercase mt-3 flex items-center gap-1 font-bold font-bold"><AlertCircle size={12}/> {err}</div>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50 font-bold font-bold"><button onClick={() => setStep(1)} className="flex-1 cursor-pointer py-5 bg-white dark:bg-brand-dark border border-slate-300 dark:border-white/20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-90 transition-transform text-brand-blue dark:text-white border-none font-bold">INDIETRO</button><button onClick={() => setStep(3)} disabled={Object.keys(formErrors).length > 0 || isSubmitting} className="flex-[2] cursor-pointer bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all font-bold border-none disabled:opacity-50">CONFERMA</button></div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-12 animate-in fade-in zoom-in duration-500 text-center">
                <div className="space-y-4"><div className="w-24 h-24 bg-brand-yellow/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-blue dark:text-brand-yellow shadow-inner animate-pulse"><ShieldCheck size={52} /></div><h2 className="text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-none">Riepilogo Dati</h2><p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-base font-bold font-bold italic">Verifica i parametri acquisiti.</p></div>
                <div className="bg-white dark:bg-white/5 p-14 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-2xl space-y-10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 text-brand-blue/5 dark:text-white/5 -rotate-12"><Cpu size={120}/></div>
                   <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-100 dark:border-white/5 relative z-10 text-balance font-bold text-brand-dark dark:text-white">
                      <div className="text-center sm:text-left"><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-bold">Club</div><div className="text-2xl font-black uppercase tracking-tight leading-none font-bold">{clubs.find(c=>c.id===Number(selectedClub))?.nome}</div></div>
                      <div className="text-center sm:text-right"><div className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase tracking-widest mb-2 font-bold">Valutazione</div><div className="text-6xl font-black text-brand-blue dark:text-white tracking-tighter leading-none font-bold">{totalScore.toFixed(2)}</div></div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 px-2 font-bold text-brand-dark dark:text-white">
                      {currentRules.map(rule => (<div key={rule.id} className="text-center p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner transition-colors font-bold"><div className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase mb-2 truncate px-1 font-bold">{parameters.find(p=>p.id===rule.id_parametro)?.nome}</div><div className="text-xl font-black font-bold">{formValues[rule.id_parametro] || 0}</div></div>))}
                   </div>
                </div>
                <div className="flex flex-col gap-6 max-w-sm mx-auto pb-10 px-4 font-bold"><button onClick={handleSave} disabled={isSubmitting} className="w-full cursor-pointer py-8 bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold border-none disabled:opacity-50 font-black">REGISTRA</button><button onClick={() => setStep(2)} className="text-slate-500 dark:text-slate-400 font-black uppercase text-xs hover:text-brand-blue dark:hover:text-brand-yellow transition-colors cursor-pointer active:scale-90 p-2 font-bold underline underline-offset-8">Modifica Parametri</button></div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  // --- SUCCESS ---
  if (view === 'success') return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-all duration-500 relative overflow-hidden ${resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'}`}>
      <div className="absolute inset-0 bg-radial-gradient from-brand-yellow/10 to-transparent opacity-30 animate-pulse font-bold"></div>
      <div className="bg-gradient-to-br from-[#0033A0] via-[#E31837] to-[#FFC72C] p-16 rounded-[5rem] animate-bounce shadow-2xl mb-12 relative z-10 border-4 border-white/20"><CheckCircle2 size={120} className="text-white drop-shadow-2xl" /></div>
      <h1 className="text-7xl font-black text-brand-blue dark:text-white tracking-tighter mb-6 uppercase leading-none relative z-10 italic font-black">MISSIONE<br/><span className="text-brand-yellow">COMPLETATA</span></h1>
      <p className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.5em] mb-16 relative z-10 text-sm font-bold italic font-bold">DATABASE AGGIORNATO</p>
      <button onClick={() => setView('dashboard')} className="px-24 py-8 bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black rounded-[3rem] uppercase tracking-widest text-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer relative z-10 font-bold border-none font-bold">DASHBOARD</button>
    </div>
  );
}