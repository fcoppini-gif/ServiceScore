# ServiceScore - Relazione Tecnica per Programmatori

## Panoramica del Progetto

**ServiceScore** è una Single Page Application (SPA) sviluppata con React 19 e Vite 8, che gestisce la rendicontazione dei service dei Lions Club italiani.

---

## Stack Tecnologico

### Frontend
| Tecnologia | Versione | Descrizione |
|------------|----------|-------------|
| React | 19 | Framework UI |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS | 4.x | Framework CSS |
| React Router DOM | 7.x | Routing |
| Lucide React | - | Icone SVG |
| Supabase JS | 2.x | Client database |
| Recharts | 2.x | Grafici statistiche |
| jsPDF | 2.x | Esportazione PDF |
| VitePWA | 0.21 | Service worker offline |

### Backend
| Servizio | Descrizione |
|----------|-------------|
| Supabase | Database PostgreSQL + Auth + Storage |
| Vercel | Hosting e deployment automatico |

---

## Struttura del Progetto

```
ServiceScore/
├── src/
│   ├── components/       # Componenti React riutilizzabili
│   │   ├── BrandLogo.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProgressRing.jsx
│   │   └── ThemeSwitcher.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.jsx  # Gestione autenticazione
│   │   └── useToast.jsx # Sistema notifiche
│   ├── lib/
│   │   ├── supabase.js  # Client Supabase
│   │   └── i18n.jsx     # Sistema internazionalizzazione
│   ├── views/           # Pagine dell'app
│   │   ├── AdminView.jsx
│   │   ├── DashboardView.jsx
│   │   ├── InsertWizardView.jsx
│   │   ├── LoginView.jsx
│   │   ├── SuccessView.jsx
│   │   └── AccountView.jsx
│   ├── App.jsx          # Componente principale + routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Stili globali
├── public/
│   ├── logo_ufficiale.png
│   ├── manifest.json    # Configurazione PWA
│   ├── installazione.html
│   ├── privacy.html
│   ├── termini.html
│   ├── contratto.html
│   ├── offline.html
│   ├── sw.js           # Service worker
│   └── genera-qr.js
├── package.json
├── vite.config.js
└── DOCUMENTAZIONE.md
```

---

## Database Supabase

### Schema ER

```
auth.users (sistema)
    │
    └── id (UUID, PK)
    
public.utenti
    ├── id (UUID, FK → auth.users.id)
    ├── username (text)
    ├── ruolo (text: 'admin' | 'referente')
    └── avatar_url (text)

public.club
    ├── id (int, PK)
    ├── nome (text)
    ├── logo_url (text)
    └── id_utente_referente (UUID, FK → auth.users.id)

public.utenti_club
    ├── id_utente (UUID, FK → auth.users.id)
    └── id_club (int, FK → club.id)

public.tipi_service
    ├── id (int, PK)
    └── nome (text)

public.parametri
    ├── id (int, PK)
    ├── nome (text)
    └── obbligatorio (boolean) ← NUOVO

public.regole_calcolo
    ├── id (int, PK)
    ├── id_tipo_service (int, FK → tipi_service.id)
    ├── id_parametro (int, FK → parametri.id)
    ├── range_min (int)
    ├── range_max (int)
    └── punti_max (int)

public.service_inseriti
    ├── id (int, PK)
    ├── id_utente (UUID, FK → auth.users.id)
    ├── id_club (int, FK → club.id)
    ├── id_tipo_service (int, FK → tipi_service.id)
    ├── punteggio_totale (float)
    └── data_inserimento (timestamp)

public.dettaglio_inserimenti
    ├── id (int, PK)
    ├── id_service_inserito (int, FK → service_inseriti.id)
    ├── id_parametro (int, FK → parametri.id)
    ├── valore_dichiarato (int)
    └── punti_ottenuti (float)
```

### Query SQL Utili

```sql
-- Aggiungi colonna obbligatorio ai parametri
ALTER TABLE parametri ADD COLUMN obbligatorio BOOLEAN DEFAULT true;

-- Rendi opzionale un parametro
UPDATE parametri SET obbligatorio = false WHERE id = 1;
```

---

## Autenticazione

### Flow Autenticazione

1. **Registrazione**: utente inserisce email/password + username
2. **Supabase Auth**: crea record in `auth.users`
3. **Trigger**: `handle_new_user()` crea record in `public.utenti`
4. **Login**: sessione JWT gestita da Supabase

### Ruoli

