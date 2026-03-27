// =============================================================================
// COMPONENTE: ProgressRing - Anello circolare SVG per il punteggio
// =============================================================================
// Mostra il punteggio come un cerchio animato con gradiente brand.
// L'arco si riempie in base alla percentuale (score/max * 100).
//
// PROPS:
//   score: punteggio attuale (numero)
//   max: punteggio massimo possibile (numero)
//   size: diametro in pixel (default 180)
//
// COLLEGAMENTI:
// - Usato in InsertWizardView (sidebar laterale, step 2 e 3)
// - Il gradiente SVG usa i colori brand: blu → rosso → giallo
// =============================================================================

const ProgressRing = ({ score, max, size = 180 }) => {
  const percentage = max > 0 ? (score / max) * 100 : 0;
  const stroke = 12;
  const radius = size / 2;
  const normalizedRadius = radius - stroke * 2;
  // Circostanza del cerchio (serve per calcolare l'offset dell'arco)
  const circumference = normalizedRadius * 2 * Math.PI;
  // Offset: quanto "mancare" per riempire l'arco (più score = meno offset)
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        {/* Cerchio di sfondo (grigio) */}
        <circle
          stroke="currentColor"
          className="text-slate-200 dark:text-white/5"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Cerchio animato con gradiente brand */}
        <circle
          stroke="url(#lionsGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{
            strokeDashoffset,
            // Animazione spring (rimbalzo) per un effetto più vivace
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Definizione gradiente: Blu 01Informatica → Rosso → Giallo */}
        <defs>
          <linearGradient id="lionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0033A0" />
            <stop offset="50%" stopColor="#E31837" />
            <stop offset="100%" stopColor="#FFC72C" />
          </linearGradient>
        </defs>
      </svg>
      {/* Testo centrale: punteggio numerico */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="text-4xl font-black text-brand-blue dark:text-white tracking-tighter leading-none">
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] font-black text-brand-red dark:text-[#FFC72C] uppercase tracking-widest mt-2">
          Punteggio
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
