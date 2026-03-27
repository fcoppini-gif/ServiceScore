// =============================================================================
// HOOK: useToast - Sistema di notifiche toast
// =============================================================================
// Sostituisce gli alert() nativi del browser con notifiche animate.
// Ogni toast scompare automaticamente dopo 4 secondi.
//
// UTILIZZO:
//   const { toast, ToastContainer } = useToast();
//   <ToastContainer />              ← inserire una volta nel layout
//   toast.error("Messaggio")       ← mostrare toast rosso
//   toast.success("Messaggio")     ← mostrare toast verde
//   toast.info("Messaggio")        ← mostrare toast blu
//
// COLLEGAMENTO:
// - Usato in App.jsx e passato come prop a InsertWizardView
// - InsertWizardView usa toast.error() per errori di salvataggio
// =============================================================================

import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// Stili CSS per ogni tipo di toast
const toastStyles = {
  error: 'bg-brand-red text-white',
  success: 'bg-green-600 text-white',
  info: 'bg-brand-blue text-white',
};

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  // Aggiunge un toast alla lista e lo rimuove dopo 'duration' ms
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // Rimozione manuale (click sulla X)
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Oggetto con i metodi pubblici
  const toast = {
    error: (msg) => addToast(msg, 'error'),
    success: (msg) => addToast(msg, 'success'),
    info: (msg) => addToast(msg, 'info'),
  };

  // Componente JSX che renderizza i toast in alto a destra
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${toastStyles[t.type]} rounded-2xl px-5 py-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-right-8 duration-300`}
        >
          {t.type === 'error' && <AlertCircle size={20} className="shrink-0 mt-0.5" />}
          {t.type === 'success' && <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
          <span className="text-sm font-bold flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer bg-transparent border-none text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}
