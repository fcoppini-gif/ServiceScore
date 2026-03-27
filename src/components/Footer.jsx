// =============================================================================
// COMPONENTE: Footer - Piè di pagina con branding 01Informatica
// =============================================================================
// Mostra "Powered by" con il logo 01Informatica.
// Usato in tutte le pagine che importano Navbar o lo usano direttamente.
// =============================================================================

const Footer = () => (
  <footer className="w-full py-8 flex flex-col items-center justify-center gap-3 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
      Powered by
    </span>
    <img
      src="/logo_01informatica_retina.png"
      alt="01Informatica"
      className="h-6 opacity-40 dark:opacity-20"
    />
  </footer>
);

export default Footer;
