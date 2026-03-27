import QRCode from 'qrcode';

const VERCEL_URL = process.env.VITE_APP_URL || process.env.VERCEL_URL || 'https://servicescore.vercel.app';
const OUTPUT_FILE = 'ServiceScore_QRCode.png';

console.log('Generazione del QR Code in corso...');

QRCode.toFile(OUTPUT_FILE, VERCEL_URL, {
  color: {
    dark: '#0033A0',
    light: '#FFFFFF',
  },
  width: 1000,
  margin: 2,
}, function (err) {
  if (err) {
    console.error('Errore durante la generazione:', err);
    process.exit(1);
  } else {
    console.log(`QR Code salvato come: ${OUTPUT_FILE}`);
  }
});
