// =============================================================================
// INSERT OFFICER - Add new club officer
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TITOLI = [
  'Presidente di club', 'Club First Vice President', 'Secondo Vice Presidente di Club',
  'Segretario di club', 'Tesoriere di club', 'Membership Chairperson', 
  'Service Chairperson', 'LCIF Chairperson', 'Campus Lions Club Sponsor',
  'Past President', 'Board Member'
];

export default function InsertOfficerView({ isAdmin, userClubs, userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    club_id: '',
    titolo: '',
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data_inizio: '',
    data_fine: '',
  });

  useEffect(() => {
    if (isAdmin) {
      supabase.from('club').select('id, nome').order('nome').then(({ data }) => setClubs(data || []));
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.club_id) { toast.error('Seleziona un club'); return; }
    if (!form.titolo) { toast.error('Seleziona un titolo'); return; }
    if (!form.nome || !form.cognome) { toast.error('Inserisci nome e cognome'); return; }
    
    setLoading(true);
    
    const { data: club } = await supabase.from('club').select('nome').eq('id', form.club_id).single();
    
    const { error } = await supabase.from('officer').insert({
      id_club: form.club_id,
      club_name: club?.nome,
      titolo: form.titolo,
      nome: form.nome,
      cognome: form.cognome,
      email: form.email || null,
      telefono: form.telefono || null,
      data_inizio: form.data_inizio || null,
      data_fine: form.data_fine || null,
      stato: 'active',
    });

    if (error) {
      toast.error('Errore: ' + error.message);
    } else {
      toast.success('Officer creato!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const Input = ({ label, type = 'text', ...props }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input type={type} {...props}
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none transition-all"
      />
    </div>
  );

  const Select = ({ label, options, value, onChange }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none transition-all"
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
          <h1 className="text-2xl font-black mb-4">Accesso Negato</h1>
          <p className="text-slate-500 mb-4">Solo gli admin possono aggiungere officer</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold">
            Torna al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 mb-4">
          <ArrowLeft size={18} /> Torna al Dashboard
        </button>

        <div className="bg-white dark:bg-brand-dark rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
              <Plus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">Nuovo Officer</h1>
              <p className="text-slate-500 text-sm">Aggiungi una nuova carica al club</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select 
              label="Club *" 
              options={clubs.map(c => c.nome)}
              value={form.club_id}
              onChange={e => setForm({...form, club_id: e.target.value})}
            />

            <Select 
              label="Titolo *" 
              options={TITOLI}
              value={form.titolo}
              onChange={e => setForm({...form, titolo: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Nome *" 
                placeholder="Nome"
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
              />
              <Input 
                label="Cognome *" 
                placeholder="Cognome"
                value={form.cognome}
                onChange={e => setForm({...form, cognome: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Email" 
                type="email"
                placeholder="email@mail.it"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
              <Input 
                label="Telefono" 
                placeholder="+39 333 1234567"
                value={form.telefono}
                onChange={e => setForm({...form, telefono: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Data Inizio" 
                type="date"
                value={form.data_inizio}
                onChange={e => setForm({...form, data_inizio: e.target.value})}
              />
              <Input 
                label="Data Fine" 
                type="date"
                value={form.data_fine}
                onChange={e => setForm({...form, data_fine: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 disabled:opacity-50">
                {loading ? 'Salvataggio...' : <><Save size={20} /> Salva Officer</>}
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