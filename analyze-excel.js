const XLSX = require('xlsx');

console.log('\n=== 1. MEMBER DETAIL (Club List) ===');
const wb1 = XLSX.readFile('2026 03 03 Member Detail Information.xlsx');
const data1 = XLSX.utils.sheet_to_json(wb1.Sheets['Member Detail Information'], {header: 1, defval: ''});
const clubs = data1.slice(13).filter(r => r[3]);
console.log('Records:', clubs.length);
console.log('Columns (all 51):');
data1[12].forEach((h, i) => { if (h) console.log(`  ${i}: ${h}`); });

console.log('\n=== 2. OFFICER CONTACT ===');
const wb2 = XLSX.readFile('2026 03 03 Officer Contact Information.xlsx');
const data2 = XLSX.utils.sheet_to_json(wb2.Sheets['Officer Contact Information'], {header: 1, defval: ''});
const offRows = data2.slice(8).filter(r => r[4]);
console.log('Records:', offRows.length);
console.log('Headers (first 20):');
data2[7].forEach((h, i) => { if (h) console.log(`  ${i}: ${h}`); });

console.log('\n=== 3. SERVICE ACTIVITIES ===');
const wb3 = XLSX.readFile('Service Activities Information-2026-02-15-11-33-01.xlsx');
const ws3 = wb3.Sheets[0];
console.log('Sheet name:', wb3.SheetNames[0]);

// Find header row manually
for (let r = 1; r < 30; r++) {
  const row = ws3[r];
  if (row && row[1] && row[1].v && typeof row[1].v === 'string' && row[1].v.length > 20) {
    console.log('Header row found at:', r);
    console.log('Sample cols:');
    for (let c = 1; c < 35; c++) {
      if (row[c]?.v) console.log(`  ${c}: ${row[c].v}`);
    }
    // Show first data row
    console.log('\nFirst data row:');
    const nextRow = ws3[r+1];
    if (nextRow) {
      for (let c = 1; c < 15; c++) {
        if (nextRow[c]?.v) console.log(`  ${c}: ${nextRow[c].v}`);
      }
    }
    break;
  }
}
