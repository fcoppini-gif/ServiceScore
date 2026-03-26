import QRCode from 'qrcode';

const VERCEL_URL = 'https://servicescore.vercel.app'; 

// Nome del file immagine che verrà salvato
const OUTPUT_FILE = 'ServiceScore_QRCode_Base.png';

console.log('Generazione del QR Code in corso...');

QRCode.toFile(OUTPUT_FILE, VERCEL_URL, {
  color: {
    dark: '#0033A0',  // Blu 01Informatica
    light: '#FFFFFF'  // Sfondo bianco
  },
  width: 1000,        // Alta risoluzione per la stampa
  margin: 2           // Margine pulito
}, function (err) {
  if (err) {
    console.error('Errore durante la generazione:', err);
  } else {
    console.log(`✅ Fatto! QR Code salvato come: ${OUTPUT_FILE}`);
  }
});