// =============================================================================
// HOOK: useAuth - Gestisce stato utente, ruolo e club associati
// =============================================================================
// Dopo il login con Supabase Auth, questo hook:
// 1. Legge il profilo utente dalla tabella 'utenti' (ruolo, username)
// 2. Se referente: legge i club associati dalla tabella 'utenti_club'
// 3. Espone: user, isAdmin, userClubs, loading
//
// UTILIZZO:
//   const { user, isAdmin, userClubs, loading } = useAuth();
//   if (isAdmin) { /* mostra pannello admin */ }
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
    // Carica la sessione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listener per cambiamenti auth
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

  // ===========================================================================
  // loadUserProfile: Legge il profilo da 'utenti' e i club associati
  // ===========================================================================
  const loadUserProfile = async (userId) => {
    try {
      // Leggi il profilo utente (ruolo, username)
      const { data: profile } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .single();

      setUserProfile(profile);

      // Se non è admin, carica i club associati
      if (profile && profile.ruolo !== 'admin') {
        const { data: clubs } = await supabase
          .from('utenti_club')
          .select('id_club')
          .eq('id_utente', userId);

        setUserClubs(clubs?.map((c) => c.id_club) || []);
      }
    } catch (err) {
      console.error('Errore caricamento profilo:', err);
    } finally {
      setLoading(false);
    }
  };

  // isAdmin: true se il ruolo è 'admin'
  const isAdmin = userProfile?.ruolo === 'admin';

  return {
    user,
    userProfile,
    isAdmin,
    userClubs,
    loading,
    // refresh: ricarica il profilo (dopo cambio password, avatar, ecc.)
    refresh: () => user && loadUserProfile(user.id),
  };
}
