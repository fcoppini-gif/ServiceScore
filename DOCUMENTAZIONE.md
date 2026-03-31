# Documentazione Progetto: ServiceScore

## 1. Obiettivo del Progetto

Sviluppare **ServiceScore**, una Web App moderna e ottimizzata per dispositivi mobili, progettata per la rendicontazione, la valutazione e la classificazione dei progetti benefici ("Service") effettuati dai vari Lions Club. L'obiettivo è digitalizzare l'attuale processo basato su fogli di calcolo, fornendo ai Referenti di Zona uno strumento rapido e intuitivo per inserire i dati e generare classifiche in tempo reale.

**Scadenza Rilascio MVP:** 2 Aprile

---

## 2. Sistema di Ruoli

L'applicazione gestisce due tipi di utente:

| Ruolo | Cosa può fare |
|---|---|
| **Admin** | Vede classifica completa. Gestisce club, service, regole, utenti. Crea nuovi utenti. Carica logo per i club. |
| **Referente** | Vede classifica filtrata solo dei suoi club associati. Inserisce valutazioni solo per quelli. |

### Flusso utente Admin
1. Login → Dashboard (classifica completa) → pulsante "ADMIN"
2. Pannello Admin con 5 sezioni: Classifica, Club, Service, Regole, Utenti
3. Può creare utenti, associarli ai club, cambiarne il ruolo, caricare logo per i club

### Flusso utente Referente
1. Login → Dashboard (classifica solo dei suoi club)
2. "NUOVA ANALISI" → Wizard 3 step (solo i suoi club nella tendina)
3. Account per cambio password e avatar

---

## 3. Flusso Operativo (User Experience)

L'applicazione è una **Single Page Application (SPA)** con routing React Router:

| URL | Pagina | Chi |
|---|---|---|
| `/` | Redirect a installazione per nuovi visitatori | Non loggato |
| `/login` | Login/registrazione | Non loggato |
| `/dashboard` | Classifica club | Tutti (filtrata se referente) |
| `/insert` | Wizard inserimento 3 step | Tutti (solo club associati se referente) |
| `/success` | Conferma salvataggio | Tutti |
| `/account` | Password + avatar | Tutti |
| `/admin/classifica` | Classifica completa | Solo admin |
| `/admin/club` | Gestione club (CRUD + logo) | Solo admin |
| `/admin/service` | Gestione service (CRUD) | Solo admin |
| `/admin/regole` | Gestione regole calcolo | Solo admin |
| `/admin/utenti` | Gestione utenti + associazione club | Solo admin |

### Nuovi Visitatori
- Al primo accesso, l'utente viene reindirizzato automaticamente a `/installazione.html`
- Questa pagina mostra la guida per installare l'app sullo smartphone
- Dopo il primo login, l'utente non viene più reindirizzato

---

## 4. Logica di Valutazione Dinamica

Il cuore del sistema è un **motore algoritmico proporzionale**. Non esistono punteggi fissi: il "peso" di ogni azione cambia in base al tipo di Service svolto.

### Formula Universale

```
Punti Ottenuti = (Valutazione Inserita / Range Massimo) × Punti Massimi Previsti
```

### Test Cases di Validazione (esempio "Progetto Salvo")

| Parametro | Range | Punti Max | Esempio |
|---|---|---|---|
| Realizzazione Service | 0-1 | 10 | 1 → 10 pt |
| Originalità | 0-1 | 5 | 1 → 5 pt |
| Difficoltà organizzativa | 1-5 | 5 | 5 → 5 pt |
| Volontari coinvolti | 1-50 | 10 | 50 → 10 pt |
| ore di attività | 1-500 | 10 | 500 → 10 pt |
| Fondi raccolti | 0-20000 | 10 | 20000 → 10 pt |
| Persone servite | 1-500 | 10 | 500 → 10 pt |

---

## 5. Architettura Cloud e Hosting

### Frontend (Interfaccia Utente)
- **Framework**: React 19 + Vite 8
- **CSS**: Tailwind CSS v4 con tema brand 01Informatica
- **Routing**: React Router DOM
- **Animazioni**: tailwindcss-animate + animazioni CSS personalizzate
- **Hosting**: Vercel (deploy automatico da GitHub, HTTPS, dominio `servicescore.vercel.app`)

### Backend e Database
- **Piattaforma**: Supabase (PostgreSQL-as-a-Service)
- **Autenticazione**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (bucket `avatars` per foto profilo e loghi club)
- **Database**: PostgreSQL relazionale

