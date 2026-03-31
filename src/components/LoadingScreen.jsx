// =============================================================================
// COMPONENTE: LoadingScreen - Schermata di caricamento elegante
// =============================================================================
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Sfondo aurora morbido */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-blue/10 rounded-full blur-[100px] animate-aurora"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-yellow/10 rounded-full blur-[100px] animate-aurora" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '8s' }}></div>
      
      <div className="relative z-10">
        {/* Logo con rotazione elegante */}
        <div className="relative">
          <img 
            src="/logo_ufficiale.png" 
            alt="ServiceScore" 
            className="w-28 h-28 sm:w-36 sm:h-36 animate-spin-slow"
          />
          {/* Aloneo sottile */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-34 h-34 sm:w-42 sm:h-42 border border-brand-yellow/30 rounded-full animate-pulse-soft"></div>
          </div>
        </div>
      </div>
      
      {/* Testo con effetto shimmer */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest shimmer-text">ServiceScore</h2>
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce-subtle"
              style={{ animationDelay: `${i * 150}ms` }}
            ></div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Caricamento...</p>
      </div>
    </div>
  );
}