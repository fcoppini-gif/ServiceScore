// =============================================================================
// COMPONENTE: LoadingScreen - Schermata di caricamento futuristica
// =============================================================================
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Sfondi animati */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-blue/20 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-yellow/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        {/* Logo con doppio aloneo */}
        <div className="relative">
          <img 
            src="/logo_ufficiale.png" 
            alt="ServiceScore" 
            className="w-32 h-32 sm:w-40 sm:h-40 animate-spin-slow"
          />
          {/* Aloneo interno */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 border-2 border-brand-yellow/40 rounded-full animate-ping"></div>
          </div>
          {/* Aloneo esterno */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-44 sm:w-52 sm:h-52 border border-brand-blue/20 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>
        
        {/* Logo orbitanti */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute w-3 h-3 bg-brand-yellow rounded-full top-0 left-1/2 -translate-x-1/2 shadow-lg shadow-brand-yellow/50"></div>
          <div className="absolute w-2 h-2 bg-brand-blue rounded-full bottom-0 left-1/2 -translate-x-1/2 shadow-lg shadow-brand-blue/50"></div>
        </div>
      </div>
      
      {/* Testo con effetto shimmer */}
      <div className="mt-12 text-center">
        <h2 className="text-3xl font-black uppercase tracking-widest shimmer-text">ServiceScore</h2>
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce-subtle"
              style={{ animationDelay: `${i * 150}ms` }}
            ></div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Caricamento...</p>
      </div>
    </div>
  );
}