// =============================================================================
// INVITE VIEW - Admin sends invites to members
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, User, Users, Search, Copy, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function InviteView({ isAdmin, userProfile, ThemeSwitcher, toast }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);

  useEffect(() => {
    if (isAdmin) fetchMembers();
    else navigate('/dashboard');
  }, [isAdmin]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('soci')
      .select('id, nome, cognome, titolo, email_personal, club_name, categoria')
      .order('cognome');
    setMembers(data || []);
    setLoading(false);
  };

  const toggleMember = (member) => {
    const exists = selectedMembers.find(m => m.id === member.id);
    if (exists) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const selectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers);
    }
  };

  const generateInviteLink = (member) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?matricula=${member.matricola || ''}&email=${encodeURIComponent(member.email_personal || '')}`;
  };

  const sendInvites = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Seleziona almeno un membro');
      return;
    }

    const membersWithEmail = selectedMembers.filter(m => m.email_personal);
    if (membersWithEmail.length === 0) {
      toast.error('Nessun membro con email selezionato');
      return;
    }

    setSending(true);
    const sent = [];

    for (const member of membersWithEmail) {
      const inviteLink = generateInviteLink(member);
      const name = `${member.titolo || ''} ${member.nome} ${member.cognome}`.trim();
      
      sent.push({
        email: member.email_personal,
        name: name,
        club: member.club_name,
        link: inviteLink
      });
    }

    setSentEmails(sent);
    setSending(false);
    toast.success(`${sent.length} inviti pronti!`);
  };

  const filteredMembers = members.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.nome?.toLowerCase().includes(term) ||
      m.cognome?.toLowerCase().includes(term) ||
      m.club_name?.toLowerCase().includes(term) ||
      m.email_personal?.toLowerCase().includes(term)
    );
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato!');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-black mb-4">Accesso Negato</h1>
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
      
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-red rounded-2xl flex items-center justify-center">
            <Mail className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase">Invita Soci</h1>
            <p className="text-slate-500 text-sm">Invia inviti di registrazione ai membri</p>
          </div>
        </motion.div>

        {/* Selected Summary */}
        {selectedMembers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-brand-blue/10 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
                {selectedMembers.length}
              </div>
              <div>
                <div className="font-bold">Membri selezionati</div>
                <div className="text-sm text-slate-500">
                  {selectedMembers.filter(m => m.email_personal).length} con email
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendInvites}
              disabled={sending}
              className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold flex items-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
              Invia Inviti
            </motion.button>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cerca per nome, cognome, email o club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
          />
        </div>

        {/* Members List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-brand-dark rounded-2xl overflow-hidden shadow-xl"
        >
          {/* Header Row */}
          <div className="p-4 bg-slate-100 dark:bg-white/5 flex items-center gap-4 border-b border-slate-200 dark:border-white/10">
            <button
              onClick={selectAll}
              className="w-6 h-6 rounded border-2 border-slate-300 flex items-center justify-center"
            >
              {selectedMembers.length === filteredMembers.length && filteredMembers.length > 0 && (
                <div className="w-3 h-3 bg-brand-blue rounded-sm"></div>
              )}
              {selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length && (
                <div className="w-3 h-3 bg-brand-blue/50 rounded-sm"></div>
              )}
            </button>
            <span className="text-sm font-bold">Seleziona tutti ({filteredMembers.length})</span>
          </div>

          {/* List */}
          <div className="max-h-[500px] overflow-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nessun membro trovato</div>
            ) : (
              filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className="p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-4"
                >
                  <button
                    onClick={() => toggleMember(member)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedMembers.find(m => m.id === member.id)
                        ? 'bg-brand-blue border-brand-blue'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedMembers.find(m => m.id === member.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">
                      {member.titolo} {member.nome} {member.cognome}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Users size={12} />
                      {member.club_name}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {member.email_personal ? (
                      <div className="text-sm text-emerald-600 font-medium">
                        {member.email_personal}
                      </div>
                    ) : (
                      <div className="text-sm text-red-400">Senza email</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Sent Emails Panel */}
        <AnimatePresence>
          {sentEmails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-brand-dark rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Email pronte da inviare</h3>
                <button onClick={() => setSentEmails([])} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-auto">
                {sentEmails.map((email, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <div>
                      <div className="font-medium">{email.name}</div>
                      <div className="text-sm text-slate-500">{email.email}</div>
                    </div>
                    <div className="text-sm text-emerald-600 font-medium">
                      {email.club}
                    </div>
                  </div>
                ))}
              </div>

              </motion.div>
          )}
        </AnimatePresence>

      </div>

      <Footer />
    </div>
  );
}