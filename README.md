# ServiceScore - Lions District 108

Web app per la gestione delle attività lionistiche del District 108 Italia.

## Struttura

### Tabelle Database
- **club** - 92 Lions Clubs
- **soci** - ~3000 soci membri
- **officer** - ~184 officer di club
- **service_activities** - Attività di service
- **utenti** - Utenti dell'app

### Pagine
1. **Login** - Accesso utente
2. **Dashboard** - Panoramica con statistiche
3. **Selezioni** - Filtri avanzati su soci, officer, attività
4. **Club Detail** - Dettaglio singolo club
5. **Admin** - Gestione utenti e dati

## Come Importare i Dati

### Metodo 1: Supabase SQL Editor
Copiare il contenuto dei file:
- `import-sql.sql` - Club (già importati)
- `import-officers.sql` - Officer
- `import-soci.sql` - Soci

### Metodo 2: Dalla App (Admin → Dati)
1. Login come admin
2. Vai su **Admin** → **Dati**
3. Seleziona la tabella
4. Click **Apri Gestionale**
5. Click **Nuovo** per aggiungere record

## Filtri Disponibili

### Selezioni → Soci
- Genere, Fasce età, Professione
- Città, Provincia
- Categoria associativa
- Club, Zona, Circoscrizione

### Selezioni → Officer
- Titolo ufficiale
- Data inizio/fine
- Club, Zona, Circoscrizione

### Selezioni → Attività
- Club, Causa, Tipo progetto
- Persone servite, Volontari, Fondi
- Zona, Circoscrizione

## Tech Stack
- React + Vite
- Supabase (database)
- TailwindCSS
- PWA (installabile)