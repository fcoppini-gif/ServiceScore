import { useI18n } from '../lib/i18n';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full py-12 flex flex-col items-center justify-center gap-5 border-t border-slate-100 dark:border-white/[0.03] bg-white/60 dark:bg-transparent px-4">
      {/* Logo 01Informatica */}
      <a 
        href="https://www.info01.it/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1.5 hover:opacity-70 transition-opacity"
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">
          Powered by
        </span>
        <img
          src="/logo_01informatica_retina.png"
          alt="01Informatica"
          className="h-7 opacity-50 dark:opacity-30 hover:opacity-70 transition-opacity"
        />
      </a>

      {/* Descrizione progetto */}
      <div className="text-center max-w-md space-y-1.5">
        <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wide leading-relaxed">
          Progetto di beneficienza a favore dell'Associazione Lions Club Italia
        </p>
        <a 
          href="https://www.lionsclubs.org/it" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block text-[8px] font-black uppercase tracking-widest text-brand-blue/60 dark:text-brand-yellow/50 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
        >
          lionsclubs.org/it →
        </a>
      </div>

      {/* Copyright */}
      <p className="text-[8px] font-medium text-slate-300 dark:text-slate-600 tracking-wider">
        © 2026 01 Informatica SRL
      </p>

      {/* Link legali */}
      <div className="flex flex-wrap justify-center gap-3 mt-1">
        <a 
          href="/privacy.html" 
          className="text-[8px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Privacy
        </a>
        <a 
          href="/termini.html" 
          className="text-[8px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Termini
        </a>
        <a 
          href="/contratto.html" 
          className="text-[8px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Contratto
        </a>
      </div>
    </footer>
  );
};

export default Footer;