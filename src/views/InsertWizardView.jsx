// =============================================================================
// VIEW: InsertWizardView - Wizard a 3 step per inserire una nuova valutazione
// =============================================================================
// STEP 1 (Configura): Selezione Club + Tipo Service
//   → Legge da tabelle 'club' e 'tipi_service'
//   → Pulsante "CONTINUA" abilitato solo se entrambi selezionati
//
// STEP 2 (Dati Operativi): Inserimento valori per ogni parametro
//   → I parametri vengono da 'regole_calcolo' filtrati per id_tipo_service
//   → Ogni input ha validazione range (min/max) con errore inline
//   → ProgressRing e barre laterali aggiornate in tempo reale
//   → Pulsante "CONFERMA" abilitato solo se tutti i campi sono compilati e senza errori
//
// STEP 3 (Riepilogo): Mostra punteggio calcolato e conferma salvataggio
//   → Pulsante "REGISTRA" salva su Supabase (service_inseriti + dettaglio_inserimenti)
//
// FORMULA SCORING:
//   punti_ottenuti = (valore_inserito / range_max) * punti_max
//   punteggio_totale = somma di tutti i punti_ottenuti
//
// COLLEGAMENTI:
// - Usa supabase per leggere club, tipi_service, parametri, regole_calcolo
// - Usa supabase per scrivere su service_inseriti e dettaglio_inserimenti
// - Usa ProgressRing per mostrare il punteggio circolare animato
// - Usa toast per mostrare errori di salvataggio
// - Alla fine naviga a /success
// =============================================================================

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, AlertCircle, Activity, ArrowRight, ShieldCheck, Cpu,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProgressRing from '../components/ProgressRing';

