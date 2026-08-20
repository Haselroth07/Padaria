import { AlertTriangle } from 'lucide-react'
import Button from './Button.jsx'

export default function ConfirmDialog({
  open,
  title = 'Confirmar ação',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 rounded-full p-2 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={danger ? 'text-red-600' : 'text-amber-600'} size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-bakery-brown-900">{title}</h3>
            {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
