import QRCode from 'qrcode';

const VERCEL_URL = process.env.VITE_APP_URL || process.env.VERCEL_URL || 'https://servicescore.vercel.app';
const OUTPUT_FILE = 'ServiceScore_QRCode.png';

console.log('🎨 Generazione QR Code ServiceScore - Colori 01Informatica');
console.log(`   URL: ${VERCEL_URL}`);

const COLORS = {
  blue: '#0033A0',
  red: '#E31837',
  yellow: '#FFC72C',
  dark: '#0B132B',
  white: '#FFFFFF'
};

async function generateQR() {
  try {
    // QR Code con colore blu 01Informatica
    const qrDataUrl = await QRCode.toDataURL(VERCEL_URL, {
      width: 1000,
      margin: 2,
      color: {
        dark: COLORS.blue,
        light: COLORS.white
      },
      errorCorrectionLevel: 'H'
    });

    // Converti base64
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const { writeFileSync } = await import('fs');
    
    writeFileSync(OUTPUT_FILE, Buffer.from(base64Data, 'base64'));

    console.log('✅ QR Code generato!');
    console.log('   Colori applicati:');
    console.log(`   • QR: Blu #0033A0`);
    console.log(`   • Sfondo: Bianco #FFFFFF`);
    console.log('');
    console.log('📋 NOTE:');
    console.log('   I colori 01Informatica applicati:');
    console.log('   • Blu #0033A0 (QR Code)');
    console.log('   • Rosso #E31837 (accenti)');
    console.log('   • Giallo #FFC72C (highlight)');
    console.log(`\n💾 File: ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  }
}

generateQR();