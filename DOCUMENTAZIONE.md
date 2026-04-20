# ServiceScore - Guida Completa

## Panoramica

ServiceScore è un'app web per la gestione delle attività lionistiche del District 108 Lions Italia.

**URL:** https://servicescore.vercel.app

---

## Struttura dei Dati

### Database Tables

| Tabella | Descrizione | Records |
|--------|-------------|---------|
| club | Lions Clubs | 92 |
| soci | Soci membri | ~2978 |
| officer | Officer club | 184 |
| service_activities | Attività service | ~110 |
| utenti | Utenti app | - |

---

## Come Aggiungere Dati

### Metodo 1: Da Supabase (SQL)
Copia il contenuto dei file in `Supabase SQL Editor`:

1. **Club** - `import-sql.sql` (già importato)
2. **Officer** - `import-officers.sql`  
3. **Soci** - `import-soci.sql`

### Metodo 2: Dall'App (Consigliato)

```
1. Login come admin
2. Click "Admin" nella navbar
3. Click tab "Dati"
4. Select tabella (Club/Soci/Officer/Attività)
5. Click "Apri Gestionale"
6. Click "Nuovo" (pulsante in alto)
7. Riempi i campi
8. Click "Salva"
```

---

## Pagine dell'App

### 1. Login
- Accedi con username/password
- Crea nuovo utente da Admin

### 2. Dashboard
- Statistiche in cards visive
- Lista club ricercabile
- Click club per dettaglio

### 3. Selezioni (Filtri Avanzati)
Filtra per:
- **Soci**: categoria, provincia, club, zona, circoscrizione, città, professione
- **Officer**: titolo, club, zona, circoscrizione, date
- **Attività**: club, causa, tipo, stato, persone, volontari, fondi

### 4. Club Detail
- Dati club
- Officer associati
- Attività svolte

### 5. Admin
- **Utenti**: crea/modifica username e ruoli
- **Dati**: CRUD per tutte le tabelle

---

## Ruoli Utente

| Ruolo | Permessi |
|------|---------|
| admin | Tutto accesso |
| referente | Solo i propri club |

---

## Filtri nella pagina Selezioni

### Soci (da Member Detail)
- Categoria (Socio effettivo, onorario, etc.)
- Provincia
- Club
- Zona
- Circoscrizione
- Città
- Professione

### Officer (da Officer Contact)
- Titolo (Presidente, Segretario, etc.)
- Club
- Zona
- Circoscrizione
- Data inizio (da/a)

### Attività (da Service Activities)
- Club
- Causa (Fame, Vista, Ambiente, etc.)
- Tipo progetto
- Stato
- Persone servite (range)
- Volontari (range)
- Fondi donati (range)
- Zona
- Circoscrizione

---

## Come Funziona l'Import

I dati vengono dai 3 file Excel:

1. **Member Detail** → Tabella `soci`
2. **Officer Contact** → Tabella `officer`  
3. **Service Activities** → Tabella `service_activities`

Gli import usano subquery per collegare i record alle tabelle corrette.

---

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **PWA**: Service Workers per installazione

---

## Problemi Comuni

### Dati non visibili?
1. Verifica che le tabelle abbiano dati
2. Controlla che RLS sia abilitato
3. Prova a fare refresh

### Errori SQL?
- Alcuni campi vuoti danno errore - usa il metodo App invece

---

## Contatti

Per supporto: f.coppini@lions.it