---

## 6. Struttura Database (Supabase)

### Tabelle Principali

| Tabella | Descrizione |
|---|---|
| `utenti` | Profili utente (id, username, ruolo, avatar_url) — collegata a auth.users |
| `utenti_club` | Associazione utente ↔ club (id_utente, id_club) |
| `club` | Anagrafica Lions Club (id, nome, **logo_url**) |
| `tipi_service` | Tipologie di Service (id, nome) |
| `parametri` | Parametri valutabili (id, nome) |
| `regole_calcolo` | Service × Parametro × Range × Punti Max |

### Tabelle di Salvataggio

| Tabella | Descrizione |
|---|---|
| `service_inseriti` | Testata submission (id, id_utente, id_club, id_tipo_service, punteggio_totale) |
| `dettaglio_inserimenti` | Righe dettaglio (id, id_service_inserito, id_parametro, valore_dichiarato, punti_ottenuti) |

### Schema Relazionale

```
auth.users ──→ utenti ──→ utenti_club ←── club
                           │
                           └──→ service_inseriti ──→ dettaglio_inserimenti ←── parametri
                                                 │
                                                 └──→ regole_calcolo
                            tipi_service ───────────┘
```

### Trigger Database

```sql
-- Crea automaticamente profilo utente alla registrazione
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Storage

| Bucket | Descrizione |
|---|---|
| `avatars` | Foto profilo utenti + loghi club (public) |

---

## 7. Struttura del Codice

```
src/
├── lib/
│   ├── supabase.js          ← Client Supabase (connessione DB)
│   └── config.js            ← Costanti (logo, URL app)
├── components/
│   ├── BrandLogo.jsx        ← Logo ufficiale dell'app
│   ├── Footer.jsx           ← "Powered by 01Informatica"
│   ├── Navbar.jsx          ← Barra navigazione condivisa (link admin, menu utente)
│   ├── ProgressRing.jsx    ← Anello SVG punteggio animato
│   └── ThemeSwitcher.jsx   ← Toggle tema chiaro/scuro/sistema
├── hooks/
│   ├── useAuth.jsx         ← Gestisce auth + ruolo + club associati + refresh
│   └── useToast.jsx        ← Sistema notifiche toast
├── views/
│   ├── LoginView.jsx       ← Login/registrazione
│   ├── DashboardView.jsx   ← Classifica con logo club, barre progresso, animazioni
│   ├── InsertWizardView.jsx ← Wizard 3 step (solo club associati se referente)
│   ├── SuccessView.jsx     ← Pagina conferma con logo e animazioni
│   ├── AccountView.jsx     ← Cambio password + upload avatar
│   └── AdminView.jsx       ← Pannello admin (5 sezioni, upload logo club)
├── App.jsx                 ← Routing + tema + auth + redirect nuovi visitatori
├── main.jsx                ← Entry point React
└── index.css              ← Stili globali + tema brand + dark mode + select custom

public/
├── logo_ufficiale.png      ← Icona PWA / favicon
├── logo_01informatica_retina.png  ← Logo footer
├── manifest.json            ← Configurazione PWA
└── installazione.html       ← Guida installazione su smartphone (con logo)
```

### Come i file sono collegati

```
main.jsx
  └── App.jsx (useAuth + useToast + routing + tema + redirect visitatori)
        ├── LoginView        → supabase.auth
        ├── DashboardView   → Navbar + Footer → supabase (classifica + logo club)
        ├── InsertWizardView → Navbar + ProgressRing → supabase (regole + salvataggio)
        ├── SuccessView      → logo + animazioni → naviga a /dashboard
        ├── AccountView      → Navbar + Footer → supabase (password + storage avatar)
        └── AdminView       → Navbar + Footer → supabase (CRUD tutto + upload logo club)
```

---

## 8. Variabili d'Ambiente

Le credenziali Supabase sono in **variabili d'ambiente** (file `.env`):

```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_APP_URL=https://servicescore.vercel.app
```

- **In locale**: file `.env` nella root del progetto (escluso da Git)
- **Su Vercel**: Settings → Environment Variables

---

## 9. Query SQL Complete per Supabase

Tutte le query necessarie per configurare il database Supabase.

### 1. Aggiungi colonna logo_url alla tabella club

```sql
ALTER TABLE club ADD COLUMN logo_url TEXT;
```

### 2. Rimuovi vecchi collegamenti e crea quelli corretti

```sql
-- Rimuoviamo i vecchi collegamenti sbagliati che puntano a public.utenti
ALTER TABLE public.service_inseriti DROP CONSTRAINT service_inseriti_id_utente_fkey;
ALTER TABLE public.club DROP CONSTRAINT club_id_utente_referente_fkey;