export default function InsertWizardView({ resolvedTheme, toast }) {
  const navigate = useNavigate();
  // step: 1=selezione, 2=dati, 3=riepilogo
  const [step, setStep] = useState(1);
  // Dati tabelle (caricati una volta al mount)
  const [clubs, setClubs] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [allRules, setAllRules] = useState([]);
  // Selezione utente
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedService, setSelectedService] = useState('');
  // Form: {id_parametro: valore_numerico}
  const [formValues, setFormValues] = useState({});
  // Errori validazione: {id_parametro: "messaggio errore"}
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===========================================================================
  // useEffect: Carica dati iniziali dal database
  // Carica 4 tabelle in parallelo: club, tipi_service, parametri, regole_calcolo
  // ===========================================================================
  useEffect(() => {
    fetchInitialData();
  }, []);

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

  // ===========================================================================
  // useMemo: Calcoli derivati (ricalcolati solo quando cambiano le dipendenze)
  // ===========================================================================

  // currentRules: filtra le regole per il tipo service selezionato
  // Ogni regola dice "per questo parametro, in questo service, range è X e punti_max è Y"
  const currentRules = useMemo(
    () => allRules.filter((r) => r.id_tipo_service === Number(selectedService)),
    [selectedService, allRules]
  );

  // maxPossibleScore: punteggio massimo ottenibile (somma di tutti i punti_max)
  const maxPossibleScore = useMemo(
    () => currentRules.reduce((sum, r) => sum + r.punti_max, 0),
    [currentRules]
  );

  // totalScore: punteggio calcolato in tempo reale
  // Formula: (valore / range_max) * punti_max per ogni parametro
  const totalScore = useMemo(() => {
    let total = 0;
    currentRules.forEach((rule) => {
      const val = formValues[rule.id_parametro];
      // Considera il campo solo se ha un valore, non è vuoto, e non ha errori
      if (val !== undefined && val !== '' && !formErrors[rule.id_parametro]) {
        total += (Number(val) / rule.range_max) * rule.punti_max;
      }
    });
    return total;
  }, [formValues, currentRules, formErrors]);

  // allFieldsFilled: true se tutti i parametri hanno un valore inserito
  // Usato per abilitare/disabilitare il pulsante CONFERMA
  const allFieldsFilled = useMemo(() => {
    if (currentRules.length === 0) return false;
    return currentRules.every(
      (rule) => formValues[rule.id_parametro] !== undefined && formValues[rule.id_parametro] !== ''
    );
  }, [currentRules, formValues]);

  // ===========================================================================
  // handleInputChange: Gestisce l'input di ogni parametro
  // - Converte il valore in numero
  // - Valida contro range_min e range_max della regola
  // - Se fuori range, aggiunge errore (mostrato inline)
  // - Se valido, rimuove l'errore
  // ===========================================================================
  const handleInputChange = (paramId, value, rule) => {
    const numVal = value === '' ? '' : Number(value);
    setFormValues((prev) => ({ ...prev, [paramId]: numVal }));
    if (numVal !== '' && (numVal < rule.range_min || numVal > rule.range_max)) {
      setFormErrors((prev) => ({ ...prev, [paramId]: `Max: ${rule.range_max}` }));
    } else {
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n[paramId];
        return n;
      });
    }
  };

  // ===========================================================================
  // handleSave: Salva la valutazione su Supabase
  // 1. Inserisce record in 'service_inseriti' (testata con punteggio totale)
  // 2. Inserisce N record in 'dettaglio_inserimenti' (uno per ogni parametro)
  // Gestisce errori specifici: 23505 (duplicato), 23503 (FK non valida)
  // ===========================================================================
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1. Inserimento testata
      const { data: header, error: hErr } = await supabase
        .from('service_inseriti')
        .insert({
          id_club: Number(selectedClub),
          id_tipo_service: Number(selectedService),
          punteggio_totale: totalScore,
        })
        .select()
        .single();

      if (hErr) {
        // Errore unique constraint: club + service già inserito
        if (hErr.code === '23505') {
          throw new Error('Dati già esistenti. Questo club ha già registrato questo service.');
        }
        // Errore foreign key: club o service non esistono
        if (hErr.code === '23503') {
          throw new Error("Errore di integrità: il Club o il Service selezionato non sono validi.");
        }
        throw hErr;
      }

      // 2. Inserimento dettagli (uno per ogni parametro con le sue regole)
      const details = currentRules.map((rule) => ({
        id_service_inserito: header.id, // FK al record appena creato
        id_parametro: rule.id_parametro,
        valore_dichiarato: Number(formValues[rule.id_parametro] || 0),
        // Ricalcolo i punti per sicurezza (non fidarsi del frontend)
        punti_ottenuti:
          (Number(formValues[rule.id_parametro] || 0) / rule.range_max) * rule.punti_max,
      }));

      const { error: dErr } = await supabase.from('dettaglio_inserimenti').insert(details);
      if (dErr) throw dErr;

      // Successo: naviga alla pagina di conferma
      navigate('/success');
    } catch (e) {
      // Errore: mostra toast invece di alert
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden ${
        resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'
      }`}
    >
      {/* NAVBAR: back + indicatori step (3 pallini animati) */}
      <nav className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-4 bg-slate-200/50 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-slate-300 shadow-inner active:scale-90 cursor-pointer border-none"
        >
          <ChevronLeft size={24} />
        </button>
        {/* Indicatori step: pallino largo per step attivo, stretto per gli altri */}
        <div className="flex gap-2 sm:gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                step >= s
                  ? step === s
                    ? 'w-10 sm:w-12 bg-brand-blue dark:bg-brand-yellow shadow-sm'
                    : 'w-4 bg-brand-red'
                  : 'w-4 bg-slate-300 dark:bg-white/10'
              }`}
            ></div>
          ))}
        </div>
        <div className="w-10 sm:w-12"></div>
      </nav>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR: ProgressRing + barre progresso parametri (nascosta nello step 1) */}
        <aside
          className={`lg:w-[400px] bg-white dark:bg-black/30 border-r border-slate-200 dark:border-white/5 p-12 flex flex-col items-center justify-center transition-all duration-1000 ${
            step === 1 ? 'lg:-translate-x-full opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'
          }`}
        >
          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[3rem] shadow-xl border border-slate-200 dark:border-white/10">
            <ProgressRing score={totalScore} max={maxPossibleScore} />
          </div>
          <div className="mt-12 w-full space-y-6 max-w-sm px-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow text-center mb-8 bg-brand-blue/5 dark:bg-white/5 py-2 rounded-full shadow-sm">
              Analisi Parametrica
            </h4>
            {/* Barre di progresso per ogni parametro */}
            {currentRules.map((rule) => {
              const val = formValues[rule.id_parametro] || 0;
              const perc = (val / rule.range_max) * 100;
              return (
                <div key={rule.id} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase opacity-60 px-1 text-brand-blue dark:text-slate-400">
                    <span className="truncate max-w-[150px]">
                      {parameters.find((p) => p.id === rule.id_parametro)?.nome}
                    </span>
                    <span>{Math.round(perc)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-300 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-red transition-all duration-700"
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        {/* CONTENUTO PRINCIPALE: cambia in base allo step */}
        <section className="flex-1 p-6 sm:p-16 overflow-y-auto bg-white/20 dark:bg-transparent text-brand-dark dark:text-white">
          <div className="max-w-3xl mx-auto pb-32 lg:pb-0">
            {/* =======================================================================
                STEP 1: Selezione Club + Tipo Service
                Le tendine leggono dai dati caricati in fetchInitialData()
                ======================================================================= */}
            {step === 1 && (
              <div className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4 text-center sm:text-left">
                  <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-tight">
                    Configura
                    <br />
                    <span className="text-brand-red dark:text-brand-yellow">Analisi</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg italic">
                    Seleziona i dati per la nuova valutazione ufficiale.
                  </p>
                </div>
                <div className="space-y-8 bg-white dark:bg-white/5 p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl">
                  {/* Tendina Club */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-blue/60 dark:text-brand-yellow ml-2">
                      Lions Club Referente
                    </label>
                    <div className="relative text-brand-dark dark:text-white">
                      <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-[2.5rem] text-lg outline-none focus:ring-4 focus:ring-brand-yellow/20 appearance-none shadow-inner"
                      >
                        <option value="">Seleziona Club...</option>
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white">
                        <ArrowRight size={20} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  {/* Tendina Tipo Service */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-red ml-2">
                      Categoria Progetto
                    </label>
                    <div className="relative text-brand-dark dark:text-white">
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full cursor-pointer p-6 bg-slate-100 dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-[2.5rem] text-lg outline-none focus:ring-4 focus:ring-brand-red/20 appearance-none shadow-inner"
                      >
                        <option value="">Seleziona Service...</option>
                        {serviceTypes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 dark:text-white">
                        <ArrowRight size={20} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedClub || !selectedService || isSubmitting}
                  className="w-full cursor-pointer py-7 bg-brand-blue text-white font-black rounded-[2.5rem] uppercase tracking-widest text-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3 border-none"
                >
                  CONTINUA <ArrowRight size={24} />
                </button>
              </div>
            )}
            {/* =======================================================================
                STEP 2: Inserimento valori per ogni parametro
                I campi sono generati dinamicamente dalle regole_calcolo filtrate
                Ogni campo mostra: nome parametro, limite max, input numerico, errore
                ======================================================================= */}
            {step === 2 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-center sm:text-left">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-brand-red dark:text-brand-yellow leading-none">
                      Dati Operativi
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium italic text-base">
                      Sincronizzazione parametri.
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-brand-blue dark:text-brand-yellow text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {serviceTypes.find((s) => s.id === Number(selectedService))?.nome}
                  </div>
                </div>
                {/* Griglia dinamica di input numerici */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1 text-brand-dark dark:text-white">
                  {currentRules.map((rule) => {
                    const p = parameters.find((x) => x.id === rule.id_parametro);
                    const err = formErrors[rule.id_parametro];
                    return (
                      <div
                        key={rule.id}
                        className="p-8 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 hover:border-brand-blue/30 transition-all shadow-md group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
                              {p?.nome}
                            </span>
                            <span className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase">
                              Limite: {rule.range_max}
                            </span>
                          </div>
                          <Activity
                            size={18}
                            className="text-brand-blue/20 dark:text-white/10 group-hover:text-brand-yellow transition-colors"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="0"
                          value={formValues[rule.id_parametro] || ''}
                          onChange={(e) =>
                            handleInputChange(rule.id_parametro, e.target.value, rule)
                          }
                          className={`w-full bg-transparent text-5xl font-black outline-none border-b-4 transition-all pb-2 cursor-text text-brand-blue dark:text-white ${
                            err
                              ? 'border-brand-red text-brand-red'
                              : 'border-slate-100 dark:border-white/10 focus:border-brand-blue'
                          }`}
                        />
                        {err && (
                          <div className="text-[9px] font-black text-brand-red uppercase mt-3 flex items-center gap-1">
                            <AlertCircle size={12} /> {err}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Pulsanti fissi in basso (fixed) */}
                <div className="flex gap-4 fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 cursor-pointer py-5 bg-white dark:bg-brand-dark border border-slate-300 dark:border-white/20 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-90 transition-transform text-brand-blue dark:text-white border-none"
                  >
                    INDIETRO
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={
                      Object.keys(formErrors).length > 0 || !allFieldsFilled || isSubmitting
                    }
                    className="flex-[2] cursor-pointer bg-brand-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all border-none disabled:opacity-50"
                  >
                    CONFERMA
                  </button>
                </div>
              </div>
            )}
            {/* =======================================================================
                STEP 3: Riepilogo e conferma salvataggio
                Mostra il punteggio totale calcolato e tutti i valori inseriti
                ======================================================================= */}
            {step === 3 && (
              <div className="space-y-12 animate-in fade-in zoom-in duration-500 text-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-brand-yellow/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-brand-blue dark:text-brand-yellow shadow-inner animate-pulse">
                    <ShieldCheck size={52} />
                  </div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter text-brand-blue dark:text-white leading-none">
                    Riepilogo Dati
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-base italic">
                    Verifica i parametri acquisiti.
                  </p>
                </div>
                {/* Card riepilogo: nome club + punteggio + griglia valori */}
                <div className="bg-white dark:bg-white/5 p-14 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-brand-blue/5 dark:text-white/5 -rotate-12">
                    <Cpu size={120} />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-100 dark:border-white/5 relative z-10 text-balance text-brand-dark dark:text-white">
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Club
                      </div>
                      <div className="text-2xl font-black uppercase tracking-tight leading-none">
                        {clubs.find((c) => c.id === Number(selectedClub))?.nome}
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-black text-brand-red dark:text-brand-yellow uppercase tracking-widest mb-2">
                        Valutazione
                      </div>
                      <div className="text-6xl font-black text-brand-blue dark:text-white tracking-tighter leading-none">
                        {totalScore.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 px-2 text-brand-dark dark:text-white">
                    {currentRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="text-center p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner"
                      >
                        <div className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase mb-2 truncate px-1">
                          {parameters.find((p) => p.id === rule.id_parametro)?.nome}
                        </div>
                        <div className="text-xl font-black">{formValues[rule.id_parametro] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Pulsanti azione */}
                <div className="flex flex-col gap-6 max-w-sm mx-auto pb-10 px-4">
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="w-full cursor-pointer py-8 bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black rounded-[2.5rem] uppercase tracking-[0.2em] text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-none disabled:opacity-50"
                  >
                    REGISTRA
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="text-slate-500 dark:text-slate-400 font-black uppercase text-xs hover:text-brand-blue dark:hover:text-brand-yellow transition-colors cursor-pointer active:scale-90 p-2 underline underline-offset-8"
                  >
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
