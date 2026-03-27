# Documentazione Progetto: ServiceScore

## 1. Obiettivo del Progetto

Sviluppare **ServiceScore**, una Web App moderna e ottimizzata per dispositivi mobili, progettata per la rendicontazione, la valutazione e la classificazione dei progetti benefici ("Service") effettuati dai vari Lions Club. L'obiettivo è digitalizzare l'attuale processo basato su fogli di calcolo, fornendo ai Referenti di Zona uno strumento rapido e intuitivo per inserire i dati e generare classifiche in tempo reale.

**Scadenza Rilascio MVP:** 2 Aprile

---

## 2. Sistema di Ruoli

L'applicazione gestisce due tipi di utente:

| Ruolo | Cosa può fare |
|---|---|
| **Admin** | Vede classifica completa. Gestisce club, service, regole, utenti. Crea nuovi utenti. |
| **Referente** | Vede classifica filtrata solo dei suoi club associati. Inserisce valutazioni solo per quelli. |

### Flusso utente Admin
1. Login → Dashboard (classifica completa) → pulsante "ADMIN"
2. Pannello Admin con 5 sezioni: Classifica, Club, Service, Regole, Utenti
3. Può creare utenti, associarli ai club, cambiarne il ruolo

### Flusso utente Referente
1. Login → Dashboard (classifica solo dei suoi club)
2. "NUOVA ANALISI" → Wizard 3 step (solo i suoi club nella tendina)
3. Account per cambio password e avatar

---

## 3. Flusso Operativo (User Experience)

L'applicazione è una **Single Page Application (SPA)** con routing React Router:

| URL | Pagina | Chi |
|---|---|---|
| `/login` | Login/registrazione | Non loggato |
| `/dashboard` | Classifica club | Tutti (filtrata se referente) |
| `/insert` | Wizard inserimento 3 step | Tutti (solo club associati se referente) |
| `/success` | Conferma salvataggio | Tutti |
| `/account` | Password + avatar | Tutti |
| `/admin/classifica` | Classifica completa | Solo admin |
| `/admin/club` | Gestione club (CRUD) | Solo admin |
| `/admin/service` | Gestione service (CRUD) | Solo admin |
| `/admin/regole` | Gestione regole calcolo | Solo admin |
| `/admin/utenti` | Gestione utenti + associazione club | Solo admin |

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
| Ore di attività | 1-500 | 10 | 500 → 10 pt |
| Fondi raccolti | 0-20000 | 10 | 20000 → 10 pt |
| Persone servite | 1-500 | 10 | 500 → 10 pt |

---

## 5. Architettura Cloud e Hosting

### Frontend (Interfaccia Utente)
- **Framework**: React 19 + Vite 8
- **CSS**: Tailwind CSS v4 con tema brand 01Informatica
- **Routing**: React Router DOM
- **Animazioni**: tailwindcss-animate
- **Hosting**: Vercel (deploy automatico da GitHub, HTTPS, dominio `servicescore.vercel.app`)

### Backend e Database
- **Piattaforma**: Supabase (PostgreSQL-as-a-Service)
- **Autenticazione**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (bucket `avatars` per foto profilo)
- **Database**: PostgreSQL relazionale

---

## 6. Struttura Database (Supabase)

### Tabelle Principali

| Tabella | Descrizione |
|---|---|
| `utenti` | Profili utente (id, username, ruolo, avatar_url) — collegata a auth.users |
| `utenti_club` | Associazione utente ↔ club (id_utente, id_club) |
| `club` | Anagrafica Lions Club (id, nome) |
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
| `avatars` | Foto profilo utenti (public) |

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
│   ├── Navbar.jsx           ← Barra navigazione condivisa (link admin, menu utente)
│   ├── ProgressRing.jsx     ← Anello SVG punteggio animato
│   └── ThemeSwitcher.jsx    ← Toggle tema chiaro/scuro/sistema
├── hooks/
│   ├── useAuth.jsx          ← Gestisce auth + ruolo + club associati + refresh
│   └── useToast.jsx         ← Sistema notifiche toast
├── views/
│   ├── LoginView.jsx        ← Login/registrazione
│   ├── DashboardView.jsx    ← Classifica (filtrata per referente, completa per admin)
│   ├── InsertWizardView.jsx ← Wizard 3 step (solo club associati se referente)
│   ├── SuccessView.jsx      ← Conferma salvataggio
│   ├── AccountView.jsx      ← Cambio password + upload avatar
│   └── AdminView.jsx        ← Pannello admin (5 sezioni)
├── App.jsx                  ← Routing + tema + auth
├── main.jsx                 ← Entry point React
└── index.css                ← Stili globali + tema brand + dark mode alto contrasto

public/
├── logo_ufficiale.png       ← Icona PWA / favicon
├── logo_01informatica_retina.png  ← Logo footer
├── manifest.json            ← Configurazione PWA
└── installazione.html       ← Guida installazione su smartphone
```

### Come i file sono collegati

```
main.jsx
  └── App.jsx (useAuth + useToast + routing + tema)
        ├── LoginView        → supabase.auth
        ├── DashboardView    → Navbar + Footer → supabase (classifica)
        ├── InsertWizardView → Navbar + ProgressRing → supabase (regole + salvataggio)
        ├── SuccessView      → naviga a /dashboard
        ├── AccountView      → Navbar + Footer → supabase (password + storage avatar)
        └── AdminView        → Navbar + Footer → supabase (CRUD tutto)
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

## 9. Strumenti Extra

| File | Descrizione |
|---|---|
| `public/installazione.html` | Landing page per installare l'app su smartphone |
| `genera-qr.js` | Genera QR code con colori brand (`npm run qr`) |
| `vercel.json` | Configurazione rewrite SPA per Vercel |

---

## 10. Flusso di Lavoro Quotidiano

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

## 11. Pannello Admin — Sezioni

### Classifica
Classifica completa di tutti i club senza filtri.

### Club
CRUD completo dei Lions Club (aggiungi, modifica nome, elimina).

### Service
CRUD dei tipi di Service (aggiungi, modifica nome, elimina).

### Regole
Gestione delle relazioni Service → Parametri → Range → Punti Max.
Ogni regola definisce: per un certo tipo service, un certo parametro ha range min/max e punti max.

### Utenti
- **Crea utente**: inserisce username + ruolo nella tabella utenti
- **Cambia ruolo**: admin ↔ referente
- **Associa club**: toggle per collegare/scollegare un referente ai club
- L'utente creato dall'admin deve poi registrarsi da solo (Crea Profilo) per ottenere le credenziali

---

## 12. Tema e Dark Mode

- **3 modalità**: Chiaro, Scuro, Sistema (segue le preferenze del dispositivo)
- **Persistenza**: la scelta viene salvata in localStorage
- **Alto contrasto dark mode**: sfondo `#060D1F`, testo bianco, bordi visibili, input leggibili
- **Toggle**: disponibile in tutte le pagine (navbar)

---

## 13. Sicurezza

- **Autenticazione**: Supabase Auth (email/password)
- **Row Level Security (RLS)**: configurata su Supabase per controllare l'accesso ai dati
- **Credenziali**: variabili d'ambiente, non nel codice sorgente
- **HTTPS**: certificato SSL gratuito fornito da Vercel
- **Storage**: bucket `avatars` public con policies per upload/lettura
