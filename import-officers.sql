-- Officers Import
TRUNCATE TABLE officer CASCADE;

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21163' LIMIT 1), 'Presidente di club', 'Romano', 'Biolchini', 'rombiolchini@virgilio.it', '39-392-9394740', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21163' OR nome ILIKE '%ABETONE MONTAGNA PISTOIESE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21195' LIMIT 1), 'Presidente di club', 'Adriano', 'Mazzone', 'ad.mazzone@yahoo.it', '39-339-7858854', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21195' OR nome ILIKE '%ALTA MAREMMA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '39557' LIMIT 1), 'Club First Vice President', 'Graziella', 'Di Quirico', 'grazielladiquirico@alice.it', '39-339-5993323', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '39557' OR nome ILIKE '%ANTICHE VALLI LUCCHESI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '129509' LIMIT 1), 'Presidente di club', 'Giacomo', 'Martini', 'giacomo.martini.88@gmail.com', '39-392-4564769', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '129509' OR nome ILIKE '%Arezzo Chimera%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21165' LIMIT 1), 'Tesoriere di club', 'Massimo', 'Malatesti', 'massimomalatesti@libero.it', '39-335-7212767', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21165' OR nome ILIKE '%AREZZO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '56866' LIMIT 1), 'Secondo Vice Presidente di Club', 'Fulvio', 'Baldassarri', 'fulvio.balda@gmail.com', '0039-324-0739840', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '56866' OR nome ILIKE '%AREZZO MECENATE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '48118' LIMIT 1), 'Secondo Vice Presidente di Club', 'Saverio', 'Fabbiano', 'saveriofabbiano.lions@gmail.com', '39-331-3678390', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '48118' OR nome ILIKE '%AREZZO NORD EST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '56851' LIMIT 1), 'Presidente di club', 'Francesco', 'Cavini', 'francesco@cavini.it', '39-328-7261108', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '56851' OR nome ILIKE '%BARBERINO - TAVARNELLE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '33877' LIMIT 1), 'Presidente di club', 'Massimiliano', 'Brogi', 'm.brogi@addendaconsulting.it', '39-335-6342106', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '33877' OR nome ILIKE '%CASENTINO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '118838' LIMIT 1), 'Presidente di club', 'Paolo', 'Maggi', 'maggipaolo1959@gmail.com', '39-335-229527', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '118838' OR nome ILIKE '%CASTIGLIONE DELLA PESCAIA "SALEBRUM"%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21172' LIMIT 1), 'Presidente di club', 'Massimiliano', 'Fantacci', 'massimiliano.fantacci@gmail.com', '0039-338-9150087', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21172' OR nome ILIKE '%CECINA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '39723' LIMIT 1), 'Secondo Vice Presidente di Club', 'Piero', 'Cantini', 'verpier@alice.it', '39-393-6383853', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '39723' OR nome ILIKE '%CERTALDO BOCCACCIO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21173' LIMIT 1), 'Presidente di club', 'Franca', 'Salerno', 'francasalerno@libero.it', '0039-339-5744252', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21173' OR nome ILIKE '%CHIANCIANO TERME%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '35606' LIMIT 1), 'Segretario di club', 'Riccardo', 'Soderi', 'riccardosoderi@libero.it', '0039-347-7092903', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '35606' OR nome ILIKE '%CHIANTI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '54743' LIMIT 1), 'Presidente di club', 'Donatella', 'Matera', 'donatellamatera55@gmail.com', '0039-392-3435138', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '54743' OR nome ILIKE '%CHIUSI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '52974' LIMIT 1), 'Presidente di club', 'Micaela', 'Condini Gadler', 'micaela.condini@gmail.com', '0039-348-4435883', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '52974' OR nome ILIKE '%CORTONA CORITO CLANIS%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21176' LIMIT 1), 'Presidente di club', 'Donato', 'Apollonio', 'donato.ovunque@gmail.com', '0039-347-9340678', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21176' OR nome ILIKE '%CORTONA VAL DI CHIANA HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21177' LIMIT 1), 'Presidente di comitato di club addetto alle Tecnologie informatiche', 'Corrado', 'Quaglierini', 'corrado.quaglierini@gmail.com', '0039-335-5259264', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21177' OR nome ILIKE '%EMPOLI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '76056' LIMIT 1), 'Presidente di club', 'Sergio', 'De Cesaris', 'sdfdecesaris@gmail.com', '0039-340-2523966', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '76056' OR nome ILIKE '%EMPOLI FERRUCCIO BUSONI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '44461' LIMIT 1), 'Segretario di club', 'Enrico', 'D''Argenio', 'enricodargenio@virgilio.it', '0039-338-5030287', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '44461' OR nome ILIKE '%FIESOLE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21178' LIMIT 1), 'Club First Vice President', 'Maria Claudia', 'Cavaliere', 'mariaclaudiacavaliere@gmail.com', '39-377-2478871', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21178' OR nome ILIKE '%FIRENZE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '35218' LIMIT 1), 'Presidente di club', 'Gaspare', 'Polizzi', 'gaspol@libero.it', '0039-339-5046336', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '35218' OR nome ILIKE '%FIRENZE BAGNO A RIPOLI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '47988' LIMIT 1), 'Tesoriere di club', 'Roberta', 'Cialdi Bianchi', 'rocial58@gmail.com', '39-339-6544970', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '47988' OR nome ILIKE '%FIRENZE BARGELLO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '119305' LIMIT 1), 'Presidente di club', 'Donatella', 'Casini', 'd.casini1@gmail.com', '39-347-2913053', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '119305' OR nome ILIKE '%FIRENZE BRUNELLESCHI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '97195' LIMIT 1), 'Presidente di comitato di club addetto alle Tecnologie informatiche', 'Marzia', 'Cantini', 'cmarzia@hotmail.com', '0039-335-5285616', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '97195' OR nome ILIKE '%FIRENZE COSIMO DEI MEDICI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '89514' LIMIT 1), 'Coordinatore LCIF di club', 'Giancarlo', 'Fortunati', 'gianca.fortunati@libero.it', '0039-349-1211325', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '89514' OR nome ILIKE '%FIRENZE DANTE ALIGHIERI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '139749' LIMIT 1), 'Presidente di club', 'Claudio', 'Iacono', 'claudioiacono@360ingegneria.com', '0039-339-1211133', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '139749' OR nome ILIKE '%Firenze Filippo Neri%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '48548' LIMIT 1), 'Secondo Vice Presidente di Club', 'Grazia Carmela', 'Crupi', 'graziella.crupi73@gmail.com', '0039-393402345715', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '48548' OR nome ILIKE '%FIRENZE GIOTTO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '41369' LIMIT 1), 'Presidente di club', 'Alessio', 'Mecocci', 'ale.ark@tiscali.it', '39-348-2331488', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '41369' OR nome ILIKE '%FIRENZE-IMPRUNETA-SAN CASCIANO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '54490' LIMIT 1), 'Coordinatore LCIF di club', 'Elisabetta', 'Granelli', 'egranelli@immobiliaregranelli.it', '0039-393356261260', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '54490' OR nome ILIKE '%FIRENZE MICHELANGELO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '56442' LIMIT 1), 'Presidente di comitato di club addetto alle Tecnologie informatiche', 'Alberto', 'Castelli', 'castellialberto0@gmail.com', '335-8088508', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '56442' OR nome ILIKE '%FIRENZE-PALAZZO VECCHIO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '41996' LIMIT 1), 'Tesoriere di club', 'Monteleone', 'Nicola', 'monteleonenicola@icloud.com', '3281364013', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '41996' OR nome ILIKE '%FIRENZE PITTI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '84429' LIMIT 1), 'Direttore di club', 'Leonardo Livio', 'Petracchi', 'leonardopetracchi@hotmail.com', '39-335-5906078', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '84429' OR nome ILIKE '%FIRENZE POGGIO IMPERIALE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '47989' LIMIT 1), 'Direttore di club', 'Patrizia', 'Venturelli', 'venturelli.patri@gmail.com', '39-335-326355', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '47989' OR nome ILIKE '%FIRENZE PONTE VECCHIO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '33444' LIMIT 1), 'Direttore di club', 'Matteo', 'Affortunati', 'matteo.affortunati@gmail.com', '+39 3490835757', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '33444' OR nome ILIKE '%FIRENZE-SCANDICCI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '124251' LIMIT 1), 'Presidente di club', 'Barbara', 'Bigazzi', 'b.bigazzi.ark@gmail.com', 'Mobile', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '124251' OR nome ILIKE '%Forte Dei Marmi%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21183' LIMIT 1), 'Presidente di club', 'Ezio', 'Pierotti', 'ezio.pierotti@libero.it', '39-329-1213430', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21183' OR nome ILIKE '%GARFAGNANA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21184' LIMIT 1), 'Presidente addetto ai Service di Club', 'Alberto', 'Bastiani', 'bastiani.alberto@gmail.com', '39-347-0337862', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21184' OR nome ILIKE '%GROSSETO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21185' LIMIT 1), 'Coordinatore LCIF di club', 'Roberto', 'Marini', 'robertomarini2020@gmail.com', '39-338-9949382', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21185' OR nome ILIKE '%ISOLA D''ELBA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21190' LIMIT 1), 'Tesoriere di club', 'Livio', 'Casamonti', 'livio.casamonti@gmail.com', '+39-340-6641264', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21190' OR nome ILIKE '%LE SIGNE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21191' LIMIT 1), 'Presidente di comitato di club addetto al protocollo', 'Marina', 'Bertuccio', 'bertucciomarina@gmail.com', '3497733422', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21191' OR nome ILIKE '%LIVORNO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '61793' LIMIT 1), 'Presidente di club', 'Cesare', 'Cartei', 'cesarecar58@gmail.com', '39-347-0775466', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '61793' OR nome ILIKE '%LIVORNO PORTO MEDICEO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21192' LIMIT 1), 'Tesoriere di club', 'Mauro', 'Prignoli', 'mprignoli@yahoo.it', '39-335-7421386', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21192' OR nome ILIKE '%LUCCA HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '57298' LIMIT 1), 'Coordinatore LCIF di club', 'Giovanni', 'Mei', 'g.mei@meiassociati.it', '0039-335-6376084', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '57298' OR nome ILIKE '%LUCCA LE MURA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '59292' LIMIT 1), 'Tesoriere di club', 'Maria', 'Bidini', 'studiobidini@studiobidini.it', '340-9730553', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '59292' OR nome ILIKE '%LUCIGNANO E VAL D''ESSE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '177237' LIMIT 1), 'Lion Guida', 'Maria Claudia', 'Cavaliere', 'mariaclaudiacavaliere@gmail.com', '39-377-2478871', NULL, NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '177237' OR nome ILIKE '%Marliana Nievole Ombrone%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21194' LIMIT 1), 'Club First Vice President', 'Corrado', 'Lattanzi', 'arch.corrado.lattanzi@antiquesinitaly.com', '39-336-702117', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21194' OR nome ILIKE '%MASSA-CARRARA HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '106846' LIMIT 1), 'Presidente addetto ai Service di Club', 'Paola', 'Beretta', 'paul_etta@hotmail.com', '39-388-4024459', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '106846' OR nome ILIKE '%MASSA COZZILE VALDINIEVOLE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '52727' LIMIT 1), 'Presidente di Comitato Marketing', 'Maria Rita', 'Guadagni', 'guadagnimr@gmail.com', '0039-339-1540550', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '52727' OR nome ILIKE '%MASSA E CARRARA APUANIA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '108911' LIMIT 1), 'Presidente di Comitato Marketing', 'Raffaele', 'Salluzzi', NULL, '39-340-2866393', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '108911' OR nome ILIKE '%MASSAROSA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '155646' LIMIT 1), 'Tesoriere di club', 'Rossana', 'Parlanti', 'rossana.parlanti@gmail.com', '0039-348-5213023', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '155646' OR nome ILIKE '%Monsummano Terme - Giuseppe Giusti%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '51267' LIMIT 1), 'Tesoriere di club', 'Remo', 'Grassi', 'r.grassimontalcino@gmail.com', '39-393482729005', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '51267' OR nome ILIKE '%MONTALCINO VALLI D''ARBIA E D''ORCIA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21196' LIMIT 1), 'Presidente di club', 'Alessandro', 'Troiano', 'alessandro.troiano@yahoo.it', '39-333-3302803', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21196' OR nome ILIKE '%MONTECATINI TERME%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '171958' LIMIT 1), 'Lion Guida', 'Elena', 'Vannucchi', 'elenavannucchi900@gmail.com', '39-393396489156', NULL, NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '171958' OR nome ILIKE '%Montecatini Terme Castello%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '127181' LIMIT 1), 'Presidente di club', 'Massimo', 'Barontini', 'massimobarontini@alice.it', '0039-3486500231', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '127181' OR nome ILIKE '%Montemurlo%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '35964' LIMIT 1), 'Presidente di comitato di club addetto alle Tecnologie informatiche', 'Alberto', 'Pini', 'alberto@videoproduction.it', '39-339-3508987', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '35964' OR nome ILIKE '%MUGELLO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '41041' LIMIT 1), 'Direttore di club', 'Oreste', 'Egidi', 'oresteegidi@libero.it', '39-371-1805285', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '41041' OR nome ILIKE '%ORBETELLO I PRESIDI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '49559' LIMIT 1), 'Tesoriere di club', 'Elena', 'Lorenzi', 'studiolorenzielena@gmail.com', '039-348-2643402', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '49559' OR nome ILIKE '%PESCIA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '59396' LIMIT 1), 'Presidente di club', 'Tiziana', 'Ascani', 'tiziana.ascani21@gmail.com', 'Mobile', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '59396' OR nome ILIKE '%PIETRASANTA VERSILIA STORICA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21203' LIMIT 1), 'Presidente di club addetto ai soci', 'Mario', 'Niccolai', 'marioniccolai50@gmail.com', '39-339-5990092', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21203' OR nome ILIKE '%PIOMBINO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '55431' LIMIT 1), 'Presidente di club', 'Pierfrancesco', 'Gerardi', 'pierfrancesco.gerardi@gmail.com', '39-3205345505', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '55431' OR nome ILIKE '%PISA CERTOSA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21204' LIMIT 1), 'Presidente di comitato di club addetto al protocollo', 'Massimiliano', 'Valtriani', 'm.valtriani@formanova.it', '348-6006339', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21204' OR nome ILIKE '%PISA HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21205' LIMIT 1), 'Club First Vice President', 'William', 'Dispoto', 'avv.william.dispoto@gmail.com', '0039-349-7845726', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21205' OR nome ILIKE '%PISTOIA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '97660' LIMIT 1), 'Presidente di Comitato Marketing', 'Marco', 'Tempestini', 'marco@co-textil.com', '39-335-6187713', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '97660' OR nome ILIKE '%PISTOIA FUORCIVITAS%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '44758' LIMIT 1), 'Segretario di club', 'Giulia', 'Giusti', 'giustigiulia@virgilio.it', '0039-3392949185', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '44758' OR nome ILIKE '%POGGIO A CAIANO - CARMIGNANO - MEDICEI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '43907' LIMIT 1), 'Presidente di club', 'Anna Maria', 'Bamonte', 'annamaria.bamonte.rag@gmail.com', '39-335-6164360', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '43907' OR nome ILIKE '%PONTASSIEVE - STIBBERT%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21206' LIMIT 1), 'Club First Vice President', 'Francesco', 'Caramelli', 'francesco.caramelli@gmail.com', '39-348-7932296', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21206' OR nome ILIKE '%PONTEDERA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '64377' LIMIT 1), 'Tesoriere di club', 'Lisa', 'Fontanelli', 'lisa838@inwind.it', '39-329-6118800', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '64377' OR nome ILIKE '%PONTEDERA VALDERA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21207' LIMIT 1), 'Presidente di club', 'Stefano', 'Lorenzelli', 'lorenzellistefano@libero.it', '39-339-2548130', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21207' OR nome ILIKE '%PONTREMOLI LUNIGIANA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '55324' LIMIT 1), 'Presidente di club addetto ai soci', 'Maria', 'Della Casa', 'mariadellacasa@yahoo.it', '39-347-0343643', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '55324' OR nome ILIKE '%PRATO CASTELLO DELL''IMPERATORE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '109030' LIMIT 1), 'Tesoriere di club', 'Patrizia', 'Goretti', 'info@felicisalumi.it', '39-338-7980137', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '109030' OR nome ILIKE '%PRATO CENTRO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '88402' LIMIT 1), 'Presidente di club addetto ai soci', 'Claudio', 'Arinci', 'c.arinci@virgilio.it', '39-349-2662202', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '88402' OR nome ILIKE '%PRATO CURZIO MALAPARTE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '45597' LIMIT 1), 'Coordinatore LCIF di club', 'Bruna', 'Lombardi', 'brunalombardi54@gmail.com', '39-335-6072438', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '45597' OR nome ILIKE '%PRATO DATINI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21209' LIMIT 1), 'Coordinatore LCIF di club', 'Alberto', 'Bellandi', 'alberto.bellandi@texnet.it', '39-335-6379589', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21209' OR nome ILIKE '%PRATO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '44999' LIMIT 1), 'Tesoriere di club', 'Stefano', 'Martini', 'stefanomartini@inwind.it', '39-339-3332381', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '44999' OR nome ILIKE '%QUARRATA-AGLIANA PIANURA PISTOIESE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '55432' LIMIT 1), 'Amministratore del club', 'Fabrizio', 'Bartalucci', 'fabriziobartalucci@studiobartalucci.it', '39-335-5382988', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '55432' OR nome ILIKE '%SAN GIMIGNANO VIA FRANCIGENA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21217' LIMIT 1), 'Club First Vice President', 'Federico', 'Susini', 'f.susini88@gmail.com', '39-333-1491424', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21217' OR nome ILIKE '%SAN MINIATO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21218' LIMIT 1), 'Presidente di club', 'Giancarlo', 'Giorgi', 'giorgi.goog@gmail.com', '39-347-9623098', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21218' OR nome ILIKE '%SANSEPOLCRO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '60324' LIMIT 1), 'Presidente di club', 'Lilli', 'De Pascale', 'lillidepascale@hotmail.it', '338-4907978', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '60324' OR nome ILIKE '%SERRAVALLE PISTOIESE%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21221' LIMIT 1), 'Secondo Vice Presidente di Club', 'Roberto', 'Casamonti', 'geom.casamonti@gmail.com', '0039-338-7315437', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21221' OR nome ILIKE '%SESTO FIORENTINO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21222' LIMIT 1), 'Presidente di club addetto ai soci', 'Vincenzo', 'Mittica', 'mittica.vince@gmail.com', '39-335-427168', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21222' OR nome ILIKE '%SIENA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '123824' LIMIT 1), 'Presidente di club addetto ai soci', 'Paolo', 'Giuliani', 'pg130260@gmail.com', '39-335-5428361', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '123824' OR nome ILIKE '%Siena "Torre di Mezzo"%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '144968' LIMIT 1), 'Tesoriere di club', 'Daniele', 'Bartoloni', 'daniele@studiobartoloni.com', '393924797653', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '144968' OR nome ILIKE '%Vaglia%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '36994' LIMIT 1), 'Segretario di club', 'Francesco', 'Cordelli', 'francesco.cordelli@alice.it', '39-333-9374410', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '36994' OR nome ILIKE '%VALDARNO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '58074' LIMIT 1), 'Direttore di club', 'Roberto', 'Vasarri', 'roberto@vasarri.it', '39-335-6666900', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '58074' OR nome ILIKE '%VALDARNO MASACCIO%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21230' LIMIT 1), 'Direttore di club', 'Roberto', 'Bonini', 'r.bonini@studiopetreni.com', '39-338-7729964', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21230' OR nome ILIKE '%VALDELSA%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '88201' LIMIT 1), 'Presidente di club', 'Marco', 'Forzoni', 'm.forzoni@itcrappresentanze.it', '39-335-8398828', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '88201' OR nome ILIKE '%VALDICHIANA I CHIARI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '150813' LIMIT 1), 'Tesoriere di club', 'Chiara', 'Ballati', 'chiaraballati@yahoo.it', '0039-329-3227877', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '150813' OR nome ILIKE '%Valle del Serchio%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '177502' LIMIT 1), 'Lion Guida', 'Fabrizio', 'Ungaretti', 'avv.ungaretti@gmail.com', '39-347-0191790', '2024-10-08', '2026-10-08'
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '177502' OR nome ILIKE '%Viareggio Giacomo Puccini%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21231' LIMIT 1), 'Presidente addetto ai Service di Club', 'Marco', 'Garfagnini', 'garfagninimarco@gmail.com', '39-335-8262677', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21231' OR nome ILIKE '%VIAREGGIO HOST%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '54374' LIMIT 1), 'Presidente di club', 'Sergio', 'Bandini', 'sergiobandini@bandini.it', '0039-348-2408615', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '54374' OR nome ILIKE '%VINCI LEONARDO DA VINCI%');

INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) 
SELECT (SELECT id FROM club WHERE id_lions = '21234' LIMIT 1), 'Presidente di comitato di club addetto al protocollo', 'Paolo', 'Gazzarri', 'p.gazzarri@virgilio.it', '39-335-7266371', '2025-01-06', NULL
WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '21234' OR nome ILIKE '%VOLTERRA%');

