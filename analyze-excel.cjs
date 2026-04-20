const XLSX = require('xlsx');

const wb3 = XLSX.readFile('Service Activities Information-2026-02-15-11-33-01.xlsx');
const ws3 = wb3.Sheets['Service Activities Information'];

// Check from row 23 onwards
console.log('=== SERVICE ACTIVITIES (from row 23) ===');
for(let r=23; r<30; r++) {
  const row = [];
  for(let c=2; c<30; c++) { // B to AC
    const cell = ws3[`${String.fromCharCode(65+c)}${r}`];
    if(cell && cell.v) row.push(`${String.fromCharCode(65+c)}:${cell.v}`);
  }
  if(row.length > 0) console.log(`Row ${r}:`, row);
}