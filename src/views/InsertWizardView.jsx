// =============================================================================
// VIEW: InsertWizardView - Wizard a 3 step per inserire una nuova valutazione
// =============================================================================
// ADMIN: mostra TUTTI i club
// REFERENTE: mostra solo i club associati
// =============================================================================

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Activity, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import ProgressRing from '../components/ProgressRing';

export default function InsertWizardView({ isAdmin, userClubs, userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clubs, setClubs] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [allRules, setAllRules] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: types } = await supabase.from('tipi_service').select('*');
      const { data: params } = await supabase.from('parametri').select('*');
      const { data: rules } = await supabase.from('regole_calcolo').select('*');
      setServiceTypes(types || []);
      setParameters(params || []);
      setAllRules(rules || []);

      // ADMIN: tutti i club. REFERENTE: solo i suoi club
      if (isAdmin) {
        const { data: allClubs } = await supabase.from('club').select('*');
        setClubs(allClubs || []);
      } else if (userClubs.length > 0) {
        const { data: myClubs } = await supabase.from('club').select('*').in('id', userClubs);
        setClubs(myClubs || []);
      } else {
        setClubs([]);
      }
    };
    fetchInitialData();
  }, [isAdmin, userClubs]);

  const currentRules = useMemo(
    () => allRules.filter((r) => r.id_tipo_service === Number(selectedService)),
    [selectedService, allRules]
  );
  const maxPossibleScore = useMemo(
    () => currentRules.reduce((sum, r) => sum + r.punti_max, 0),
    [currentRules]
  );
  const totalScore = useMemo(() => {
    let total = 0;
    currentRules.forEach((rule) => {
      const val = formValues[rule.id_parametro];
      if (val !== undefined && val !== '' && !formErrors[rule.id_parametro]) {
        total += (Number(val) / rule.range_max) * rule.punti_max;
      }
    });
    return total;
  }, [formValues, currentRules, formErrors]);

  const allFieldsFilled = useMemo(() => {
    if (currentRules.length === 0) return false;
    return currentRules.every(
      (rule) => formValues[rule.id_parametro] !== undefined && formValues[rule.id_parametro] !== ''
    );
  }, [currentRules, formValues]);

  const handleInputChange = (paramId, value, rule) => {
    const numVal = value === '' ? '' : Number(value);
    setFormValues((prev) => ({ ...prev, [paramId]: numVal }));
    if (numVal !== '' && (numVal < rule.range_min || numVal > rule.range_max)) {
      setFormErrors((prev) => ({ ...prev, [paramId]: `Max: ${rule.range_max}` }));
    } else {
      setFormErrors((prev) => { const n = { ...prev }; delete n[paramId]; return n; });
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: header, error: hErr } = await supabase
        .from('service_inseriti')
        .insert({
          id_utente: userProfile?.id,
          id_club: Number(selectedClub),
          id_tipo_service: Number(selectedService),
          punteggio_totale: totalScore,
        })
        .select()
        .single();

      if (hErr) {
        if (hErr.code === '23505') throw new Error('Dati già esistenti.');
        if (hErr.code === '23503') throw new Error('Club o Service non validi.');
        throw hErr;
      }

      const details = currentRules.map((rule) => ({
        id_service_inserito: header.id,
        id_parametro: rule.id_parametro,
        valore_dichiarato: Number(formValues[rule.id_parametro] || 0),
        punti_ottenuti: (Number(formValues[rule.id_parametro] || 0) / rule.range_max) * rule.punti_max,
      }));

      const { error: dErr } = await supabase.from('dettaglio_inserimenti').insert(details);
      if (dErr) throw dErr;

      navigate('/success');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500 overflow-x-hidden">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />

      {/* Step indicator */}
      <div className="flex justify-center gap-2 sm:gap-3 py-4 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.04]">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2.5 rounded-full transition-all duration-500 ${
            step >= s ? (step === s ? 'w-10 sm:w-12 bg-brand-blue dark:bg-brand-yellow shadow-sm' : 'w-4 bg-brand-red') : 'w-4 bg-slate-300 dark:bg-white/15'
          }`}></div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar ProgressRing */}
        <aside className={`lg:w-[400px] bg-white dark:bg-black/40 border-r border-slate-200 dark:border-white/10 p-12 flex flex-col items-center justify-center transition-all duration-1000 ${step === 1 ? 'lg:-translate-x-full opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="bg-slate-50 dark:bg-white/[0.08] p-6 rounded-[3rem] shadow-xl border border-slate-200 dark:border-white/15">
            <ProgressRing score={totalScore} max={maxPossibleScore} />
          </div>
          <div className="mt-12 w-full space-y-6 max-w-sm px-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow text-center mb-8 bg-brand-blue/5 dark:bg-white/10 py-2 rounded-full shadow-sm">
              Analisi Parametrica
            </h4>
            {currentRules.map((rule) => {
              const val = formValues[rule.id_parametro] || 0;
              const perc = (val / rule.range_max) * 100;
              return (
                <div key={rule.id} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase opacity-60 px-1 text-brand-blue dark:text-slate-300">
                    <span className="truncate max-w-[150px]">{parameters.find((p) => p.id === rule.id_parametro)?.nome}</span>
                    <span>{Math.round(perc)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-300 dark:bg-white/15 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-brand-blue to-brand-red transition-all duration-700" style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Contenuto */}
        <section className="flex-1 p-4 sm:p-8 sm:pt-6 overflow-y-auto bg-white/20 dark:bg-transparent text-brand-dark dark:text-white">
          <div className="max-w-3xl mx-auto pb-32 lg:pb-0">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-3 text-center sm:text-left">
                  <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-tight">
                    Configura<br />
                    <span className="text-brand-red dark:text-brand-yellow">Analisi</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg italic">
                    Seleziona i dati per la nuova valutazione ufficiale.
                  </p>
                </div>
                <div className="space-y-6 bg-white dark:bg-white/[0.08] p-8 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
                  {/* Club */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-blue/60 dark:text-brand-yellow ml-2">Lions Club</label>
                    <div className="relative text-brand-dark dark:text-white">
                      <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}
                        className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-[2.5rem] text-lg outline-none focus:ring-4 focus:ring-brand-yellow/20 appearance-none shadow-inner">
                        <option value="">Seleziona Club...</option>
                        {clubs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white">
                        <ArrowRight size={20} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  {/* Service */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-red ml-2">Categoria Progetto</label>
                    <div className="relative text-brand-dark dark:text-white">
                      <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-[2.5rem] text-lg outline-none focus:ring-4 focus:ring-brand-red/20 appearance-none shadow-inner">
                        <option value="">Seleziona Service...</option>
                        {serviceTypes.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white">
                        <ArrowRight size={20} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!selectedClub || !selectedService || isSubmitting}
                  className="w-full cursor-pointer py-7 bg-brand-blue text-white font-black rounded-[2.5rem] uppercase tracking-widest text-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3 border-none">
                  CONTINUA <ArrowRight size={24} />
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-center sm:text-left">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-brand-red dark:text-brand-yellow leading-none">Dati Operativi</h2>
                    <p className="text-slate-600 dark:text-slate-300 font-medium italic text-base">Sincronizzazione parametri.</p>
                  </div>
                  <div className="px-6 py-3 bg-white dark:bg-white/[0.08] rounded-2xl border border-slate-200 dark:border-white/20 text-brand-blue dark:text-brand-yellow text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {serviceTypes.find((s) => s.id === Number(selectedService))?.nome}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1 text-brand-dark dark:text-white">
                  {currentRules.map((rule) => {
                    const p = parameters.find((x) => x.id === rule.id_parametro);
                    const err = formErrors[rule.id_parametro];
                    return (
                      <div key={rule.id} className="p-8 bg-white dark:bg-white/[0.08] rounded-[3rem] border border-slate-200 dark:border-white/20 hover:border-brand-blue/30 transition-all shadow-md group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-300 tracking-widest mb-1">{p?.nome}</span>
                            <span className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase">Limite: {rule.range_max}</span>
                          </div>
                          <Activity size={18} className="text-brand-blue/20 dark:text-white/20 group-hover:text-brand-yellow transition-colors" />
                        </div>
                        <input type="number" placeholder="0" value={formValues[rule.id_parametro] || ''}
                          onChange={(e) => handleInputChange(rule.id_parametro, e.target.value, rule)}
                          className={`w-full bg-transparent text-5xl font-black outline-none border-b-4 transition-all pb-2 cursor-text text-brand-blue dark:text-white ${
                            err ? 'border-brand-red text-brand-red' : 'border-slate-100 dark:border-white/15 focus:border-brand-blue'
                          }`} />
                        {err && (
                          <div className="text-[9px] font-black text-brand-red uppercase mt-3 flex items-center gap-1">
                            <AlertCircle size={12} /> {err}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50">
                  <button onClick={() => setStep(1)} className="flex-1 cursor-pointer py-5 bg-white dark:bg-brand-dark border border-slate-300 dark:border-white/20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-90 transition-transform text-brand-blue dark:text-white border-none">
                    INDIETRO
                  </button>
                  <button onClick={() => setStep(3)} disabled={Object.keys(formErrors).length > 0 || !allFieldsFilled || isSubmitting}
                    className="flex-[2] cursor-pointer bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all border-none disabled:opacity-50">
                    CONFERMA
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-12 animate-in fade-in zoom-in duration-500 text-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-brand-yellow/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-blue dark:text-brand-yellow shadow-inner animate-pulse">
                    <ShieldCheck size={52} />
                  </div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-none">Riepilogo Dati</h2>
                  <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto font-medium text-base italic">Verifica i parametri acquisiti.</p>
                </div>
                <div className="bg-white dark:bg-white/[0.08] p-14 rounded-[4rem] border border-slate-200 dark:border-white/20 shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-brand-blue/5 dark:text-white/10 -rotate-12"><Cpu size={120} /></div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-100 dark:border-white/10 relative z-10 text-balance text-brand-dark dark:text-white">
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Club</div>
                      <div className="text-2xl font-black uppercase tracking-tight leading-none">{clubs.find((c) => c.id === Number(selectedClub))?.nome}</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase tracking-widest mb-2">Valutazione</div>
                      <div className="text-6xl font-black text-brand-blue dark:text-white tracking-tighter leading-none">{totalScore.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 px-2 text-brand-dark dark:text-white">
                    {currentRules.map((rule) => (
                      <div key={rule.id} className="text-center p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
                        <div className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 truncate px-1">{parameters.find((p) => p.id === rule.id_parametro)?.nome}</div>
                        <div className="text-xl font-black">{formValues[rule.id_parametro] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-6 max-w-sm mx-auto pb-10 px-4">
                  <button onClick={handleSave} disabled={isSubmitting} className="w-full cursor-pointer py-8 bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-none disabled:opacity-50">
                    REGISTRA
                  </button>
                  <button onClick={() => setStep(2)} className="text-slate-500 dark:text-slate-300 font-black uppercase text-xs hover:text-brand-blue dark:hover:text-brand-yellow transition-colors cursor-pointer active:scale-90 p-2 underline underline-offset-8">
                    Modifica Parametri
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
