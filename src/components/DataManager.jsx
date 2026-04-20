import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';

export default function DataManager({ table, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const tableConfig = {
    soci: {
      title: 'Soci',
      columns: ['matricola', 'nome', 'cognome', 'titolo', 'email_personal', 'cellulare', 'citta', 'provincia', 'categoria'],
      labels: { matricola: 'Matricola', nome: 'Nome', cognome: 'Cognome', titolo: 'Titolo', email_personal: 'Email', cellulare: 'Cellulare', citta: 'Città', provincia: 'Provincia', categoria: 'Categoria' }
    },
    officer: {
      title: 'Officer',
      columns: ['titolo', 'nome', 'cognome', 'email', 'telefono', 'data_inizio', 'data_fine'],
      labels: { titolo: 'Titolo', nome: 'Nome', cognome: 'Cognome', email: 'Email', telefono: 'Telefono', data_inizio: 'Data Inizio', data_fine: 'Data Fine' }
    },
    service_activities: {
      title: 'Attività',
      columns: ['titolo', 'descrizione', 'causa', 'tipo_progetto', 'data_inizio', 'persone_servite', 'fondi_donati'],
      labels: { titolo: 'Titolo', descrizione: 'Descrizione', causa: 'Causa', tipo_progetto: 'Tipo', data_inizio: 'Data', persone_servite: 'Persone', fondi_donati: 'Fondi' }
    },
    club: {
      title: 'Club',
      columns: ['nome', 'id_lions', 'circoscrizione', 'zona'],
      labels: { nome: 'Nome', id_lions: 'ID Lions', circoscrizione: 'Circoscrizione', zona: 'Zona' }
    }
  };

  const config = tableConfig[table];

  useEffect(() => {
    fetchData();
  }, [table]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from(table).select('*').order('id');
    
    // For service_activities, filter out empty records
    if (table === 'service_activities') {
      query = query.not('titolo', 'is', null);
    }
    
    const { data: result } = await query.limit(100);
    setData(result || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (editing?.id) {
      await supabase.from(table).update(formData).eq('id', editing.id);
    } else {
      await supabase.from(table).insert(formData);
    }
    setEditing(null);
    setFormData({});
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminare questo record?')) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setFormData(item);
  };

  const startNew = () => {
    setEditing({});
    setFormData({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-dark rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase">{config.title}</h2>
            <p className="text-sm text-slate-500">Gestione dati • {data.length} record visualizzati</p>
          </div>
          <div className="flex gap-2">
            <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90">
              <Plus size={18} /> Nuovo
            </button>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/10 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        {editing !== null && (
          <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {config.columns.map(col => (
                <div key={col}>
                  <label className="text-xs font-bold uppercase text-slate-500">{config.labels[col]}</label>
                  <input
                    type={col.includes('data') ? 'date' : 'text'}
                    value={formData[col] || ''}
                    onChange={e => setFormData({ ...formData, [col]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">
                <Save size={18} /> Salva
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2 bg-slate-200 dark:bg-white/10 rounded-xl font-bold">
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-white/5 sticky top-0">
                <tr>
                  {config.columns.slice(0, 4).map(col => (
                    <th key={col} className="p-3 text-left font-black uppercase">{config.labels[col]}</th>
                  ))}
                  <th className="p-3 text-right font-black uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Nessun record trovato</td>
                  </tr>
                ) : data.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                    {config.columns.slice(0, 4).map(col => (
                      <td key={col} className="p-3 truncate max-w-[150px]">{item[col] || '-'}</td>
                    ))}
                    <td className="p-3 text-right">
                      <button onClick={() => startEdit(item)} className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-brand-red hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}