# Documentazione Progetto: ServiceScore

## 1. Obiettivo del Progetto

Sviluppare **ServiceScore**, una Web App moderna e ottimizzata per dispositivi mobili, progettata per la rendicontazione, la valutazione e la classificazione dei progetti benefici ("Service") effettuati dai vari Lions Club. L'obiettivo è digitalizzare l'attuale processo basato su fogli di calcolo, fornendo ai Referenti di Zona uno strumento rapido e intuitivo per inserire i dati e generare classifiche in tempo reale.

**Scadenza Rilascio MVP:** 2 Aprile

---

## 2. Flusso Operativo (User Experience)

L'applicazione è una **Single Page Application (SPA)** con routing React Router:

1. **Login** (`/login`): Accesso riservato con email/password tramite Supabase Auth. Supporta anche la registrazione con conferma email.

2. **Dashboard** (`/dashboard`): Visualizzazione immediata della **Classifica Generale** dei Club in base ai punti accumulati. Pulsante "NUOVA ANALISI" per avviare il wizard.

3. **Wizard di Inserimento Dati** (`/insert`): Un percorso guidato in 3 step:
   - **Step 1**: Selezione del Club e del Tipo di Service (es. "Progetto Salvo", "Conferenza").
   - **Step 2**: Compilazione dei risultati (es. Volontari coinvolti, Fondi raccolti). L'interfaccia si adatta dinamicamente mostrando solo i parametri pertinenti applicando limiti automatici per evitare errori di battitura.
   - **Step 3**: Riepilogo con calcolo in tempo reale dei punti guadagnati. Conferma e salvataggio.

4. **Successo** (`/success`): Conferma animata dopo il salvataggio riuscito.

---

## 3. Logica di Valutazione Dinamica

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

## 4. Architettura Cloud e Hosting (Zero Costi)

### Frontend (Interfaccia Utente)
- **Framework**: React 19 + Vite 8
- **CSS**: Tailwind CSS v4 con tema brand personalizzato
- **Hosting**: Vercel (deploy automatico da GitHub, HTTPS, dominio gratuito `servicescore.vercel.app`)

### Backend e Database
- **Piattaforma**: Supabase (PostgreSQL-as-a-Service)
- **Autenticazione**: Supabase Auth (email/password)
- **Database**: PostgreSQL relazionale con 7 tabelle

---

## 5. Struttura Database (Supabase)

Il database è composto da **7 tabelle relazionali**:

### Tabelle Principali

| Tabella | Descrizione |
|---|---|
| `club` | Anagrafica dei Lions Club (id, nome) |
| `tipi_service` | Tipologie di Service (id, nome) |
| `parametri` | Parametri valutabili (id, nome) |
| `regole_calcolo` | **Tabella "Magica"**: mappa incrocio Tipo Service × Parametro × Range × Punti Max (id, id_tipo_service, id_parametro, range_min, range_max, punti_max) |

### Tabelle di Salvataggio

| Tabella | Descrizione |
|---|---|
| `service_inseriti` | Testata delle submission (id, id_club, id_tipo_service, punteggio_totale) |
| `dettaglio_inserimenti` | Righe di dettaglio (id, id_service_inserito, id_parametro, valore_dichiarato, punti_ottenuti) |

### Schema Relazionale

```
club ─────┐
           ├──→ service_inseriti ──→ dettaglio_inserimenti ←── parametri
tipi_service┘         │
                      └──→ regole_calcolo (per validazione e calcolo)
```

---

## 6. Struttura del Codice

```
src/
├── lib/
│   ├── supabase.js          ← Client Supabase (connessione DB)
│   └── config.js            ← Costanti (logo, URL app)
├── components/
│   ├── BrandLogo.jsx        ← Logo 01Informatica
│   ├── ProgressRing.jsx     ← Anello SVG punteggio animato
│   └── ThemeSwitcher.jsx    ← Toggle tema chiaro/scuro/sistema
├── hooks/
│   └── useToast.jsx         ← Sistema notifiche toast
├── views/
│   ├── LoginView.jsx        ← Pagina login/registrazione
│   ├── DashboardView.jsx    ← Classifica club
│   ├── InsertWizardView.jsx ← Wizard 3 step inserimento dati
│   └── SuccessView.jsx      ← Conferma salvataggio
├── App.jsx                  ← Routing + tema + autenticazione
├── main.jsx                 ← Entry point React
└── index.css                ← Stili globali + tema brand

public/
├── favicon.svg              ← Icona PWA (scudo SS)
├── manifest.json            ← Configurazione PWA
├── logo_01informatica_retina.png
└── installazione.html       ← Guida installazione su smartphone
```

### Come i file sono collegati

```
main.jsx
  └── App.jsx (routing + tema + auth)
        ├── LoginView.jsx     → usa supabase.js per auth
        ├── DashboardView.jsx → usa supabase.js per leggere classifica
        │                     → usa BrandLogo.jsx
        ├── InsertWizardView.jsx → usa supabase.js per leggere regole e scrivere dati
        │                        → usa ProgressRing.jsx
        │                        → usa useToast.jsx per errori
        └── SuccessView.jsx   → naviga a /dashboard
```

---

## 7. Architettura Cloud e Variabili d'Ambiente

### Configurazione Credenziali

Le credenziali Supabase sono in **variabili d'ambiente** (file `.env`):

```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_APP_URL=https://servicescore.vercel.app
```

- **In locale**: file `.env` nella root del progetto (escluso da Git)
- **Su Vercel**: Settings → Environment Variables nella dashboard

---

## 8. Strumenti Extra

| File | Descrizione |
|---|---|
| `public/installazione.html` | Landing page per installare l'app su smartphone (Android/iOS) |
| `genera-qr.js` | Genera QR code con colori brand 01Informatica (`npm run qr`) |
| `vercel.json` | Configurazione rewrite SPA per Vercel |

---

## 9. Flusso di Lavoro Quotidiano

### Sviluppo Locale

```bash
npm run dev          # Avvia server locale con hot-reload
```

Aprire http://localhost:5173 per vedere le modifiche in diretta.

### Deploy Online

```bash
git add .                          # Prepara le modifiche
git commit -m "messaggio descrittivo"   # Impacchetta
git push origin main               # Invia → Vercel fa deploy automatico
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

## 10. Sicurezza

- **Autenticazione**: gestita da Supabase Auth (email/password)
- **Row Level Security (RLS)**: configurata su Supabase per controllare l'accesso ai dati
- **Zero Admin Panel**: nessun pannello web vulnerabile. Le regole e i dati vengono gestiti dal team di sviluppo tramite il pannello sicuro di Supabase
- **Credenziali**: memorizzate come variabili d'ambiente, non nel codice sorgente
- **HTTPS**: certificato SSL gratuito fornito da Vercel
