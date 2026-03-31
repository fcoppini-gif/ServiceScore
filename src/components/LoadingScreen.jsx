// =============================================================================
// COMPONENTE: LoadingScreen - Schermata di caricamento con logo rotante
// =============================================================================
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
      <div className="relative">
        {/* Logo rotante */}
        <img 
          src="/logo_ufficiale.png" 
          alt="ServiceScore" 
          className="w-32 h-32 sm:w-40 sm:h-40 animate-spin-slow"
        />
        {/* Aloneo luminoso */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-brand-yellow/30 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Testo caricamento */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white">ServiceScore</h2>
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}