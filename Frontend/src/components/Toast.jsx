import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium max-w-sm
              ${t.type === "success" ? "bg-white border-emerald-200 text-emerald-700" : ""}
              ${t.type === "error"   ? "bg-white border-red-200 text-red-600" : ""}
              ${t.type === "info"    ? "bg-white border-neutral-200 text-neutral-700" : ""}
            `}
          >
            <span className={`h-2 w-2 rounded-full shrink-0
              ${t.type === "success" ? "bg-emerald-500" : ""}
              ${t.type === "error"   ? "bg-red-500" : ""}
              ${t.type === "info"    ? "bg-neutral-400" : ""}
            `} />
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-1 opacity-40 hover:opacity-80 transition text-xs">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
