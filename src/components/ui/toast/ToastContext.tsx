import type { ReactNode } from "react";

import  { useState, useContext, createContext } from "react";

type ToastType = "loading" | "success" | "error";

interface ToastData {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  clearToast: () => void;
  toast: ToastData | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });

    if (type !== "loading") {
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  const clearToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ toast, showToast, clearToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
