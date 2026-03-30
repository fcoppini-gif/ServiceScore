// =============================================================================
// VIEW: AdminView - Pannello di amministrazione
// =============================================================================
// 5 sezioni: Classifica, Club, Service, Regole, Utenti
// =============================================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Trash2, Edit3, Save, X, Trophy, Users, Building2, Layers, Settings, Activity,
  Link2, Unlink, ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminView({ userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const { section = 'classifica' } = useParams();

  // Classifica
  const [leaderboard, setLeaderboard] = useState([]);

  // Club
  const [clubs, setClubs] = useState([]);
  const [newClubName, setNewClubName] = useState('');
  const [editingClub, setEditingClub] = useState(null);
  const [editClubName, setEditClubName] = useState('');

  // Service (tipi + inseriti per club)
  const [serviceTypes, setServiceTypes] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [selectedServiceClub, setSelectedServiceClub] = useState('');
  const [clubServices, setClubServices] = useState([]);

  // Regole
  const [allRules, setAllRules] = useState([]);
  const [allParams, setAllParams] = useState([]);
  const [newRule, setNewRule] = useState({ id_tipo_service: '', id_parametro: '', range_min: 0, range_max: 1, punti_max: 1 });
  const [editingRule, setEditingRule] = useState(null);
  const [editRuleData, setEditRuleData] = useState({});

  // Utenti
  const [allUsers, setAllUsers] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newRuolo, setNewRuolo] = useState('referente');
  const [newUserClubs, setNewUserClubs] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(null);

  // =========================================================================
  // FETCH
  // =========================================================================
  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('service_inseriti').select(`punteggio_totale, id_club, club(nome)`);
    if (data) {
      const scores = data.reduce((acc, item) => {
        const name = item.club?.nome || `Club ID: ${item.id_club}`;
        acc[name] = (acc[name] || 0) + (item.punteggio_totale || 0);
        return acc;
      }, {});
      setLeaderboard(Object.entries(scores).map(([nome, score]) => ({ nome, score })).sort((a, b) => b.score - a.score));
    }
  };

  const fetchClubs = async () => {
    const { data } = await supabase.from('club').select('*').order('id');
    setClubs(data || []);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from('tipi_service').select('*').order('id');
    setServiceTypes(data || []);
    // Se c'è un club selezionato, ricarica i suoi service
    if (selectedServiceClub) fetchClubServices(selectedServiceClub);
  };

  const fetchClubServices = async (clubId) => {
    if (!clubId) { setClubServices([]); return; }
    const { data } = await supabase
      .from('service_inseriti')
      .select('*, tipi_service(nome), utenti(username)')
      .eq('id_club', Number(clubId))
      .order('data_inserimento', { ascending: false });
    setClubServices(data || []);
  };

  const fetchRules = async () => {
    const { data: rules } = await supabase.from('regole_calcolo').select('*, tipi_service(nome), parametri(nome)').order('id_tipo_service');
    const { data: params } = await supabase.from('parametri').select('*');
    const { data: types } = await supabase.from('tipi_service').select('*');
    setAllRules(rules || []);
    setAllParams(params || []);
    setServiceTypes(types || []);
  };

  const fetchUsers = async () => {
    const { data: users } = await supabase.from('utenti').select('*').order('username');
    const { data: clubs } = await supabase.from('club').select('*').order('nome');
    const { data: links } = await supabase.from('utenti_club').select('*');
    const userClubMap = {};
    links?.forEach((l) => {
      if (!userClubMap[l.id_utente]) userClubMap[l.id_utente] = [];
      userClubMap[l.id_utente].push(l.id_club);
    });
    setAllUsers((users || []).map((u) => ({ ...u, clubIds: userClubMap[u.id] || [] })));
    setAllClubs(clubs || []);
  };

  useEffect(() => {
    const run = async () => {
      if (section === 'classifica') await fetchLeaderboard();
      if (section === 'club') await fetchClubs();
      if (section === 'service') { await fetchServices(); await fetchClubs(); }
      if (section === 'regole') await fetchRules();
      if (section === 'utenti') await fetchUsers();
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // =========================================================================
  // AZIONI CLUB
  // =========================================================================
  const addClub = async () => {
    if (!newClubName.trim()) return;
    const { error } = await supabase.from('club').insert({ nome: newClubName.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success('Club aggiunto');
    setNewClubName('');
    fetchClubs();
  };

  const updateClub = async (id) => {
    if (!editClubName.trim()) return;
    await supabase.from('club').update({ nome: editClubName.trim() }).eq('id', id);
    toast.success('Club aggiornato');
    setEditingClub(null);
    fetchClubs();
  };

  const deleteClub = async (id) => {
    if (!confirm('Eliminare questo club?')) return;
    await supabase.from('club').delete().eq('id', id);
    toast.success('Club eliminato');
    fetchClubs();
  };

  // =========================================================================
  // AZIONI SERVICE
  // =========================================================================
  const addService = async () => {
    if (!newServiceName.trim()) return;

    // 1. Inserisci il tipo service
    const { data: newService, error } = await supabase
      .from('tipi_service')
      .insert({ nome: newServiceName.trim() })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }

    // 2. Inserisci automaticamente le 7 regole con range di default
    if (newService) {
      const defaultRules = [
        { id_parametro: 1, range_min: 0, range_max: 1, punti_max: 10 },      // Realizzazione Service
        { id_parametro: 2, range_min: 0, range_max: 1, punti_max: 5 },       // Originalità
        { id_parametro: 3, range_min: 1, range_max: 5, punti_max: 5 },       // Difficoltà organizzativa
        { id_parametro: 4, range_min: 1, range_max: 50, punti_max: 10 },     // Volontari coinvolti
        { id_parametro: 5, range_min: 1, range_max: 500, punti_max: 10 },    // Ore di attività totali
        { id_parametro: 6, range_min: 0, range_max: 20000, punti_max: 10 },  // Fondi raccolti
        { id_parametro: 7, range_min: 1, range_max: 500, punti_max: 10 },    // Persone servite
      ];

      const rulesToInsert = defaultRules.map((r) => ({
        id_tipo_service: newService.id,
        id_parametro: r.id_parametro,
        range_min: r.range_min,
        range_max: r.range_max,
        punti_max: r.punti_max,
      }));

      await supabase.from('regole_calcolo').insert(rulesToInsert);
    }

    toast.success('Service aggiunto con tutti i parametri');
    setNewServiceName('');
    fetchServices();
  };

  const updateService = async (id) => {
    if (!editServiceName.trim()) return;
    await supabase.from('tipi_service').update({ nome: editServiceName.trim() }).eq('id', id);
    toast.success('Service aggiornato');
    setEditingService(null);
    fetchServices();
  };

  const deleteService = async (id) => {
    if (!confirm('Eliminare questo service?')) return;
    await supabase.from('tipi_service').delete().eq('id', id);
    toast.success('Service eliminato');
    fetchServices();
  };

  const deleteServiceInserito = async (id) => {
    if (!confirm('Eliminare questo service inserito?')) return;
    await supabase.from('dettaglio_inserimenti').delete().eq('id_service_inserito', id);
    await supabase.from('service_inseriti').delete().eq('id', id);
    toast.success('Service eliminato');
    fetchClubServices(selectedServiceClub);
  };

  // =========================================================================
  // AZIONI REGOLE
  // =========================================================================
  const addRule = async () => {
    if (!newRule.id_tipo_service || !newRule.id_parametro) { toast.error('Seleziona service e parametro'); return; }
    await supabase.from('regole_calcolo').insert({
      id_tipo_service: Number(newRule.id_tipo_service),
      id_parametro: Number(newRule.id_parametro),
      range_min: Number(newRule.range_min),
      range_max: Number(newRule.range_max),
      punti_max: Number(newRule.punti_max),
    });
    toast.success('Regola aggiunta');
    setNewRule({ id_tipo_service: '', id_parametro: '', range_min: 0, range_max: 1, punti_max: 1 });
    fetchRules();
  };

  const updateRule = async (id) => {
    await supabase.from('regole_calcolo').update({
      range_min: Number(editRuleData.range_min),
      range_max: Number(editRuleData.range_max),
      punti_max: Number(editRuleData.punti_max),
    }).eq('id', id);
    toast.success('Regola aggiornata');
    setEditingRule(null);
    fetchRules();
  };

  const deleteRule = async (id) => {
    if (!confirm('Eliminare questa regola?')) return;
    await supabase.from('regole_calcolo').delete().eq('id', id);
    toast.success('Regola eliminata');
    fetchRules();
  };

  // =========================================================================
  // AZIONI UTENTI
  // =========================================================================
  const toggleUserClub = async (userId, clubId, isLinked) => {
    if (isLinked) {
      await supabase.from('utenti_club').delete().eq('id_utente', userId).eq('id_club', clubId);
    } else {
      await supabase.from('utenti_club').upsert({ id_utente: userId, id_club: clubId }, { onConflict: 'id_utente,id_club' });
    }
    fetchUsers();
  };

  const changeUserRole = async (userId, newRole) => {
    await supabase.from('utenti').update({ ruolo: newRole }).eq('id', userId);
    toast.success('Ruolo aggiornato');
    fetchUsers();
  };

  // Crea profilo utente (senza auth, l'utente si registra dopo)
  const createUser = async () => {
    if (!newUsername.trim()) { toast.error('Inserisci uno username'); return; }
    try {
      const newId = crypto.randomUUID();
      const { error } = await supabase.from('utenti').insert({
        id: newId,
        username: newUsername.trim(),
        password_hash: 'managed_by_supabase_auth',
        ruolo: newRuolo,
      });
      if (error) {
        if (error.code === '23505') { toast.error('Username già esistente'); return; }
        toast.error(error.message);
        return;
      }
      toast.success(`Utente "${newUsername}" creato`);
      setCreatedUserId(newId);
      // Salva i club selezionati
      for (const clubId of newUserClubs) {
        await supabase.from('utenti_club').upsert({ id_utente: newId, id_club: clubId }, { onConflict: 'id_utente,id_club' });
      }
      setNewUsername('');
      setNewRuolo('referente');
      setNewUserClubs([]);
      fetchUsers();
    } catch {
      toast.error('Errore creazione utente');
    }
  };

  const toggleNewUserClub = (clubId) => {
    setNewUserClubs((prev) => prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]);
  };

  // =========================================================================
  // TABS
  // =========================================================================
  const tabs = [
    { id: 'classifica', label: 'Classifica', icon: Trophy },
    { id: 'club', label: 'Club', icon: Building2 },
    { id: 'service', label: 'Service', icon: Layers },
    { id: 'regole', label: 'Regole', icon: Settings },
    { id: 'utenti', label: 'Utenti', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500">
      <Navbar isAdmin={true} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      <div className="max-w-5xl mx-auto p-4 sm:p-12 space-y-8 text-brand-dark dark:text-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Amministrazione</h1>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => navigate(`/admin/${tab.id}`)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap ${
                section === tab.id ? 'bg-brand-blue text-white shadow-xl' : 'bg-white dark:bg-white/[0.08] text-brand-blue dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CLASSIFICA */}
        {section === 'classifica' && (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center p-16 bg-white dark:bg-white/[0.08] rounded-[3rem] border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs italic">Nessun dato presente.</div>
            ) : leaderboard.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-white/[0.08] rounded-[2.5rem] border border-slate-200 dark:border-white/20 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] font-black text-xl shadow-inner ${
                    i === 0 ? 'bg-gradient-to-br from-brand-yellow to-amber-500 text-brand-dark' : i === 1 ? 'bg-slate-300 text-slate-700' : 'bg-slate-50 dark:bg-white/10 text-brand-blue dark:text-white'
                  }`}>#{i + 1}</div>
                  <span className="text-lg font-black uppercase tracking-tight">{item.nome}</span>
                </div>
                <div className="text-3xl font-black text-brand-blue dark:text-white">{item.score.toFixed(1)}</div>
              </div>
            ))}
          </div>
        )}

        {/* CLUB */}
        {section === 'club' && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <input type="text" placeholder="Nome nuovo club..." value={newClubName} onChange={(e) => setNewClubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addClub()}
                className="flex-1 px-5 py-4 bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/20 rounded-2xl text-brand-dark dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" />
              <button onClick={addClub} className="px-6 py-4 bg-brand-blue text-white rounded-2xl font-black cursor-pointer border-none hover:shadow-xl active:scale-95 transition-all"><Plus size={20} /></button>
            </div>
            {clubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.08] rounded-2xl border border-slate-200 dark:border-white/20 shadow-sm">
                {editingClub === club.id ? (
                  <div className="flex gap-2 flex-1">
                    <input type="text" value={editClubName} onChange={(e) => setEditClubName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-black/50 rounded-xl text-brand-dark dark:text-white outline-none font-bold" autoFocus />
                    <button onClick={() => updateClub(club.id)} className="p-2 bg-green-600 text-white rounded-xl cursor-pointer border-none"><Save size={16} /></button>
                    <button onClick={() => setEditingClub(null)} className="p-2 bg-slate-500 text-white rounded-xl cursor-pointer border-none"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-lg">{club.nome}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingClub(club.id); setEditClubName(club.nome); }} className="p-2 bg-slate-200 dark:bg-white/15 rounded-xl cursor-pointer border-none text-brand-blue dark:text-white"><Edit3 size={16} /></button>
                      <button onClick={() => deleteClub(club.id)} className="p-2 bg-red-100 dark:bg-brand-red/25 rounded-xl cursor-pointer border-none text-brand-red"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SERVICE */}
        {section === 'service' && (
          <div className="space-y-6">
            {/* Seleziona club */}
            <div className="bg-white dark:bg-white/[0.08] p-6 rounded-[2rem] border border-slate-200 dark:border-white/20 shadow-sm space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">Seleziona Club</div>
              <div className="flex gap-3">
                <select value={selectedServiceClub} onChange={(e) => { setSelectedServiceClub(e.target.value); fetchClubServices(e.target.value); }}
                  className="flex-1 py-3 px-5 rounded-xl text-sm font-bold cursor-pointer">
                  <option value="">Seleziona un club...</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {selectedServiceClub && (
                  <button onClick={() => navigate('/insert')}
                    className="px-6 py-4 bg-brand-blue text-white rounded-2xl font-black cursor-pointer border-none hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center gap-2">
                    <Plus size={16} /> Nuovo
                  </button>
                )}
              </div>
            </div>

            {/* Service inseriti per il club selezionato */}
            {selectedServiceClub && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow ml-2">
                  Service di {clubs.find((c) => c.id === Number(selectedServiceClub))?.nome}
                </h3>
                {clubServices.length === 0 ? (
                  <div className="text-center p-12 bg-white dark:bg-white/[0.08] rounded-[2rem] border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 text-sm italic">
                    Nessun service inserito per questo club.
                  </div>
                ) : clubServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-5 bg-white dark:bg-white/[0.08] rounded-2xl border border-slate-200 dark:border-white/20 shadow-sm">
                    <div>
                      <div className="font-bold text-lg">{s.tipi_service?.nome || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {s.utenti?.username || 'N/A'} · {new Date(s.data_inserimento).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-black text-brand-blue dark:text-white">{s.punteggio_totale?.toFixed(1)}</div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">punti</div>
                      </div>
                      <button onClick={() => deleteServiceInserito(s.id)}
                        className="p-2 bg-red-100 dark:bg-brand-red/25 rounded-xl cursor-pointer border-none text-brand-red">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CRUD tipi service */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow ml-2">Tipi di Service</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="Nome nuovo tipo service..." value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addService()}
                  className="flex-1 px-5 py-4 bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/20 rounded-2xl text-brand-dark dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" />
                <button onClick={addService} className="px-6 py-4 bg-brand-blue text-white rounded-2xl font-black cursor-pointer border-none hover:shadow-xl active:scale-95 transition-all"><Plus size={20} /></button>
              </div>
              {serviceTypes.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.08] rounded-2xl border border-slate-200 dark:border-white/20 shadow-sm">
                  {editingService === s.id ? (
                    <div className="flex gap-2 flex-1">
                      <input type="text" value={editServiceName} onChange={(e) => setEditServiceName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-black/50 rounded-xl text-brand-dark dark:text-white outline-none font-bold" autoFocus />
                      <button onClick={() => updateService(s.id)} className="p-2 bg-green-600 text-white rounded-xl cursor-pointer border-none"><Save size={14} /></button>
                      <button onClick={() => setEditingService(null)} className="p-2 bg-slate-500 text-white rounded-xl cursor-pointer border-none"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold">{s.nome}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingService(s.id); setEditServiceName(s.nome); }} className="p-2 bg-slate-200 dark:bg-white/15 rounded-xl cursor-pointer border-none text-brand-blue dark:text-white"><Edit3 size={14} /></button>
                        <button onClick={() => deleteService(s.id)} className="p-2 bg-red-100 dark:bg-brand-red/25 rounded-xl cursor-pointer border-none text-brand-red"><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGOLE */}
        {section === 'regole' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/[0.08] p-6 rounded-[2rem] border border-slate-200 dark:border-white/20 shadow-sm space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">Nuova Regola</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={newRule.id_tipo_service} onChange={(e) => setNewRule({ ...newRule, id_tipo_service: e.target.value })}
                  className="px-4 py-3 rounded-xl text-sm font-bold cursor-pointer">
                  <option value="">Service...</option>
                  {serviceTypes.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
                <select value={newRule.id_parametro} onChange={(e) => setNewRule({ ...newRule, id_parametro: e.target.value })}
                  className="px-4 py-3 rounded-xl text-sm font-bold cursor-pointer">
                  <option value="">Parametro...</option>
                  {allParams.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input type="number" placeholder="Range Min" value={newRule.range_min} onChange={(e) => setNewRule({ ...newRule, range_min: e.target.value })}
                  className="px-4 py-3 bg-slate-100 dark:bg-black/50 rounded-xl text-sm font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                <input type="number" placeholder="Range Max" value={newRule.range_max} onChange={(e) => setNewRule({ ...newRule, range_max: e.target.value })}
                  className="px-4 py-3 bg-slate-100 dark:bg-black/50 rounded-xl text-sm font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                <input type="number" placeholder="Punti Max" value={newRule.punti_max} onChange={(e) => setNewRule({ ...newRule, punti_max: e.target.value })}
                  className="px-4 py-3 bg-slate-100 dark:bg-black/50 rounded-xl text-sm font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                <button onClick={addRule} className="px-6 py-3 bg-brand-blue text-white rounded-xl font-black cursor-pointer border-none hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  <Plus size={16} /> Aggiungi
                </button>
              </div>
            </div>
            {serviceTypes.map((service) => {
              const rulesForService = allRules.filter((r) => r.id_tipo_service === service.id);
              if (rulesForService.length === 0) return null;
              return (
                <div key={service.id} className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow ml-2">{service.nome}</h3>
                  {rulesForService.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.08] rounded-2xl border border-slate-200 dark:border-white/20 shadow-sm">
                      {editingRule === rule.id ? (
                        <div className="flex gap-2 flex-1 items-center flex-wrap">
                          <span className="text-sm font-bold flex-1 truncate">{rule.parametri?.nome}</span>
                          <input type="number" value={editRuleData.range_min} onChange={(e) => setEditRuleData({ ...editRuleData, range_min: e.target.value })} className="w-20 px-3 py-2 bg-slate-100 dark:bg-black/50 rounded-xl text-xs font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                          <input type="number" value={editRuleData.range_max} onChange={(e) => setEditRuleData({ ...editRuleData, range_max: e.target.value })} className="w-20 px-3 py-2 bg-slate-100 dark:bg-black/50 rounded-xl text-xs font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                          <input type="number" value={editRuleData.punti_max} onChange={(e) => setEditRuleData({ ...editRuleData, punti_max: e.target.value })} className="w-20 px-3 py-2 bg-slate-100 dark:bg-black/50 rounded-xl text-xs font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                          <button onClick={() => updateRule(rule.id)} className="p-2 bg-green-600 text-white rounded-xl cursor-pointer border-none"><Save size={14} /></button>
                          <button onClick={() => setEditingRule(null)} className="p-2 bg-slate-500 text-white rounded-xl cursor-pointer border-none"><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="font-bold text-sm">{rule.parametri?.nome}</span>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Range: {rule.range_min} → {rule.range_max} · Max: {rule.punti_max} pt</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingRule(rule.id); setEditRuleData({ range_min: rule.range_min, range_max: rule.range_max, punti_max: rule.punti_max }); }} className="p-2 bg-slate-200 dark:bg-white/15 rounded-xl cursor-pointer border-none text-brand-blue dark:text-white"><Edit3 size={14} /></button>
                            <button onClick={() => deleteRule(rule.id)} className="p-2 bg-red-100 dark:bg-brand-red/25 rounded-xl cursor-pointer border-none text-brand-red"><Trash2 size={14} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* UTENTI */}
        {section === 'utenti' && (
          <div className="space-y-6">
            {/* Form creazione utente */}
            <div className="bg-white dark:bg-white/[0.08] p-6 rounded-[2rem] border border-slate-200 dark:border-white/20 shadow-sm space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">Nuovo Utente</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  className="px-4 py-3 bg-slate-100 dark:bg-black/50 rounded-xl text-sm font-bold outline-none text-brand-dark dark:text-white border border-slate-200 dark:border-white/20" />
                <select value={newRuolo} onChange={(e) => setNewRuolo(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm font-bold cursor-pointer">
                  <option value="referente">Referente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* Selezione club da associare */}
              {newRuolo !== 'admin' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Associa Club</div>
                  <div className="flex flex-wrap gap-2">
                    {allClubs.map((club) => {
                      const isSelected = newUserClubs.includes(club.id);
                      return (
                        <button key={club.id} onClick={() => toggleNewUserClub(club.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-none transition-all ${
                            isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                          }`}>
                          {isSelected ? <Link2 size={12} /> : <Unlink size={12} />}
                          {club.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button onClick={createUser}
                className="w-full px-6 py-3 bg-brand-blue text-white rounded-xl font-black cursor-pointer border-none hover:shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <Plus size={16} /> Crea Utente
              </button>
              {createdUserId && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="text-xs font-bold text-green-700 dark:text-green-400">
                    Utente creato! Per attivare l'account, l'utente deve registrarsi su <strong>/login → Crea Profilo</strong> con lo username <strong>"{newUsername || '...'}"</strong>.
                    Il profilo verrà collegato automaticamente.
                  </div>
                </div>
              )}
            </div>

            {/* Lista utenti */}
            {allUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-white/[0.08] rounded-[2rem] border border-slate-200 dark:border-white/20 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <div className="font-black text-lg">{u.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{u.id}</div>
                  </div>
                  <select value={u.ruolo || 'referente'} onChange={(e) => changeUserRole(u.id, e.target.value)}
                    className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer">
                    <option value="admin">Admin</option>
                    <option value="referente">Referente</option>
                  </select>
                </div>
                {u.ruolo !== 'admin' && (
                  <div className="px-6 pb-6 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Club associati</div>
                    <div className="flex flex-wrap gap-2">
                      {allClubs.map((club) => {
                        const isLinked = u.clubIds?.includes(club.id);
                        return (
                          <button key={club.id} onClick={() => toggleUserClub(u.id, club.id, isLinked)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-none transition-all ${
                              isLinked ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}>
                            {isLinked ? <Link2 size={12} /> : <Unlink size={12} />}
                            {club.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
