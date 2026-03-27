// =============================================================================
// HOOK: useAuth - Gestisce stato utente, ruolo e club associati
// =============================================================================
// Dopo il login con Supabase Auth, questo hook:
// 1. Legge il profilo utente dalla tabella 'utenti' (ruolo, username)
// 2. Se referente: legge i club associati dalla tabella 'utenti_club'
// 3. Espone: user, isAdmin, userClubs, loading, refresh
//
// COLLEGAMENTI:
// - Usato in App.jsx per decidere quali route mostrare
// - Usato in DashboardView per filtrare la classifica
// - Usato in InsertWizardView per filtrare i club
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setUserClubs([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        console.error('Errore caricamento profilo:', profileErr);
        setLoading(false);
        return;
      }

      setUserProfile(profile);

      if (profile && profile.ruolo !== 'admin') {
        const { data: clubs, error: clubsErr } = await supabase
          .from('utenti_club')
          .select('id_club')
          .eq('id_utente', userId);

        if (clubsErr) {
          console.error('Errore caricamento club:', clubsErr);
        } else {
          setUserClubs(clubs?.map((c) => c.id_club) || []);
        }
      } else {
        setUserClubs([]);
      }
    } catch (err) {
      console.error('Errore caricamento profilo:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.ruolo === 'admin';

  return {
    user,
    userProfile,
    isAdmin,
    userClubs,
    loading,
    refresh: () => user && loadUserProfile(user.id),
  };
}
