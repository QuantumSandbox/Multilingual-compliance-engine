import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-accent-success" />,
  error: <XCircle className="w-5 h-5 text-accent-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-accent-warning" />,
  info: <Info className="w-5 h-5 text-accent-info" />,
};

const BORDER = {
  success: "border-l-accent-success",
  error: "border-l-accent-danger",
  warning: "border-l-accent-warning",
  info: "border-l-accent-info",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (type, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 w-[340px] max-w-[calc(100vw-2rem)]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start gap-3 bg-bg-secondary border border-border-primary ${BORDER[t.type]} border-l-4 rounded-md p-3 shadow-lg animate-slide-in-right`}
            >
              <div className="mt-0.5">{ICONS[t.type]}</div>
              <p className="flex-1 text-sm text-text-secondary">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
