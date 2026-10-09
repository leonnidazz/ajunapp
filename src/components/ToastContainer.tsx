import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-top-4 transition-all ${
              isError
                ? 'bg-[#93000a]/90 text-white border-[#ffb4ab]/40'
                : isInfo
                ? 'bg-[#1b5e4b]/90 text-white border-[#44e2cd]/50'
                : 'bg-[#1e2022]/95 text-white border-[#44e2cd]/40'
            }`}
          >
            <span className="material-symbols-outlined text-base shrink-0">
              {isError ? 'error' : isInfo ? 'info' : 'check_circle'}
            </span>
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