-- Creiamo i collegamenti corretti alla tabella di sistema auth.users (quella vera!)
ALTER TABLE public.service_inseriti 
  ADD CONSTRAINT service_inseriti_id_utente_fkey 
  FOREIGN KEY (id_utente) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.club 
  ADD CONSTRAINT club_id_utente_referente_fkey 
  FOREIGN KEY (id_utente_referente) REFERENCES auth.users(id) ON DELETE SET NULL;
```

### 3. Abilita RLS su tutte le tabelle

```sql
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE club ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipi_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametri ENABLE ROW LEVEL SECURITY;
ALTER TABLE regole_calcolo ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inseriti ENABLE ROW LEVEL SECURITY;
ALTER TABLE dettaglio_inserimenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE utenti_club ENABLE ROW LEVEL SECURITY;
```

### 4. Crea le Policies per il Database

```sql
-- Club
CREATE POLICY "Modifica club" ON club FOR ALL USING (true) WITH CHECK (true);

-- Tipi Service
CREATE POLICY "Modifica tipi_service" ON tipi_service FOR ALL USING (true) WITH CHECK (true);

-- Parametri
CREATE POLICY "Modifica parametri" ON parametri FOR ALL USING (true) WITH CHECK (true);

-- Regole Calcolo
CREATE POLICY "Modifica regole_calcolo" ON regole_calcolo FOR ALL USING (true) WITH CHECK (true);

-- Utenti
CREATE POLICY "Modifica utenti" ON utenti FOR ALL USING (true) WITH CHECK (true);

-- Utenti-Club
CREATE POLICY "Modifica utenti_club" ON utenti_club FOR ALL USING (true) WITH CHECK (true);

-- Service Inseriti
CREATE POLICY "Modifica service_inseriti" ON service_inseriti FOR ALL USING (true) WITH CHECK (true);

-- Dettaglio Inserimenti
CREATE POLICY "Modifica dettaglio_inserimenti" ON dettaglio_inserimenti FOR ALL USING (true) WITH CHECK (true);
```

### 5. Policies per utenti_club

```sql
ALTER TABLE utenti_club ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lettura utenti_club" ON utenti_club FOR SELECT USING (true);
CREATE POLICY "Inserimento utenti_club" ON utenti_club FOR INSERT WITH CHECK (true);
CREATE POLICY "Cancellazione utenti_club" ON utenti_club FOR DELETE USING (true);
```

### 6. Trigger: creazione automatica utente alla registrazione

```sql
-- Trigger: quando un utente si registra su auth.users,
-- crea automaticamente il record nella tabella utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utenti (id, username, password_hash, ruolo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'nuovo_utente'), 'managed_by_supabase_auth', 'referente')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 7. Storage Policies per avatar

```sql
CREATE POLICY "Upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Leggi avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Aggiorna avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');
```

### 8. Imposta admin

```sql
-- Imposta gli utenti come admin (sostituisci con gli ID corretti)
UPDATE utenti SET ruolo = 'admin' WHERE id IN (
  '312ac17b-e24a-43d5-bdb0-40c4a6d9b4a3',
  'd980d1fb-b59f-4a32-b2e9-91f64411d9ba'
);
```

### 9. Flag "Obbligatorio" per parametri

```sql
-- Aggiunge la colonna obbligatorio alla tabella parametri
-- Se obbligatorio = true: il parametro deve essere compilato
-- Se obbligatorio = false: il parametro è opzionale (può essere lasciato a 0)
ALTER TABLE parametri ADD COLUMN obbligatorio BOOLEAN DEFAULT true;
```

Per modificare il flag:
```sql
-- Rendi opzionale un parametro
UPDATE parametri SET obbligatorio = false WHERE id = 1;

-- Rendi obbligatorio un parametro  
UPDATE parametri SET obbligatorio = true WHERE id = 1;
```

### Flusso creazione utente dall'admin

1. Admin crea profilo nella tabella `utenti` (UUID generato, username, ruolo)
2. Admin associa i club tramite `utenti_club`
3. L'utente va su `/login` → "Crea Profilo" → si registra con lo **stesso username**
4. Il trigger aggiorna l'ID del profilo con l'UUID reale di `auth.users`
5. Ora l'utente può fare login

