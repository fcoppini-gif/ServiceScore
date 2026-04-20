-- Pulisci dati errati dalla tabella officer
DELETE FROM officer WHERE club_name = 'Totale parziale' OR titolo = 'Conteggio';

-- Verifica
SELECT COUNT(*) as tot FROM officer;
SELECT DISTINCT titolo FROM officer;