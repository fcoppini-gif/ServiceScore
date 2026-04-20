const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('2026 03 03 Officer Contact Information.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];

// Read with header:1 to get array of arrays
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Find header row (row 13, index 12)
const headerRow = rawData[12];
console.log('Header row:', JSON.stringify(headerRow));

// Column indices based on header row
const colIndices = {
  club_name: headerRow.findIndex(c => c === 'Nome account  ↑'),
  titolo: headerRow.findIndex(c => c === 'Titolo ufficiale'),
  data_inizio: headerRow.findIndex(c => c === 'Data d\'inizio'),
  data_fine: headerRow.findIndex(c => c === 'Data di conclusione'),
  matricola: headerRow.findIndex(c => c === 'Socio: Matricola socio'),
  titolo_socio: headerRow.findIndex(c => c === 'Socio: Titolo'),
  nome: headerRow.findIndex(c => c === 'Socio: Nome'),
  cognome: headerRow.findIndex(c => c === 'Socio: Cognome'),
  indirizzo_tipo: headerRow.findIndex(c => c === 'Socio: Primary Address Type'),
  indirizzo: headerRow.findIndex(c => c === 'Socio: Indirizzo postale (riga 1)'),
  citta: headerRow.findIndex(c => c === 'Socio: Città indirizzo postale'),
  provincia: headerRow.findIndex(c => c === 'Socio: Stato/Provincia indirizzo postale'),
  cap: headerRow.findIndex(c => c === 'Socio: CAP indirizzo postale'),
  email_personal: headerRow.findIndex(c => c === 'Socio: Personal Email'),
  email_work: headerRow.findIndex(c => c === 'Socio: Work Email'),
  telefono: headerRow.findIndex(c => c === 'Socio: Cellulare'),
  cell: headerRow.findIndex(c => c === 'Socio: Preferred Phone'),
  circoscrizione: headerRow.findIndex(c => c === 'Circoscrizione di appartenenza'),
  zona: headerRow.findIndex(c => c === 'Zona di appartenenza'),
  id_lions: headerRow.findIndex(c => c === 'Identificativo Lions'),
};

console.log('Column indices:', JSON.stringify(colIndices));

// Parse data rows (starting from index 13)
const dataRows = rawData.slice(13).filter(row => row[colIndices.club_name]);
console.log('Total officers:', dataRows.length);

// Helper to clean date
function parseDate(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  // Excel serial date
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return null;
}

// Helper to clean text
function clean(val) {
  if (val === undefined || val === null) return '';
  return String(val).replace(/'/g, "''").trim();
}

// Generate SQL
let sql = '-- Officers Import\n';
sql += 'TRUNCATE TABLE officer CASCADE;\n\n';

dataRows.forEach((row, idx) => {
  const clubName = clean(row[colIndices.club_name]);
  const titolo = clean(row[colIndices.titolo]);
  const nome = clean(row[colIndices.nome]);
  const cognome = clean(row[colIndices.cognome]);
  const email = clean(row[colIndices.email_personal] || row[colIndices.email_work]);
  const telefono = clean(row[colIndices.telefono] || row[colIndices.cell]);
  const dataInizio = parseDate(row[colIndices.data_inizio]);
  const dataFine = parseDate(row[colIndices.data_fine]);
  const idLions = clean(row[colIndices.id_lions]);

  if (!titolo || !nome) return;

  let clubRef = '';
  if (idLions) {
    clubRef = `(SELECT id FROM club WHERE id_lions = '${idLions}' LIMIT 1)`;
  } else {
    clubRef = `(SELECT id FROM club WHERE nome ILIKE '%${clubName}%' LIMIT 1)`;
  }

  const dataIn = dataInizio ? `'${dataInizio}'` : 'NULL';
  const dataFn = dataFine ? `'${dataFine}'` : 'NULL';
  const emailVal = email ? `'${email}'` : 'NULL';
  const telVal = telefono ? `'${telefono}'` : 'NULL';

  sql += `INSERT INTO officer (id_club, titolo, nome, cognome, email, telefono, data_inizio, data_fine) \n`;
  sql += `SELECT ${clubRef}, '${titolo}', '${nome}', '${cognome}', ${emailVal}, ${telVal}, ${dataIn}, ${dataFn}\n`;
  sql += `WHERE EXISTS (SELECT 1 FROM club WHERE id_lions = '${idLions}' OR nome ILIKE '%${clubName}%')`;
  sql += `;\n\n`;
});

fs.writeFileSync('import-officers.sql', sql);
console.log('Generated SQL file: import-officers.sql');
console.log('Total insert statements:', dataRows.length);