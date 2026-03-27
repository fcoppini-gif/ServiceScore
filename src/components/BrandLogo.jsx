// =============================================================================
// COMPONENTE: BrandLogo - Logo ufficiale dell'app
// =============================================================================
// Mostra il logo ufficiale ServiceScore.
// Il file immagine è in /public/logo_ufficiale.png
// Riceve 'className' per controllare la dimensione (es. "h-16", "h-8")
// =============================================================================

const BrandLogo = ({ className = "h-16" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <img
      src="/logo_ufficiale.png"
      alt="ServiceScore"
      className="h-full object-contain drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
    />
  </div>
);

export default BrandLogo;
