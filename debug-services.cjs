const XLSX = require('xlsx');

const wb3 = XLSX.readFile('Service Activities Information-2026-02-15-11-33-01.xlsx');
const ws3 = wb3.Sheets['Service Activities Information'];

// Read as array of arrays with range starting at row 23
const data = XLSX.utils.sheet_to_json(ws3, {header: 1, defval: '', range: 22});

console.log('Total rows:', data.length);
console.log('Row 1 (header):', data[0]?.slice(0,10));
console.log('Row 2 (first data):', data[1]?.slice(0,10));
console.log('Row 3:', data[2]?.slice(0,10));