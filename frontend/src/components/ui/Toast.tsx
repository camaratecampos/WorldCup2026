import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bg =
    type === 'error'
      ? 'bg-red-600'
      : type === 'success'
      ? 'bg-green-600'
      : 'bg-blue-600';

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${bg} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm w-full mx-4 flex items-center justify-between`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 text-white/80 hover:text-white">
        ✕
      </button>
    </div>
  );
}

interface ToastState {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

let toastCounter = 0;
let globalShowToast: ((msg: string, type: 'error' | 'success' | 'info') => void) | null = null;

export function showToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
  if (globalShowToast) globalShowToast(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    globalShowToast = (msg, type) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, message: msg, type }]);
    };
    return () => {
      globalShowToast = null;
    };
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
