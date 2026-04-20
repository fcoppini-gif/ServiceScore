const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('2026 03 03 Member Detail Information.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const headerRow = rawData[12];
console.log('Header row:', JSON.stringify(headerRow.slice(0, 20)));

const colIndices = {
  club_name: 3,
  id_lions: 5,
  circoscrizione: 7,
  zona: 8,
  tipo_associazione: 9,
  stato_associativo: 10,
  categoria: 11,
  matricola: 13,
  titolo: 14,
  nome: 15,
  cognome: 17,
  indirizzo: 20,
  citta: 23,
  provincia: 24,
  cap: 25,
  paese: 26,
  email_personal: 33,
  cellulare: 37,
};

console.log('Column indices:', JSON.stringify(colIndices));

const dataRows = rawData.slice(13).filter(row => row[colIndices.matricola]);
console.log('Data rows with matricola:', dataRows.length);

// Carry forward club name for subsequent members
let currentClubName = '';
let currentIdLions = '';
dataRows.forEach(row => {
  if (row[colIndices.club_name]) {
    currentClubName = row[colIndices.club_name];
    currentIdLions = row[colIndices.id_lions];
  }
  row[colIndices.club_name] = currentClubName;
  row[colIndices.id_lions] = currentIdLions;
});
console.log('After carry forward, rows with club:', dataRows.filter(r => r[colIndices.club_name]).length);

function clean(val) {
  if (val === undefined || val === null) return '';
  return String(val).replace(/'/g, "''").trim();
}

function nullOr(val) {
  return val ? `'${clean(val)}'` : 'NULL';
}

let sql = '-- Members (Soci) Import\n';
sql += 'TRUNCATE TABLE soci CASCADE;\n\n';

dataRows.forEach((row) => {
  const clubName = clean(row[colIndices.club_name]);
  const idLions = clean(row[colIndices.id_lions]);
  const titolo = clean(row[colIndices.titolo]);
  const nome = clean(row[colIndices.nome]);
  const cognome = clean(row[colIndices.cognome]);

  const matricola = clean(row[colIndices.matricola]);
  if (!clubName || !matricola) return;

  if (!nome && !cognome) return;

  const clubRef = idLions ? `(SELECT id FROM club WHERE id_lions = '${idLions}' LIMIT 1)` : `(SELECT id FROM club WHERE nome ILIKE '%${clubName}%' LIMIT 1)`;

  sql += `INSERT INTO soci (
    id_club, matricola, titolo, nome, cognome, 
    indirizzo, citta, provincia, cap, paese,
    email_personal, email_work,
    categoria, stato_associativo
  )\n`;
  sql += `SELECT ${clubRef}, ${nullOr(row[colIndices.matricola])}, ${nullOr(titolo)}, ${nullOr(nome)}, ${nullOr(cognome)}, \n`;
  sql += `${nullOr(row[colIndices.indirizzo])}, ${nullOr(row[colIndices.citta])}, ${nullOr(row[colIndices.provincia])}, ${nullOr(row[colIndices.cap])}, ${nullOr(row[colIndices.paese])}, \n`;
  sql += `${nullOr(row[colIndices.email_personal])}, ${nullOr(row[colIndices.email_work])}, ${nullOr(row[colIndices.categoria])}, ${nullOr(row[colIndices.stato_associativo])}\n`;
  sql += `WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '${idLions}' OR nome ILIKE '%${clubName}%')`;
  sql += `;\n\n`;
});

fs.writeFileSync('import-soci.sql', sql);
console.log('Generated SQL file: import-soci.sql');