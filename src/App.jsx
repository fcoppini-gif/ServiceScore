import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { 
  Trophy, Plus, ChevronLeft, Save, AlertCircle, 
  CheckCircle2, LogOut, User, TrendingUp, ArrowRight, Sparkles
} from 'lucide-react';

// =========================================================================
// 🚀 INSERISCI QUI IL LINK AL TUO LOGO UFFICIALE 01INFORMATICA
// Es: "https://www.tuosito.it/logo-01informatica.png"
// Se lo lasci vuoto, apparirà una scritta stilizzata.
// =========================================================================
const LOGO_01INFORMATICA = "assets/logo_01informatica_retina.png"; 

// --- CONFIGURAZIONE SUPABASE ---
const SUPABASE_URL = "INCOLLA_IL_TUO_URL_QUI"; 
const SUPABASE_ANON_KEY = "INCOLLA_LA_TUA_ANON_KEY_QUI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Componente helper per renderizzare il Logo ovunque
const BrandLogo = ({ className = "h-16" }) => {
  if (LOGO_01INFORMATICA) {
    return <img src={LOGO_01INFORMATICA} alt="01Informatica" className={`object-contain drop-shadow-2xl ${className}`} />;
  }
  return (
    <div className={`font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] via-[#E31837] to-[#0033A0] flex items-center ${className}`}>
      01 INFORMATICA
    </div>
  );
};

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B132B] text-[#FFC72C] font-black animate-pulse uppercase tracking-widest text-xl">
      <Sparkles className="mr-2 animate-spin" /> Inizializzazione...
    </div>
  );

  // --- SCHERMATA LOGIN (HERO EDITION) ---
  if (view === 'login') return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Animazioni CSS inline per i blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>

      {/* Sfondi Animati Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0033A0] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#E31837] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-[40%] left-[40%] w-72 h-72 bg-[#FFC72C] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob" style={{animationDelay: '4s'}}></div>

      {/* Pannello in Glassmorphism */}
      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all hover:scale-[1.01] hover:bg-white/10">
        <div className="flex flex-col items-center mb-10">
          <BrandLogo className="h-20 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white drop-shadow-md">ServiceScore</h1>
          <p className="text-[#FFC72C] font-bold text-sm tracking-widest uppercase mt-1">Lions District Tracker</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0033A0] to-[#E31837] rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} 
              className="relative w-full p-4 bg-[#0B132B]/80 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFC72C] text-white placeholder-slate-400 transition-all shadow-inner" required />
          </div>
          <div className="space-y-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E31837] to-[#FFC72C] rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} 
              className="relative w-full p-4 bg-[#0B132B]/80 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFC72C] text-white placeholder-slate-400 transition-all shadow-inner" required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-[#0033A0] via-[#E31837] to-[#FFC72C] text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(227,24,55,0.4)] active:scale-95 hover:shadow-[0_10px_40px_rgba(255,199,44,0.6)] transition-all uppercase tracking-widest mt-4 flex justify-center items-center gap-2">
            ENTRA NEL SISTEMA <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  // --- DASHBOARD (HERO EDITION) ---
  if (view === 'dashboard') return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-[#FFC72C] selection:text-[#0B132B]">
      {/* Header Premium */}
      <div className="bg-[#0B132B] text-white p-8 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E31837] blur-3xl opacity-50"></div>
        <div className="absolute -left-10 bottom-0 w-40 h-40 bg-[#0033A0] blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <BrandLogo className="h-10" />
          <button onClick={() => supabase.auth.signOut()} className="bg-white/10 p-3 rounded-2xl shadow-inner active:scale-90 transition-transform hover:bg-white/20 border border-white/10 text-[#FFC72C]">
            <LogOut size={20}/>
          </button>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <User size={14} className="text-[#E31837]" />
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Bottone Azione Gigante */}
      <div className="px-5 -mt-8 relative z-20">
        <button onClick={() => {setView('insert'); setFormValues({}); setFormErrors({});}} 
          className="w-full bg-gradient-to-r from-[#0033A0] to-[#E31837] text-white font-black p-6 rounded-3xl shadow-[0_15px_30px_rgba(0,51,160,0.3)] flex items-center justify-center gap-3 active:scale-95 hover:shadow-[0_20px_40px_rgba(227,24,55,0.4)] transition-all group border border-white/20">
          <div className="bg-white/20 text-white rounded-xl p-2 shadow-inner group-hover:rotate-90 transition-transform duration-300">
            <Plus size={28}/>
          </div> 
          <span className="text-lg tracking-widest">NUOVA VALUTAZIONE</span>
        </button>
      </div>

      {/* Classifica */}
      <div className="mt-12 px-6">
        <h2 className="text-xl font-black text-[#0B132B] flex items-center gap-2 mb-6 uppercase tracking-widest">
          <Trophy className="text-[#FFC72C] drop-shadow-md" size={28} /> CLASSIFICA CLUB
        </h2>
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
             <div className="text-center p-10 bg-white rounded-3xl border-2 border-dashed border-[#0033A0]/20 text-[#0033A0]/50 font-bold uppercase text-sm">Nessun dato registrato</div>
          ) : leaderboard.map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-md flex items-center justify-between border-l-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300" 
                 style={{ borderLeftColor: i === 0 ? '#FFC72C' : i === 1 ? '#E31837' : '#0033A0' }}>
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-lg shadow-inner ${
                  i === 0 ? 'bg-gradient-to-br from-[#FFC72C] to-amber-600 text-white' : 
                  i === 1 ? 'bg-gradient-to-br from-[#E31837] to-red-700 text-white' : 
                  'bg-slate-100 text-[#0B132B]'
                }`}>
                  {i + 1}
                </span>
                <span className="font-bold text-[#0B132B] text-lg">{item.nome}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#0033A0]">{item.score.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest -mt-1">Punti</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- FORM INSERIMENTO (HERO EDITION) ---
  if (view === 'insert') return (
    <div className="min-h-screen bg-slate-50 pb-48 font-sans">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md p-6 flex items-center sticky top-0 z-50 shadow-sm border-b border-[#0033A0]/10">
        <button onClick={() => setView('dashboard')} className="p-2 bg-slate-100 rounded-xl text-[#0B132B] hover:bg-[#E31837] hover:text-white transition-colors shadow-inner">
          <ChevronLeft size={24}/>
        </button>
        <h2 className="flex-1 text-center font-black text-[#0B132B] text-xl pr-10 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="text-[#FFC72C]"/> Inserimento
        </h2>
      </div>

      <div className="p-5 space-y-6 max-w-xl mx-auto mt-4">
        {/* Box Selezione */}
        <div className="bg-white p-8 rounded-[2rem] space-y-6 shadow-xl border-t-4 border-[#0033A0] relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFC72C]/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-[#E31837] uppercase ml-2 tracking-widest flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#E31837] text-white flex items-center justify-center text-[8px]">1</span> Seleziona Club
            </label>
            <select value={selectedClub} onChange={e=>setSelectedClub(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl shadow-inner text-[#0B132B] font-bold focus:border-[#0033A0] focus:bg-white outline-none appearance-none transition-all cursor-pointer">
              <option value="">Scegli un club...</option>
              {clubs.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-[#0033A0] uppercase ml-2 tracking-widest flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#0033A0] text-white flex items-center justify-center text-[8px]">2</span> Tipo Service
            </label>
            <select value={selectedService} onChange={e=>setSelectedService(e.target.value)} 
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl shadow-inner text-[#0B132B] font-bold focus:border-[#E31837] focus:bg-white outline-none appearance-none transition-all cursor-pointer">
              <option value="">Scegli un progetto...</option>
              {serviceTypes.map(s=><option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>

        {/* Campi Dinamici */}
        {selectedService && (
          <div className="space-y-4 mt-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center gap-2 ml-2 mb-4">
               <span className="w-6 h-6 rounded-full bg-[#FFC72C] text-[#0B132B] font-black flex items-center justify-center text-xs shadow-md">3</span>
               <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-widest">Dettaglio Valutazioni</h3>
            </div>
            
            {currentRules.map(rule => {
              const p = parameters.find(x => x.id === rule.id_parametro);
              const err = formErrors[rule.id_parametro];
              return (
                <div key={rule.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 group transition-all hover:border-[#0033A0]/30 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0033A0] to-[#E31837] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-center mb-4 pl-2">
                    <span className="font-black text-[#0B132B] text-sm">{p?.nome}</span>
                    <span className="text-[10px] font-black bg-[#FFC72C]/20 text-[#0B132B] px-3 py-1 rounded-full uppercase shadow-sm border border-[#FFC72C]/30">MAX {rule.punti_max} PT</span>
                  </div>
                  <input type="number" placeholder={`Ammesso: ${rule.range_min} - ${rule.range_max}`} value={formValues[rule.id_parametro] || ''} onChange={e=>handleInputChange(rule.id_parametro, e.target.value, rule)}
                    className={`w-full p-5 bg-slate-50 border-2 rounded-2xl text-xl font-black outline-none transition-all shadow-inner ${err ? 'border-[#E31837] bg-red-50 text-[#E31837]' : 'border-transparent focus:border-[#0033A0] focus:bg-white text-[#0033A0]'}`} />
                  {err && <p className="text-[#E31837] text-[10px] font-black mt-3 uppercase ml-2 flex items-center gap-1 animate-bounce"><AlertCircle size={14}/> {err}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Calcolatore Live */}
      {selectedService && (
        <div className="fixed bottom-0 left-0 w-full bg-[#0B132B] p-6 border-t-4 border-[#E31837] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-50 rounded-t-[3rem] max-w-2xl mx-auto left-1/2 -translate-x-1/2">
          <div className="flex justify-between items-center mb-6 px-4">
            <span className="font-black text-slate-300 text-sm uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="text-[#FFC72C]"/> Punteggio Live
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-amber-500 drop-shadow-lg tracking-tighter">
                {totalScore.toFixed(2)}
              </span>
              <span className="text-sm font-black text-[#FFC72C] uppercase ml-1">pt</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={isSubmitting || Object.keys(formErrors).length > 0 || !selectedClub}
            className="w-full bg-gradient-to-r from-[#0033A0] via-[#E31837] to-[#FFC72C] text-white font-black py-5 rounded-[2rem] shadow-[0_10px_30px_rgba(0,51,160,0.4)] flex items-center justify-center gap-3 active:scale-95 disabled:from-slate-600 disabled:to-slate-800 disabled:text-slate-400 disabled:shadow-none transition-all uppercase tracking-widest text-lg border border-white/20">
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> Elaborazione...
              </div>
            ) : (
              <><Save size={28}/> <span>Registra Valutazione</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // --- SCHERMATA SUCCESSO (HERO EDITION) ---
  if (view === 'success') return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-8 text-center uppercase tracking-tighter relative overflow-hidden">
      <div className="absolute top-[20%] w-full h-1/2 bg-gradient-to-b from-[#0033A0] to-transparent opacity-30 blur-3xl pointer-events-none"></div>
      
      <div className="bg-gradient-to-br from-[#FFC72C] to-[#E31837] p-10 rounded-[3rem] mb-10 animate-bounce shadow-[0_0_60px_rgba(255,199,44,0.4)] border-4 border-white/20 relative z-10">
        <CheckCircle2 size={100} className="text-white drop-shadow-md" />
      </div>
      
      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight mb-4 relative z-10">
        Valutazione<br/><span className="text-[#FFC72C]">Registrata!</span>
      </h1>
      
      <p className="text-slate-300 font-bold mb-16 normal-case tracking-wider text-lg relative z-10 max-w-sm">
        I punteggi sono stati caricati in modo sicuro e la classifica è aggiornata.
      </p>
      
      <button onClick={() => setView('dashboard')} className="w-full max-w-sm bg-white text-[#0033A0] font-black py-5 rounded-[2.5rem] shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:bg-[#FFC72C] hover:text-[#0B132B] active:scale-95 transition-all tracking-widest text-lg relative z-10">
        Ritorna alla Dashboard
      </button>
    </div>
  );
}