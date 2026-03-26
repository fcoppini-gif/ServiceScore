import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  Trophy, Plus, ChevronLeft, Save, AlertCircle, 
  CheckCircle2, LogOut, User, TrendingUp, ArrowRight, Sparkles,
  Zap, Activity, Target, Rocket, Award, Monitor, ShieldCheck,
  BarChart3, PieChart, ShieldAlert, Cpu
} from 'lucide-react';

// =========================================================================
// 🚀 CONFIGURAZIONE ELITE 01INFORMATICA
// =========================================================================
const LOGO_01INFORMATICA = "/logo_01informatica_retina.png"; 
const SUPABASE_URL = "https://uywtfwjkyiacdfgsbtgo.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_BcNN8eqhJt4rUtCM91Ew1g__myBBLLO";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Componente per numeri che contano (WOW Effect)
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = displayValue;
    const end = parseFloat(value);
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * easeOutExpo;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{displayValue.toFixed(1)}</span>;
};

const BrandLogo = ({ className = "h-16" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    {LOGO_01INFORMATICA ? (
      <img src={LOGO_01INFORMATICA} alt="01Informatica" className="h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:rotate-2 transition-transform duration-700" />
    ) : (
      <span className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] via-[#E31837] to-[#0033A0]">01 INFORMATICA</span>
    )}
  </div>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); 
  const [step, setStep] = useState(1);
  
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    const { data } = await supabase.from('service_inseriti').select(`punteggio_totale, club(nome)`);
    const scores = (data || []).reduce((acc, item) => {
      const name = item.club?.nome || 'Club Anonimo';
      acc[name] = (acc[name] || 0) + item.punteggio_totale;
      return acc;
    }, {});
    setLeaderboard(Object.entries(scores).map(([nome, score]) => ({ nome, score })).sort((a, b) => b.score - a.score));
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

  // Simulazione posizione in classifica
  const estimatedRank = useMemo(() => {
    if (!totalScore) return '-';
    const fakeList = [...leaderboard, { nome: 'In Corso', score: totalScore }].sort((a, b) => b.score - a.score);
    return fakeList.findIndex(x => x.nome === 'In Corso') + 1;
  }, [totalScore, leaderboard]);

  const handleInputChange = (paramId, value, rule) => {
    const numVal = value === '' ? '' : Number(value);
    setFormValues(prev => ({ ...prev, [paramId]: numVal }));
    if (numVal !== '' && (numVal < rule.range_min || numVal > rule.range_max)) {
      setFormErrors(prev => ({ ...prev, [paramId]: `Max: ${rule.range_max}` }));
    } else {
      setFormErrors(prev => { const n = {...prev}; delete n[paramId]; return n; });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Accesso negato: " + error.message);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const { data: header, error: hErr } = await supabase.from('service_inseriti').insert({
        id_utente: session.user.id, id_club: Number(selectedClub), id_tipo_service: Number(selectedService), punteggio_totale: totalScore
      }).select().single();
      if (hErr) throw hErr;
      const details = currentRules.map(rule => ({
        id_service_inserito: header.id, id_parametro: rule.id_parametro,
        valore_dichiarato: Number(formValues[rule.id_parametro] || 0),
        punti_ottenuti: (Number(formValues[rule.id_parametro] || 0) / rule.range_max) * rule.punti_max
      }));
      await supabase.from('dettaglio_inserimenti').insert(details);
      setView('success');
      fetchLeaderboard();
    } catch (e) { alert("Errore nel salvataggio!"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B132B] relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0033A0]/20 to-transparent"></div>
      <div className="relative z-10 space-y-4 text-center">
         <div className="w-24 h-24 border-8 border-white/5 border-t-brand-yellow rounded-full animate-spin mx-auto"></div>
         <p className="text-xs font-black uppercase tracking-[0.5em] text-brand-yellow animate-pulse">Initializing 01 Engine</p>
      </div>
    </div>
  );

  // --- LOGIN ---
  if (view === 'login') return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background animato Matrix-like */}
      <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-12 gap-1 text-[8px] font-mono text-brand-yellow">
        {[...Array(144)].map((_, i) => <div key={i} className="animate-pulse">{Math.random() > 0.5 ? '01' : '10'}</div>)}
      </div>

      <div className="z-10 w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] shadow-2xl relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-blue blur-[80px] opacity-30"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-red blur-[80px] opacity-30"></div>
        
        <BrandLogo className="h-24 mb-10" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 text-center">ServiceScore</h1>
        <p className="text-center text-slate-400 text-[10px] uppercase tracking-[0.4em] mb-12">Security Level: Enterprise</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"
              className="w-full px-6 py-5 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-yellow transition-all font-bold placeholder-slate-600 shadow-inner" required />
          </div>
          <div className="relative group">
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"
              className="w-full px-6 py-5 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-yellow transition-all font-bold placeholder-slate-600 shadow-inner" required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black py-6 rounded-3xl uppercase tracking-widest shadow-2xl hover:shadow-brand-yellow/20 transition-all active:scale-95 flex items-center justify-center gap-4 text-lg">
            INIZIALIZZA SESSIONE <Rocket size={24}/>
          </button>
        </form>
      </div>
    </div>
  );

  // --- DASHBOARD ---
  if (view === 'dashboard') return (
    <div className="min-h-screen bg-[#0B132B] text-white selection:bg-brand-yellow selection:text-black">
      {/* Header Glass */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-50">
        <BrandLogo className="h-10" />
        <div className="flex items-center gap-6">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black text-brand-yellow uppercase tracking-widest mb-1">Operatore</span>
              <span className="text-xs font-bold opacity-60 flex items-center gap-2"><Cpu size={12}/> {session.user.email}</span>
           </div>
           <button onClick={() => supabase.auth.signOut()} className="p-4 bg-brand-red/10 rounded-2xl border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-all shadow-xl">
             <LogOut size={22}/>
           </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12">
        {/* Comando Centrale */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3 p-12 rounded-[4rem] bg-gradient-to-br from-brand-blue/30 via-transparent to-brand-yellow/10 border border-white/10 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 p-12 text-white/5 rotate-12"><Monitor size={200} /></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6 text-brand-yellow animate-pulse">
                    <Activity size={24}/>
                    <span className="text-xs font-black uppercase tracking-[0.4em]">System Operational</span>
                 </div>
                 <h1 className="text-6xl font-black tracking-tighter mb-6 uppercase leading-tight">Analisi Globale<br/>Performance Club</h1>
                 <button onClick={() => {setView('insert'); setStep(1); setFormValues({}); setSelectedService('');}} 
                    className="bg-white text-brand-dark font-black px-12 py-6 rounded-3xl flex items-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-brand-yellow hover:scale-105 transition-all active:scale-95 text-xl tracking-widest uppercase">
                    <Plus className="bg-brand-dark text-white rounded-xl p-1"/> Esegui Valutazione
                 </button>
              </div>
           </div>

           <div className="p-10 rounded-[4rem] bg-white/5 border border-white/10 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow">
                 <Trophy size={40} />
              </div>
              <div>
                 <div className="text-6xl font-black leading-none mb-2 tracking-tighter">{leaderboard.length}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Club Sincronizzati</div>
              </div>
              <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="flex justify-between text-[8px] font-black uppercase mb-2"><span>Efficienza Network</span><span>98%</span></div>
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-yellow w-[98%]"></div>
                 </div>
              </div>
           </div>
        </section>

        {/* Real-time Rankings */}
        <section className="space-y-8 pt-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                <BarChart3 className="text-brand-yellow"/> Real-Time Ranking
             </h2>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">Auto-updating database</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboard.map((item, i) => (
              <div key={i} className="group p-8 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 hover:border-brand-yellow/30 transition-all duration-500 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 font-black italic text-8xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">#{i + 1}</div>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-lg ${
                    i === 0 ? 'bg-brand-yellow text-brand-dark' : 'bg-white/5 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg leading-none">{item.nome}</h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2">Verified Member</p>
                  </div>
                </div>
                <div className="flex items-end justify-between relative z-10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Score</span>
                      <div className="text-4xl font-black tracking-tighter"><AnimatedNumber value={item.score} /></div>
                   </div>
                   <TrendingUp size={24} className={i === 0 ? 'text-brand-yellow' : 'text-slate-700'} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );

  // --- WIZARD BEYOND ULTRA ---
  if (view === 'insert') return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col font-sans">
      {/* Top Nav */}
      <nav className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-3xl flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all shadow-inner border border-white/10 active:scale-90">
          <ChevronLeft size={24}/>
        </button>
        <div className="flex gap-2">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-2 transition-all duration-500 rounded-full ${step === s ? 'w-16 bg-brand-yellow shadow-[0_0_15px_rgba(255,184,28,0.5)]' : 'w-4 bg-white/10'}`}></div>
           ))}
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl">
           <Zap size={14} className="text-brand-yellow animate-pulse"/>
           <span className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">Real-time Processor</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Analizzatore Laterale (Step 2 e 3) */}
        <aside className={`lg:w-[400px] bg-black/40 border-r border-white/5 p-12 flex flex-col items-center justify-center transition-all duration-1000 ${step === 1 ? 'lg:-translate-x-full opacity-0' : 'opacity-100'}`}>
           <div className="text-center space-y-2 mb-12">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-yellow">Analisi Predittiva</span>
              <h4 className="text-xs font-bold opacity-40 uppercase">Classifica Stimata</h4>
           </div>

           {/* Radar / Score Circle */}
           <div className="relative group">
              <div className="absolute inset-0 bg-brand-yellow/10 rounded-full blur-[100px] animate-pulse"></div>
              <div className="relative w-64 h-64 rounded-full border-[16px] border-white/5 flex flex-col items-center justify-center shadow-2xl">
                 <svg className="absolute inset-0 -rotate-90" width="100%" height="100%">
                   <circle cx="50%" cy="50%" r="108" fill="transparent" stroke="url(#g)" strokeWidth="16" strokeDasharray="678" style={{ strokeDashoffset: 678 - (678 * (totalScore / (maxPossibleScore || 1))), transition: 'all 1s' }} strokeLinecap="round" />
                   <defs><linearGradient id="g"><stop offset="0%" stopColor="#0033A0"/><stop offset="50%" stopColor="#E31837"/><stop offset="100%" stopColor="#FFC72C"/></linearGradient></defs>
                 </svg>
                 <span className="text-7xl font-black tracking-tighter"><AnimatedNumber value={totalScore} /></span>
                 <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mt-1">Valutazione</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 w-full mt-16">
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                 <div className="text-3xl font-black text-brand-yellow">#{estimatedRank}</div>
                 <div className="text-[8px] font-black uppercase opacity-50 tracking-widest mt-2">Ranking Est.</div>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                 <div className="text-3xl font-black text-brand-blue">{Math.round((totalScore/maxPossibleScore)*100 || 0)}%</div>
                 <div className="text-[8px] font-black uppercase opacity-50 tracking-widest mt-2">Efficienza</div>
              </div>
           </div>
        </aside>

        {/* Area di Lavoro */}
        <section className="flex-1 p-8 lg:p-20 overflow-y-auto bg-brand-dark/20 relative">
          <div className="max-w-3xl mx-auto space-y-16">
            
            {/* STEP 1: CONFIGURAZIONE PROGETTO */}
            {step === 1 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="space-y-4">
                   <div className="w-16 h-1 w-24 bg-brand-yellow rounded-full mb-8"></div>
                   <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Setup<br/><span className="text-brand-yellow">Intelligence</span></h2>
                   <p className="text-slate-400 font-medium text-lg">Inizializza i parametri del Club e la logica del progetto per avviare il calcolo.</p>
                </div>

                <div className="space-y-8 bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[4rem]"></div>
                  <div className="space-y-3 relative z-10">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-yellow ml-2">Identificativo Club</label>
                    <select value={selectedClub} onChange={e=>setSelectedClub(e.target.value)} 
                      className="w-full p-6 bg-[#0B132B] border border-white/10 rounded-3xl text-xl font-bold outline-none focus:ring-4 focus:ring-brand-yellow/20 appearance-none transition-all shadow-inner">
                      <option value="">Seleziona Club...</option>
                      {clubs.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-brand-red ml-2">Logica Service</label>
                    <select value={selectedService} onChange={e=>setSelectedService(e.target.value)} 
                      className="w-full p-6 bg-[#0B132B] border border-white/10 rounded-3xl text-xl font-bold outline-none focus:ring-4 focus:ring-brand-red/20 appearance-none transition-all shadow-inner">
                      <option value="">Seleziona Categoria...</option>
                      {serviceTypes.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
                </div>
                
                <button onClick={() => setStep(2)} disabled={!selectedClub || !selectedService}
                  className="w-full py-8 bg-white text-[#0B132B] font-black rounded-[2.5rem] uppercase tracking-[0.3em] text-2xl hover:bg-brand-yellow disabled:opacity-10 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group">
                  AVVIA ANALISI <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform"/>
                </button>
              </div>
            )}

            {/* STEP 2: INSERIMENTO DATI */}
            {step === 2 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-3">
                     <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-brand-yellow">Data Entry</h2>
                     <p className="text-slate-400 font-medium">Inserimento dei parametri di valutazione ufficiale.</p>
                  </div>
                  <div className="px-8 py-3 bg-white/5 rounded-2xl border border-white/10 text-brand-yellow text-xs font-black uppercase tracking-widest shadow-xl">
                    {serviceTypes.find(s=>s.id===Number(selectedService))?.nome}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentRules.map(rule => {
                    const p = parameters.find(x => x.id === rule.id_parametro);
                    const val = formValues[rule.id_parametro] || 0;
                    const err = formErrors[rule.id_parametro];
                    const pts = (val / rule.range_max) * rule.punti_max;
                    
                    return (
                      <div key={rule.id} className="p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 hover:border-brand-yellow/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu size={40}/></div>
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{p?.nome}</span>
                           <span className="text-xs font-black text-brand-yellow">MAX {rule.punti_max} PT</span>
                        </div>
                        <div className="relative">
                          <input type="number" placeholder="0" value={formValues[rule.id_parametro] || ''} onChange={e=>handleInputChange(rule.id_parametro, e.target.value, rule)}
                            className={`w-full bg-transparent text-5xl font-black outline-none transition-all ${err ? 'text-brand-red' : 'text-white focus:text-brand-yellow'}`} />
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                           <span className="text-[9px] font-black uppercase opacity-40">Output: <span className="text-white">{pts.toFixed(2)} pts</span></span>
                           <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-yellow transition-all duration-700" style={{ width: `${(pts/rule.punti_max)*100}%` }}></div>
                           </div>
                        </div>
                        {err && <div className="absolute bottom-2 left-10 text-[8px] font-black text-brand-red uppercase animate-bounce">{err}</div>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-6 fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl px-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-sm">BACK</button>
                  <button onClick={() => setStep(3)} disabled={Object.keys(formErrors).length > 0} 
                    className="flex-[2] py-6 bg-brand-yellow text-brand-dark font-black rounded-3xl uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm">VERIFICA DATI</button>
                </div>
              </div>
            )}

            {/* STEP 3: RIEPILOGO & INVIO */}
            {step === 3 && (
              <div className="space-y-16 animate-in fade-in zoom-in duration-700 text-center">
                <div className="space-y-6">
                   <div className="w-28 h-28 bg-brand-yellow/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-yellow shadow-2xl rotate-3">
                      <ShieldCheck size={56} className="animate-pulse" />
                   </div>
                   <h2 className="text-6xl font-black uppercase tracking-tighter leading-tight">Validazione<br/><span className="text-brand-yellow">Finale</span></h2>
                   <p className="text-slate-400 font-medium max-w-md mx-auto text-lg">Revisione dei parametri acquisiti. Confermare per rendere il punteggio ufficiale.</p>
                </div>

                <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 space-y-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-brand-red/5 to-brand-yellow/5 opacity-50"></div>
                   <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                      <div className="text-center md:text-left">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Club Referente</div>
                         <div className="text-3xl font-black uppercase">{clubs.find(c=>c.id===Number(selectedClub))?.nome}</div>
                      </div>
                      <div className="text-center md:text-right">
                         <div className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-2">Punteggio Totale</div>
                         <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-white">{totalScore.toFixed(2)}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 border-t border-white/5 pt-10">
                      {currentRules.map(rule => (
                        <div key={rule.id} className="text-center p-4 bg-black/20 rounded-2xl border border-white/5">
                           <div className="text-[8px] font-black text-slate-500 uppercase mb-2 truncate px-1">{parameters.find(p=>p.id===rule.id_parametro)?.nome}</div>
                           <div className="text-xl font-black text-white">{formValues[rule.id_parametro] || 0}</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col gap-6 max-w-md mx-auto">
                  <button onClick={handleSave} disabled={isSubmitting}
                    className="w-full py-8 bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black rounded-[3rem] uppercase tracking-[0.4em] text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20">
                    {isSubmitting ? <Activity className="animate-spin mx-auto" /> : "REGISTRA ORA"}
                  </button>
                  <button onClick={() => setStep(2)} className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors underline underline-offset-8 decoration-brand-yellow">Modifica Parametri</button>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );

  // --- SUCCESS ---
  if (view === 'success') return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-yellow/10 via-transparent to-transparent animate-pulse"></div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-brand-yellow blur-[60px] opacity-20 animate-pulse"></div>
        <div className="bg-gradient-to-br from-brand-yellow via-brand-red to-brand-blue p-16 rounded-[5rem] animate-bounce shadow-2xl mb-12 relative z-10 border-4 border-white/20 rotate-6">
          <CheckCircle2 size={120} className="text-white drop-shadow-2xl" />
        </div>
      </div>
      
      <h1 className="text-8xl font-black text-white tracking-tighter mb-6 uppercase relative z-10 leading-none italic">MISSION<br/><span className="text-brand-yellow">SECURED</span></h1>
      <p className="text-slate-400 font-black text-xl uppercase tracking-[0.5em] mb-16 relative z-10 opacity-60">Database Synchronized</p>
      
      <button onClick={() => setView('dashboard')} className="px-24 py-8 bg-white text-[#0B132B] font-black rounded-[3rem] uppercase tracking-[0.3em] text-xl hover:bg-brand-yellow transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95 relative z-10 group">
        DASHBOARD <ArrowRight className="inline ml-4 group-hover:translate-x-2 transition-transform" size={24}/>
      </button>
    </div>
  );
}