| Ruolo | Permessi |
|-------|----------|
| `admin` | CRUD completo su tutte le tabelle, gestione utenti, statistiche |
| `referente` | Solo i propri club, inserimento service |

---

## Calcolo Punteggio

### Formula

```
punti = (valore_inserito / range_max) * punti_max
```

### Logica Parametri Opzionali

- Se `obbligatorio = true`: il parametro deve essere compilato
- Se `obbligatorio = false`: il parametro è opzionale, se lasciato a 0 non viene calcolato nel punteggio totale
- Il punteggio massimo possibile (`maxPossibleScore`) viene calcolato solo sui parametri obbligatori

---

## Nuove Funzionalità Implementate

### 1. PDF Export Classifica
- **File**: `DashboardView.jsx`
- **Libreria**: jsPDF + jspdf-autotable
- **Funzione**: `exportPDF()` genera PDF con tabella ranking

### 2. Ricerca Classifica
- **File**: `DashboardView.jsx`
- **Stato**: `searchTerm` con filtro `filter()` su leaderboard

### 3. Filtro Anno Service
- **File**: `AdminView.jsx` (sezione Service)
- **Stato**: `selectedYear` passato alla query Supabase

### 4. Statistiche Dettagliate
- **File**: `AdminView.jsx` (nuova sezione "Statistiche")
- **Libreria**: Recharts (BarChart, PieChart)
- **Dati**: trend mensile, distribuzione per tipologia, top club

### 5. Backup Dati
- **File**: `AccountView.jsx`
- **Funzione**: `handleBackup()` scarica JSON con tutti i service

### 6. Multi-Language (i18n)
- **File**: `src/lib/i18n.jsx`
- **Provider**: `I18nProvider` in App.jsx
- **Toggle**: bottone nella Navbar
- **Lingue**: Italiano (default), Inglese

### 7. PWA Offline
- **Configurazione**: `vite.config.js` con `vite-plugin-pwa`
- **Service Worker**: `public/sw.js`
- **Offline Page**: `public/offline.html`
- **Cache**: Workbox con precaching

### 8. Parametri Opzionali
- **Frontend**: InsertWizardView gestisce logica
- **Admin**: AdminView permite toggle obbligatorio/opzionale

---

## API e Query

### Query Principali

```javascript
// Fetch classifica con logo
supabase
  .from('service_inseriti')
  .select('punteggio_totale, id_club, club(nome, logo_url)')

// Fetch regole per service
supabase
  .from('regole_calcolo')
  .select('*, tipi_service(nome), parametri(nome)')
  .eq('id_tipo_service', serviceId)

// Fetch parametri con obbligatorio
supabase
  .from('parametri')
  .select('*')

// Service con filtro anno
supabase
  .from('service_inseriti')
  .select('*, tipi_service(nome)')
  .eq('id_club', clubId)
  .gte('data_inserimento', '2026-01-01')
  .lte('data_inserimento', '2026-12-31')

// Inserisci service
supabase.from('service_inseriti').insert({
  id_utente: userId,
  id_club: clubId,
  id_tipo_service: serviceId,
  punteggio_totale: score
})
```

---

## PWA e Installazione

### Manifest (vite.config.js)

```json
{
  "name": "ServiceScore - Lions Club Italia",
  "short_name": "ServiceScore",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0033A0",
  "background_color": "#0B132B"
}
```

### Service Worker

- **File**: `public/sw.js`
- **Funzionalità**:
  - Push notifications (struttura ready)
  - Cache per offline
  - Precache asset statici

### Offline Mode

- **Page**: `public/offline.html`
- **Attivazione**: quando non c'è connessione

---

## Deployment

### Vercel

1. Collega repository GitHub a Vercel
2. Imposta variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
3. Deploy automatico su push a `main`

### Build Locale

```bash
npm install --legacy-peer-deps
npm run build
npm run preview
```

---

## Variabili d'Ambiente

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_APP_URL=https://servicescore.vercel.app
```

---

## Security

- RLS (Row Level Security) abilitato su tutte le tabelle
- Storage policies per bucket `avatars`
- Credenziali in variabili d'ambiente
- HTTPS obbligatorio

---

## ToDo / Miglioramenti Futuri

- [x] Notifiche push (struttura ready, richiede configurazione push service)
- [x] Esportazione PDF classifiche
- [x] Statistiche dettagliate
- [x] Multi-lingua
- [x] Funzionamento offline
- [ ] Notifiche email (richiede Edge Function Supabase)
- [ ] Test automatici

---

## Contatti

Per questioni tecniche: supporto@01informatica.it