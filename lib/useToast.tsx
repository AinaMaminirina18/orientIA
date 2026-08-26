"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastMessage } from "./types";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...message, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border bg-white shadow-md text-slate-800 border-slate-200"
            >
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              {t.type === "info" && <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}

              <div className="flex-1 text-sm">
                <p className="font-semibold text-slate-900 leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-normal">{t.description}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