---

## 10. Strumenti Extra

| File | Descrizione |
|---|---|
| `public/installazione.html` | Landing page per installare l'app su smartphone (con logo) |
| `genera-qr.js` | Genera QR code con colori brand (`npm run qr`) |
| `vercel.json` | Configurazione rewrite SPA per Vercel |

---

## 11. Flusso di Lavoro Quotidiano

### Sviluppo Locale

```bash
npm run dev          # Avvia server locale con hot-reload
```

### Deploy Online

```bash
git add .
git commit -m "messaggio descrittivo"
git push origin main    # Vercel fa deploy automatico
```

### Script Disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build produzione |
| `npm run preview` | Anteprima build |
| `npm run lint` | Controllo codice |
| `npm run qr` | Genera QR code |

---

## 12. Pannello Admin — Sezioni

### Classifica
Classifica completa di tutti i club senza filtri. Mostra logo del club se caricato.

### Club
- CRUD completo dei Lions Club (aggiungi, modifica nome, elimina)
- **Upload logo club**: click sull'icona del club per caricare un logo
- Il logo appare nella classifica e nella dashboard

### Service
- **Seleziona club**: tendina per scegliere un club
- **Service per club**: mostra tutti i service inseriti per il club selezionato (data, referente, punteggio)
- **Nuovo service**: pulsante per avviare il wizard di inserimento (con club pre-selezionato)
- **CRUD tipi service**: aggiungi, modifica, elimina tipi di service

### Regole
Gestione delle relazioni Service → Parametri → Range → Punti Max.
Ogni regola definisce: per un certo tipo service, un certo parametro ha range min/max e punti max.

### Utenti
- **Crea utente**: inserisce username + ruolo nella tabella utenti
- **Associa club alla creazione**: seleziona i club da associare PRIMA di creare l'utente
- **cambia ruolo**: admin ↔ referente
- **Associa/scollega club**: toggle su ogni utente esistente
- L'utente creato dall'admin deve poi registrarsi (Crea Profilo) per attivare l'accesso

---

## 13. Tema e Dark Mode

### Modalità Tema
- **3 modalità**: Chiaro, Scuro, Sistema (SEGUI le preferenze del dispositivo)
- **Persistenza**: la scelta viene salvata in localStorage
- **Alto contrasto dark mode**: sfondo `#060D1F`, testo bianco, bordi visibili, input leggibili
- **Toggle**: disponibile in tutte le pagine (navbar)

### Select Custom
- Select con freccia SVG integrata (blu in light, giallo in dark)
- Effetto hover con shadow e border color
- Focus con glow
- Options con gradiente animato su hover
- Stile specifico per light e dark mode

---

## 14. Dashboard — Classifica

### Funzionalità
- **Ranking Live**: classifica aggiornata in tempo reale
- **Logo Club**: se caricato, il logo appare al posto del numero di posizione
- **Barre di progresso**: mostrano visivamente il punteggio rispetto al leader
- **Primi 3 posti**: 👑🥈🥉 con icone speciali
- **Primo posto**: sfondo dorato con glow giallo
- **Animazioni**: le righe entrano con slide-up
- **Glassmorphism**: effetto moderno sulle card

---

## 15. Pagina Successo (/success)

### Elementi
- Logo dell'app (animato con bounce)
- Scritta "MISSIONE COMPLETATA" con animazione bounce sul testo giallo
- Pulsante "CLASSIFICA" con gradiente brand e animazioni

---

## 16. Installazione App

### Flusso automatico
1. Nuovo visitatore accede a `/`
2. Viene reindirizzato a `/installazione.html`
3. La pagina mostra la guida per installare l'app
4. Dopo il primo login, l'utente non viene più reindirizzato

### Pagina installazione.html
- Logo ServiceScore
- Istruzioni specifiche per iOS (iPhone)
- Pulsante installa per Android (se supportato)
- Pulsante "Apri nel Browser" come fallback

---

## 17. Sicurezza

- **Autenticazione**: Supabase Auth (email/password)
- **Row Level Security (RLS)**: configurata su Supabase per controllare l'accesso ai dati
- **Credenziali**: variabili d'ambiente, non nel codice sorgente
- **HTTPS**: certificato SSL gratuito fornito da Vercel
- **Storage**: bucket `avatars` public con policies per upload/lettura
