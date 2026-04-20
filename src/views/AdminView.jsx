// =============================================================================
// ADMIN SEMPLICE - Solo gestione utenti
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Plus, Trash2, Edit3, Save, X, Link2, Unlink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminView({ userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const { section = 'utenti' } = useParams();

  const [allUsers, setAllUsers] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newRuolo, setNewRuolo] = useState('referente');
  const [newUserClubs, setNewUserClubs] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(null);

  const tabs = [
    { id: 'utenti', label: 'Utenti', icon: Users },
  ];

  useEffect(() => {
    if (section === 'utenti') fetchUsers();
  }, [section]);

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

  const toggleNewUserClub = (clubId) => {
    setNewUserClubs((prev) => prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]);
  };

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

  const createUser = async () => {
    if (!newUsername.trim()) { toast.error('Inserisci username'); return; }
    try {
      const newId = crypto.randomUUID();
      const { error } = await supabase.from('utenti').insert({
        id: newId,
        username: newUsername.trim(),
        password_hash: 'managed_by_supabase_auth',
        ruolo: newRuolo,
      });
      if (error) { toast.error(error.message); return; }
      
      toast.success(`Utente "${newUsername}" creato`);
      setCreatedUserId(newId);
      
      for (const clubId of newUserClubs) {
        await supabase.from('utenti_club').upsert({ id_utente: newId, id_club: clubId }, { onConflict: 'id_utente,id_club' });
      }
      
      setNewUsername('');
      setNewRuolo('referente');
      setNewUserClubs([]);
      fetchUsers();
    } catch { toast.error('Errore creazione'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] aurora-bg">
      <Navbar isAdmin={true} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-24 space-y-8 text-brand-dark dark:text-white">
        <h1 className="text-3xl sm:text-4xl font-black uppercase">Amministrazione</h1>

        <div className="flex gap-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => navigate(`/admin/${tab.id}`)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase transition-all cursor-pointer border-none whitespace-nowrap ${
                section === tab.id ? 'bg-brand-blue text-white shadow-lg' : 'bg-white dark:bg-white/[0.03] text-slate-500'
              }`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* UTENTI */}
        {section === 'utenti' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/[0.08] p-6 rounded-[2rem] border border-slate-200 dark:border-white/20 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Nuovo Utente</div>
              <div className="flex gap-3">
                <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-black/50 rounded-xl font-bold outline-none" />
                <select value={newRuolo} onChange={(e) => setNewRuolo(e.target.value)}
                  className="px-4 py-3 rounded-xl font-bold cursor-pointer">
                  <option value="referente">Referente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {newRuolo !== 'admin' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-500">Associa Club</div>
                  <div className="flex flex-wrap gap-2">
                    {allClubs.map((club) => {
                      const isSelected = newUserClubs.includes(club.id);
                      return (
                        <button key={club.id} onClick={() => toggleNewUserClub(club.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-all ${
                            isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/10'
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
                className="w-full px-6 py-3 bg-brand-blue text-white rounded-xl font-black cursor-pointer border-none hover:shadow-xl">
                <Plus size={16} /> Crea Utente
              </button>
            </div>

            {allUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-white/[0.08] p-5 rounded-2xl border border-slate-200 dark:border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-black text-lg">{u.username}</div>
                    <div className="text-xs text-slate-500">{u.id}</div>
                  </div>
                  <select value={u.ruolo || 'referente'} onChange={(e) => changeUserRole(u.id, e.target.value)}
                    className="px-4 py-2 rounded-xl font-bold cursor-pointer">
                    <option value="admin">Admin</option>
                    <option value="referente">Referente</option>
                  </select>
                </div>
                {u.ruolo !== 'admin' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
                    <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Club</div>
                    <div className="flex flex-wrap gap-2">
                      {allClubs.map((club) => {
                        const isLinked = u.clubIds?.includes(club.id);
                        return (
                          <button key={club.id} onClick={() => toggleUserClub(u.id, club.id, isLinked)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border-none ${
                              isLinked ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/10'
                            }`}>
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