import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  Trophy, Plus, ChevronLeft, Save, AlertCircle, 
  CheckCircle2, LogOut, Calculator, User, 
  TrendingUp, ArrowRight 
} from 'lucide-react';

// --- CONFIGURAZIONE SUPABASE ---
// Incolla l'URL e la Anon Key che trovi su Supabase (Settings -> API)
const SUPABASE_URL = "https://uywtfwjkyiacdfgsbtgo.supabase.co"; 
const SUPABASE_ANON_KEY = "uywtfwjkyiacdfgsbtgo";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); 
  
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

  // 1. Ascolto dello stato dell'autenticazione
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

  // 2. Caricamento dati dal database Supabase
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

  // 3. Calcolo dinamico del punteggio in base al service selezionato
  const currentRules = useMemo(() => allRules.filter(r => r.id_tipo_service === Number(selectedService)), [selectedService, allRules]);

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

  if (loading) return <div className="h-screen flex items-center justify-center bg-lions-blue text-white font-black animate-pulse uppercase tracking-widest text-xl">ServiceScore...</div>;

  // --- SCHERMATA LOGIN ---
  if (view === 'login') return (
    <div className="min-h-screen bg-lions-blue flex flex-col items-center justify-center p-6 text-white relative">
      <div className="z-10 text-center mb-10">
        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md inline-block mb-4 shadow-xl">
          <Calculator size={64} className="text-lions-gold" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase">ServiceScore</h1>
        <p className="opacity-80 font-medium">Lions Club District Tracker</p>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-4 text-slate-800">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
          <input type="email" placeholder="email@esempio.it" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-lions-blue transition-all" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-lions-blue transition-all" required />
        </div>
        <button type="submit" className="w-full bg-lions-blue text-white font-black py-5 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest mt-2">Accedi</button>
      </form>
    </div>
  );

  // --- DASHBOARD ---
  if (view === 'dashboard') return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="bg-lions-blue text-white p-6 rounded-b-[3rem] shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight italic">Dashboard</h1>
          <p className="text-[10px] font-bold opacity-80">{session.user.email}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="bg-white/20 p-3 rounded-2xl shadow-inner active:scale-90 transition-transform"><LogOut size={20}/></button>
      </div>
      <div className="px-5 -mt-8">
        <button onClick={() => {setView('insert'); setFormValues({}); setFormErrors({});}} className="w-full bg-white text-lions-blue font-black p-6 rounded-3xl shadow-xl border border-blue-50 flex items-center justify-center gap-3 active:scale-95 transition-all">
          <div className="bg-lions-blue text-white rounded-lg p-1 shadow-md"><Plus size={24}/></div> 
          <span>NUOVA VALUTAZIONE</span>
        </button>
      </div>
      <div className="mt-10 px-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6 uppercase italic"><Trophy className="text-lions-gold" /> Classifica Club</h2>
        <div className="space-y-4">
          {leaderboard.map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm flex items-center justify-between border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black ${i === 0 ? 'bg-lions-gold text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                <span className="font-bold text-slate-700">{item.nome}</span>
              </div>
              <span className="text-xl font-black text-lions-blue">{item.score.toFixed(1)} <span className="text-[10px] text-slate-300">PT</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- FORM INSERIMENTO ---
  if (view === 'insert') return (
    <div className="min-h-screen bg-slate-50 pb-40 font-sans">
      <div className="bg-white p-6 border-b flex items-center sticky top-0 z-50 shadow-sm">
        <button onClick={() => setView('dashboard')} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-lions-blue transition-colors"><ChevronLeft size={24}/></button>
        <h2 className="flex-1 text-center font-black text-slate-800 text-lg pr-10 uppercase italic tracking-tight">Inserimento</h2>
      </div>
      <div className="p-5 space-y-6 max-w-xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-[2rem] space-y-4 shadow-inner border border-blue-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-lions-blue/60 uppercase ml-2 tracking-widest">Seleziona Club</label>
            <select value={selectedClub} onChange={e=>setSelectedClub(e.target.value)} className="w-full p-4 bg-white rounded-2xl shadow-sm text-slate-700 font-bold focus:ring-2 focus:ring-lions-blue outline-none appearance-none">
              <option value="">Scegli un club...</option>
              {clubs.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-lions-blue/60 uppercase ml-2 tracking-widest">Tipo Service</label>
            <select value={selectedService} onChange={e=>setSelectedService(e.target.value)} className="w-full p-4 bg-white rounded-2xl shadow-sm text-slate-700 font-bold focus:ring-2 focus:ring-lions-blue outline-none appearance-none">
              <option value="">Scegli un progetto...</option>
              {serviceTypes.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>
        {selectedService && (
          <div className="space-y-4 mt-6 animate-in slide-in-from-bottom-5 duration-500">
            <h3 className="text-xs font-black text-slate-400 uppercase ml-2 tracking-widest">Dettaglio Valutazioni</h3>
            {currentRules.map(rule => {
              const p = parameters.find(x => x.id === rule.id_parametro);
              const err = formErrors[rule.id_parametro];
              return (
                <div key={rule.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group transition-all hover:border-lions-blue/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-slate-700 text-sm">{p?.nome}</span>
                    <span className="text-[10px] font-black bg-lions-gold/10 text-lions-gold px-3 py-1 rounded-full uppercase">MAX {rule.punti_max} PT</span>
                  </div>
                  <input type="number" placeholder={`Range ${rule.range_min} - ${rule.range_max}`} value={formValues[rule.id_parametro] || ''} onChange={e=>handleInputChange(rule.id_parametro, e.target.value, rule)}
                    className={`w-full p-4 bg-slate-50 border-2 rounded-2xl text-xl font-black outline-none transition-all ${err ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-lions-blue focus:bg-white'}`} />
                  {err && <p className="text-red-500 text-[10px] font-black mt-2 uppercase ml-2 flex items-center gap-1 animate-pulse"><AlertCircle size={12}/> {err}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedService && (
        <div className="fixed bottom-0 left-0 w-full bg-white p-6 border-t shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-50 rounded-t-[3rem] max-w-xl mx-auto left-1/2 -translate-x-1/2">
          <div className="flex justify-between items-center mb-6 px-4">
            <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Punteggio Live</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-lions-blue tracking-tighter">{totalScore.toFixed(2)}</span>
              <span className="text-xs font-black text-lions-blue/40 uppercase">pt</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={isSubmitting || Object.keys(formErrors).length > 0 || !selectedClub}
            className="w-full bg-lions-blue text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition-all uppercase tracking-widest shadow-blue-200">
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Save size={24}/> <span>Salva Valutazione</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // --- SCHERMATA SUCCESSO ---
  if (view === 'success') return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center uppercase tracking-tighter">
      <div className="bg-green-100 p-8 rounded-full mb-8 animate-bounce shadow-lg shadow-green-100">
        <CheckCircle2 size={80} className="text-green-500" />
      </div>
      <h1 className="text-4xl font-black text-slate-800 leading-none mb-4">Registrato con<br/>Successo!</h1>
      <p className="text-slate-400 font-bold mb-12 normal-case tracking-normal">I punteggi sono stati caricati e la classifica aggiornata.</p>
      <button onClick={() => setView('dashboard')} className="w-full max-w-xs bg-slate-900 text-white font-black py-5 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all tracking-widest">Dashboard</button>
    </div>
  );
}