import { useI18n } from '../lib/i18n';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full py-10 flex flex-col items-center justify-center gap-6 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] px-4">
      {/* Logo 01Informatica cliccabile */}
      <a 
        href="https://www.info01.it/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Powered by
        </span>
        <img
          src="/logo_01informatica_retina.png"
          alt="01Informatica"
          className="h-8 opacity-60 dark:opacity-40 hover:opacity-80 transition-opacity"
        />
      </a>

      {/* Copyright */}
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        © 2026 01 Informatica SRL
      </p>

      {/* Descrizione progetto beneficenza */}
      <div className="text-center max-w-md space-y-2">
        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
          Progetto di beneficienza a favore dell'Associazione Lions Club Italia
        </p>
        <a 
          href="https://www.lionsclubs.org/it" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block text-[8px] font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow hover:underline"
        >
          lionsclubs.org/it →
        </a>
      </div>

      {/* Link legali */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <a 
          href="/privacy.html" 
          className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Privacy
        </a>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <a 
          href="/termini.html" 
          className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Termini
        </a>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <a 
          href="/contratto.html" 
          className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors uppercase tracking-wider"
        >
          Contratto
        </a>
      </div>
    </footer>
  );
};

export default Footer;