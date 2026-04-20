// =============================================================================
// INSERT SERVICE - Create new service activity
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, X, ArrowLeft, Upload } from 'lucide-react';
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

export default function InsertServiceView({ isAdmin, userClubs, userProfile, ThemeSwitcher, toast }) {
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
    fetchClubs();
  }, [isAdmin, userClubs]);

  const fetchClubs = async () => {
    if (isAdmin) {
      const { data } = await supabase.from('club').select('id, nome').order('nome');
      setClubs(data || []);
    } else if (userClubs.length > 0) {
      const { data } = await supabase.from('club').select('id, nome').in('id', userClubs).order('nome');
      setClubs(data || []);
    }
  };

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
      toast.success('Attività creata con successo!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const Input = ({ label, type = 'text', ...props }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input type={type} {...props} 
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
      />
    </div>
  );

  const Select = ({ label, options, ...props }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <select {...props}
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none transition-all"
      >
        <option value="">Seleziona...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 mb-4">
          <ArrowLeft size={18} /> Torna al Dashboard
        </button>

        <div className="bg-white dark:bg-brand-dark rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center">
              <Plus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">Nuova Attività</h1>
              <p className="text-slate-500 text-sm">Crea una nuova attività di service</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select 
              label="Club" 
              options={clubs.map(c => c.nome)}
              value={form.club_id}
              onChange={e => setForm({...form, club_id: e.target.value})}
            />

            <Input 
              label="Titolo Attività *" 
              placeholder="Es: Donazione alla Caritas"
              value={form.titolo}
              onChange={e => setForm({...form, titolo: e.target.value})}
            />

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Descrizione</label>
              <textarea 
                placeholder="Descrivi l'attività..."
                rows={3}
                value={form.descrizione}
                onChange={e => setForm({...form, descrizione: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Causa" options={CAUSE} value={form.causa} onChange={e => setForm({...form, causa: e.target.value})} />
              <Select label="Tipo Progetto" options={TIPI_PROGETTO} value={form.tipo_progetto} onChange={e => setForm({...form, tipo_progetto: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Data Inizio" type="date" value={form.data_inizio} onChange={e => setForm({...form, data_inizio: e.target.value})} />
              <Input label="Data Conclusione" type="date" value={form.data_conclusione} onChange={e => setForm({...form, data_conclusione: e.target.value})} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Persone Servite" type="number" min="0" value={form.persone_servite} onChange={e => setForm({...form, persone_servite: parseInt(e.target.value) || 0})} />
              <Input label="Volontari" type="number" min="0" value={form.totale_volontari} onChange={e => setForm({...form, totale_volontari: parseInt(e.target.value) || 0})} />
              <Input label="Ore Servizio" type="number" min="0" value={form.totale_ore_servizio} onChange={e => setForm({...form, totale_ore_servizio: parseInt(e.target.value) || 0})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Fondi Donati (€)" type="number" min="0" step="0.01" value={form.fondi_donati} onChange={e => setForm({...form, fondi_donati: parseFloat(e.target.value) || 0})} />
              <Input label="Fondi Raccolti (€)" type="number" min="0" step="0.01" value={form.fondi_raccolti} onChange={e => setForm({...form, fondi_raccolti: parseFloat(e.target.value) || 0})} />
            </div>

            <Input 
              label="Organizzazione Beneficiaria" 
              placeholder="Es: Caritas Firenze"
              value={form.organizzazione_beneficiaria}
              onChange={e => setForm({...form, organizzazione_beneficiaria: e.target.value})}
            />

            <Select label="Stato" options={STATI} value={form.stato} onChange={e => setForm({...form, stato: e.target.value})} />

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 disabled:opacity-50">
                {loading ? 'Salvataggio...' : <><Save size={20} /> Salva Attività</>}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-4 bg-slate-200 dark:bg-white/10 rounded-xl font-bold">
                Annulla
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}