import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles = {
    success: 'bg-emerald-800 text-white border-emerald-700',
    error: 'bg-rose-800 text-white border-rose-700',
    info: 'bg-slate-800 text-white border-slate-700',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-300 shrink-0" />,
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg text-xs font-semibold ${bgStyles[toast.type]} transition-all animate-bounce-in`}
    >
      <div className="flex items-center gap-2.5">
        {icons[toast.type]}
        <span>{toast.text}</span>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-white/70 hover:text-white rounded-md cursor-pointer ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
