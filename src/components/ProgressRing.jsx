const ProgressRing = ({ score, max, size = 180 }) => {
  const percentage = max > 0 ? (score / max) * 100 : 0;
  const stroke = 12;
  const radius = size / 2;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="currentColor"
          className="text-slate-200 dark:text-white/5"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#lionsGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="lionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0033A0" />
            <stop offset="50%" stopColor="#E31837" />
            <stop offset="100%" stopColor="#FFC72C" />
          </linearGradient>
        </defs>
      </svg>
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
