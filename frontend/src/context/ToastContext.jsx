import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToats] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToats(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToats(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToats(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="slash-toast-container">
        {toasts.map(toast => {
          let Icon = Info;
          let extraClass = '';
          if (toast.type === 'success') {
            Icon = CheckCircle;
            extraClass = 'slash-toast-success';
          } else if (toast.type === 'critical' || toast.type === 'error') {
            Icon = AlertTriangle;
            extraClass = 'slash-toast-critical';
          }

          return (
            <div key={toast.id} className={`slash-toast ${extraClass}`}>
              <Icon size={18} style={{ color: toast.type === 'critical' ? 'var(--risk-critical)' : toast.type === 'success' ? 'var(--risk-safe)' : 'var(--color-copper)' }} />
              <div style={{ flex: 1, fontSize: '0.82rem', lineHeight: '1.4' }}>{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
