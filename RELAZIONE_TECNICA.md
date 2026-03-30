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
│   │   └── supabase.js  # Client Supabase
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
│   └── installazione.html # Pagina installazione
├── package.json
└── vite.config.js
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
    └── nome (text)

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

---

## autenticazione

### Flow Autenticazione

1. **Registrazione**: utente inserisce email/password + username
2. **Supabase Auth**: crea record in `auth.users`
3. **Trigger**: `handle_new_user()` crea record in `public.utenti`
4. **Login**: sessione JWT gestita da Supabase

### Ruoli

| Ruolo | Permessi |
|-------|----------|
| `admin` | CRUD completo su tutte le tabelle, gestione utenti |
| `referente` | Solo i propri club, inserimento service |

---

## Calcolo Punteggio

### Formula

```
punti = (valore_inserito / range_max) * punti_max
```

### Esempio (Progetto Salvo)

| Parametro | Range Max | Punti Max | Valore | Punti |
|-----------|-----------|-----------|--------|-------|
| Realizzazione | 1 | 10 | 1 | 10.0 |
| Originalità | 1 | 5 | 1 | 5.0 |
| Difficoltà | 5 | 5 | 3 | 3.0 |
| **TOTALE** | | | | **18.0** |

---

## API e Query

### Query Principali

```javascript
// Fetch classifica
supabase
  .from('service_inseriti')
  .select('punteggio_totale, id_club, club(nome, logo_url)')

// Fetch regole per service
supabase
  .from('regole_calcolo')
  .select('*, tipi_service(nome), parametri(nome)')
  .eq('id_tipo_service', serviceId)

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

### Manifest (manifest.json)

```json
{
  "name": "ServiceScore",
  "short_name": "ServiceScore",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0033A0",
  "theme_color": "#0033A0",
  "icons": [...]
}
```

### Installazione

- **iOS**: Safari → Condividi → Aggiungi alla Home
- **Android**: Chrome → Installa app (se supportato)

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
npm install
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

- [ ] Notifiche push
- [ ] Esportazione PDF classifiche
- [ ] Multi-district
- [ ] Reportistica avanzata
- [ ] Integrazione email automatiche

---

## Contatti

Per questioni tecniche: supporto@01informatica.it
