// =============================================================================
// INSERT SERVICE - Premium form with animations
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Save, X, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CAUSE = [
  'Ambiente', 'Cancro infantile', 'Diabete', 'Fame', 'Vista', 
  'Giovani', 'Altro servizio umanitario', 'Amministrazione', 'Assistenza nei disastri'
];

const TIPI_PROGETTO = [
  'Donazione', 'Sensibilizzazione e istruzione e advocacy', 'Attività di rafforzamento del club',
  'Formazione e istruzione degli adulti', 'Evento di distribuzione di alimenti alla comunità',
  'Bonifica e ripristino ambientale', 'Altro', 'Raccolta, preparazione e distribuzione di alimenti'
];

const STATI = ['Bozza', 'Pronto per comunicare i dati', 'Comunicato'];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
};

export default function InsertServiceView({ isAdmin, userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    club_id: '',
    titolo: '',
    descrizione: '',
    causa: '',
    tipo_progetto: '',
    data_inizio: '',
    data_conclusione: '',
    persone_servite: 0,
    totale_volontari: 0,
    totale_ore_servizio: 0,
    fondi_donati: 0,
    fondi_raccolti: 0,
    organizzazione_beneficiaria: '',
    stato: 'Bozza',
  });

  useEffect(() => {
    supabase.from('club').select('id, nome').order('nome').then(({ data }) => setClubs(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.club_id) { toast.error('Seleziona un club'); return; }
    if (!form.titolo) { toast.error('Inserisci un titolo'); return; }
    
    setLoading(true);
    const { data: club } = await supabase.from('club').select('nome').eq('id', form.club_id).single();
    
    const { error } = await supabase.from('service_activities').insert({
      id_club: form.club_id,
      club_name: club?.nome,
      titolo: form.titolo,
      descrizione: form.descrizione,
      causa: form.causa,
      tipo_progetto: form.tipo_progetto,
      data_inizio: form.data_inizio || null,
      data_conclusione: form.data_conclusione || null,
      persone_servite: form.persone_servite || 0,
      totale_volontari: form.totale_volontari || 0,
      totale_ore_servizio: form.totale_ore_servizio || 0,
      fondi_donati: form.fondi_donati || 0,
      fondi_raccolti: form.fondi_raccolti || 0,
      organizzazione_beneficiaria: form.organizzazione_beneficiaria,
      stato: form.stato,
    });

    if (error) {
      toast.error('Errore: ' + error.message);
    } else {
      toast.success('Attività creata con successo! 🎉');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const Input = ({ label, type = 'text', ...props }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input type={type} {...props}
        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
      />
    </div>
  );

  const Select = ({ label, options, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none"
      >
        <option value="">Seleziona...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black mb-4">Accesso Negato</h1>
          <p className="text-slate-500 mb-6">Solo gli admin possono creare attività</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold">
            Torna al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] aurora-bg">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24">
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 mb-6 hover:text-brand-blue transition-colors"
        >
          <ArrowLeft size={20} /> Torna al Dashboard
        </motion.button>

        <motion.div
          {...fadeInUp}
          className="bg-white dark:bg-brand-dark rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-red rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Plus className="text-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black uppercase">Nuova Attività</h1>
              <p className="text-slate-500 text-sm">Crea una nuova attività di service</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Select 
                label="Club *"
                options={clubs.map(c => c.nome)}
                value={form.club_id}
                onChange={e => setForm({...form, club_id: e.target.value})}
              />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
              <Input 
                label="Titolo Attività *"
                placeholder="Es: Donazione alla Caritas"
                value={form.titolo}
                onChange={e => setForm({...form, titolo: e.target.value})}
              />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Descrizione</label>
                <textarea 
                  placeholder="Descrivi l'attività in dettaglio..."
                  rows={4}
                  value={form.descrizione}
                  onChange={e => setForm({...form, descrizione: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all resize-none"
                />
              </div>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.25 }} className="grid grid-cols-2 gap-4">
              <Select label="Causa" options={CAUSE} value={form.causa} onChange={e => setForm({...form, causa: e.target.value})} />
              <Select label="Tipo Progetto" options={TIPI_PROGETTO} value={form.tipo_progetto} onChange={e => setForm({...form, tipo_progetto: e.target.value})} />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4">
              <Input label="Data Inizio" type="date" value={form.data_inizio} onChange={e => setForm({...form, data_inizio: e.target.value})} />
              <Input label="Data Conclusione" type="date" value={form.data_conclusione} onChange={e => setForm({...form, data_conclusione: e.target.value})} />
            </motion.div>

            {/* Numbers Grid */}
            <motion.div {...fadeInUp} transition={{ delay: 0.35 }} className="grid grid-cols-3 gap-4">
              <Input label="Persone Servite" type="number" min="0" value={form.persone_servite} onChange={e => setForm({...form, persone_servite: parseInt(e.target.value) || 0})} />
              <Input label="Volontari" type="number" min="0" value={form.totale_volontari} onChange={e => setForm({...form, totale_volontari: parseInt(e.target.value) || 0})} />
              <Input label="Ore Servizio" type="number" min="0" value={form.totale_ore_servizio} onChange={e => setForm({...form, totale_ore_servizio: parseInt(e.target.value) || 0})} />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4">
              <Input label="Fondi Donati (€)" type="number" min="0" step="0.01" value={form.fondi_donati} onChange={e => setForm({...form, fondi_donati: parseFloat(e.target.value) || 0})} />
              <Input label="Fondi Raccolti (€)" type="number" min="0" step="0.01" value={form.fondi_raccolti} onChange={e => setForm({...form, fondi_raccolti: parseFloat(e.target.value) || 0})} />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.45 }}>
              <Input 
                label="Organizzazione Beneficiaria"
                placeholder="Es: Caritas Firenze"
                value={form.organizzazione_beneficiaria}
                onChange={e => setForm({...form, organizzazione_beneficiaria: e.target.value})}
              />
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Select label="Stato" options={STATI} value={form.stato} onChange={e => setForm({...form, stato: e.target.value})} />
            </motion.div>

            {/* Submit Buttons */}
            <motion.div {...fadeInUp} transition={{ delay: 0.55 }} className="flex gap-4 pt-6">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-brand-blue to-[#0044B8] text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-blue/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={22} /> Salva Attività
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-5 bg-slate-200 dark:bg-white/10 rounded-2xl font-bold"
              >
                Annulla
              </motion.button>
            </motion.div>

          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}