// =============================================================================
// INSERT MEMBER - Add new club member (Socio)
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORIE = ['Socio effettivo', 'Socio onorario', 'Socio aggregato', 'Socio privilegiato', 'Socio a vita'];

export default function InsertMemberView({ isAdmin, userClubs, userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    club_id: '',
    matricola: '',
    nome: '',
    cognome: '',
    titolo: '',
    email_personal: '',
    cellulare: '',
    citta: '',
    provincia: '',
    categoria: 'Socio effettivo',
  });

  useEffect(() => {
    if (isAdmin) {
      supabase.from('club').select('id, nome').order('nome').then(({ data }) => setClubs(data || []));
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.club_id) { toast.error('Seleziona un club'); return; }
    if (!form.nome || !form.cognome) { toast.error('Inserisci nome e cognome'); return; }
    
    setLoading(true);
    
    const { data: club } = await supabase.from('club').select('nome').eq('id', form.club_id).single();
    
    const { error } = await supabase.from('soci').insert({
      id_club: form.club_id,
      club_name: club?.nome,
      matricola: form.matricola || null,
      nome: form.nome,
      cognome: form.cognome,
      titolo: form.titolo || null,
      email_personal: form.email_personal || null,
      cellulare: form.cellulare || null,
      citta: form.citta || null,
      provincia: form.provincia || null,
      categoria: form.categoria,
      stato_associativo: 'Lion',
    });

    if (error) {
      toast.error('Errore: ' + error.message);
    } else {
      toast.success('Socio creato!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const Input = ({ label, ...props }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input {...props}
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
          <p className="text-slate-500 mb-4">Solo gli admin possono aggiungere soci</p>
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
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center">
              <Plus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">Nuovo Socio</h1>
              <p className="text-slate-500 text-sm">Aggiungi un nuovo membro al club</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select 
              label="Club *" 
              options={clubs.map(c => c.nome)}
              value={form.club_id}
              onChange={e => setForm({...form, club_id: e.target.value})}
            />

            <Input 
              label="Matricola" 
              placeholder="Numero socio Lions"
              value={form.matricola}
              onChange={e => setForm({...form, matricola: e.target.value})}
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

            <Input 
              label="Titolo (Dott, Geom, etc.)" 
              placeholder="Titolo"
              value={form.titolo}
              onChange={e => setForm({...form, titolo: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Email" 
                type="email"
                placeholder="email@mail.it"
                value={form.email_personal}
                onChange={e => setForm({...form, email_personal: e.target.value})}
              />
              <Input 
                label="Cellulare" 
                placeholder="+39 333 1234567"
                value={form.cellulare}
                onChange={e => setForm({...form, cellulare: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Città" 
                placeholder="Firenze"
                value={form.citta}
                onChange={e => setForm({...form, citta: e.target.value})}
              />
              <Input 
                label="Provincia" 
                placeholder="FI"
                value={form.provincia}
                onChange={e => setForm({...form, provincia: e.target.value})}
              />
            </div>

            <Select 
              label="Categoria" 
              options={CATEGORIE}
              value={form.categoria}
              onChange={e => setForm({...form, categoria: e.target.value})}
            />

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 disabled:opacity-50">
                {loading ? 'Salvataggio...' : <><Save size={20} /> Salva Socio</>}
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