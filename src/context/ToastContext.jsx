import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(undefined)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-bakery-brown-700',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm">
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={`${STYLES[t.type]} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 toast-item`}
              role="status"
            >
              <Icon size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 opacity-80 hover:opacity-100"
                aria-label="Fechar notificação"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx === undefined) {
    throw new Error('useToast precisa ser usado dentro de <ToastProvider>')
  }
  return ctx
}
