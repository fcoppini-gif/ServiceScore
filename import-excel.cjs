const XLSX = require('xlsx');
const fs = require('fs');

console.log('=== IMPORT EXCEL ===\n');

function parseDate(val) {
  if(!val) return null;
  if(typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  if(typeof val === 'string') {
    const parts = val.split('/');
    if(parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return null;
}

// =============================================================================
// 1. CLUB
// =============================================================================
console.log('1. CLUB...');
const wb1 = XLSX.readFile('2026 03 03 Member Detail Information.xlsx');
const data1 = XLSX.utils.sheet_to_json(wb1.Sheets['Member Detail Information'], {header: 1, defval: ''});
const clubs = data1.slice(13).filter(r => r[3]).map(r => ({
  nome: r[3],
  id_lions: r[5],
  tipo: r[6],
  circoscrizione: r[7],
  zona: r[8],
  distretto: r[2]
}));
console.log(`  ${clubs.length} club`);

// =============================================================================
// 2. OFFICER
// =============================================================================
console.log('2. OFFICER...');
const wb2 = XLSX.readFile('2026 03 03 Officer Contact Information.xlsx');
const data2 = XLSX.utils.sheet_to_json(wb2.Sheets['Officer Contact Information'], {header: 1, defval: ''});
let hRow = 0;
for(let i=8; i<20; i++) {
  if(data2[i] && data2[i][4] === 'Titolo ufficiale') { hRow = i; break; }
}
const officers = data2.slice(hRow+1).filter(r => r[3] && r[4]).map(r => ({
  club_name: r[3],
  titolo: r[4],
  data_inizio: parseDate(r[5]),
  data_fine: parseDate(r[6]),
  nome: r[9],
  cognome: r[11]
}));
console.log(`  ${officers.length} officer`);

// =============================================================================
// 3. SERVICE ACTIVITIES
// =============================================================================
console.log('3. SERVICE ACTIVITIES...');
const wb3 = XLSX.readFile('Service Activities Information-2026-02-15-11-33-01.xlsx');
const data3 = XLSX.utils.sheet_to_json(wb3.Sheets['Service Activities Information'], {header: 1, defval: '', range: 22});

// Headers: 0=MD, 1=Distretto, 2=Club, 4=Data inizio, 5=Data fine, 7=Stato, 8=Titolo, 9=Desc, 11=Causa, 12=Tipo
const services = data3.slice(1).filter(r => r[2]).map(r => ({
  club_name: r[2],           // Col C
  titolo: r[8] || '',        // Col I
  descrizione: r[9] || '',    // Col J
  causa: r[11] || '',         // Col L
  tipo_progetto: r[12] || '', // Col M
  data_inizio: parseDate(r[4]),  // Col E
  data_conclusione: parseDate(r[5]), // Col F
  stato: r[7] || 'Comunicato',
  persone_servite: parseInt(r[13]) || 0, // Col N
  totale_volontari: parseInt(r[15]) || 0, // Col P
  totale_ore_servizio: parseInt(r[16]) || 0, // Col Q
  fondi_donati: parseFloat(r[17]) || 0, // Col R
  fondi_raccolti: parseFloat(r[21]) || 0, // Col V
  organizzazione_beneficiaria: r[20] || '' // Col U
}));
console.log(`  ${services.length} service activities`);

// =============================================================================
// 4. GENERA SQL
// =============================================================================
let sql = '-- === CLUB ===\n';
sql += 'TRUNCATE TABLE club CASCADE;\n\n';
clubs.forEach(c => {
  const nome = c.nome.replace(/'/g, "''");
  sql += `INSERT INTO club (nome, id_lions, tipo, circoscrizione, zona, distretto) VALUES ('${nome}', '${c.id_lions || ''}', '${c.tipo || ''}', '${c.circoscrizione || ''}', '${c.zona || ''}', '${c.distretto || ''}');\n`;
});

sql += '\n-- === OFFICER ===\n';
sql += 'TRUNCATE TABLE officer CASCADE;\n\n';
officers.forEach(o => {
  const cName = o.club_name.replace(/'/g, "''");
  const t = o.titolo?.replace(/'/g, "''") || '';
  const n = o.nome?.replace(/'/g, "''") || '';
  const cog = o.cognome?.replace(/'/g, "''") || '';
  sql += `INSERT INTO officer (club_name, titolo, data_inizio, data_fine, nome, cognome) VALUES ('${cName}', '${t}', ${o.data_inizio ? "'"+o.data_inizio+"'" : 'NULL'}, ${o.data_fine ? "'"+o.data_fine+"'" : 'NULL'}, '${n}', '${cog}');\n`;
});

sql += '\n-- === SERVICE ACTIVITIES ===\n';
sql += 'TRUNCATE TABLE service_activities CASCADE;\n\n';
services.forEach(s => {
  const cName = s.club_name.replace(/'/g, "''");
  const t = s.titolo.replace(/'/g, "''").substring(0,200);
  const d = s.descrizione.replace(/'/g, "''").substring(0,500);
  const c = s.causa.replace(/'/g, "''") || '';
  const tp = s.tipo_progetto.replace(/'/g, "''") || '';
  const b = (s.organizzazione_beneficiaria || '').replace ? s.organizzazione_beneficiaria.replace(/'/g, "''") : '';
  sql += `INSERT INTO service_activities (club_name, titolo, descrizione, causa, tipo_progetto, data_inizio, data_conclusione, stato, persone_servite, totale_volontari, totale_ore_servizio, fondi_donati, fondi_raccolti, organizzazione_beneficiaria) VALUES ('${cName}', '${t}', '${d}', '${c}', '${tp}', ${s.data_inizio ? "'"+s.data_inizio+"'" : 'NULL'}, ${s.data_conclusione ? "'"+s.data_conclusione+"'" : 'NULL'}, '${s.stato}', ${s.persone_servite}, ${s.totale_volontari}, ${s.totale_ore_servizio}, ${s.fondi_donati}, ${s.fondi_raccolti}, '${b}');\n`;
});

fs.writeFileSync('import-sql.sql', sql);
console.log(`\n✓ SQL: ${sql.length} chars`);
console.log('Esegui import-sql.sql in Supabase SQL Editor');