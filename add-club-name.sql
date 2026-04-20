-- Aggiungi colonna club_name temporanea per import
ALTER TABLE officer ADD COLUMN IF NOT EXISTS club_name TEXT;

-- oppure se preferisci, usa questa versione aggiornata: