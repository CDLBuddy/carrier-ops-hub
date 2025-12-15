// carrier-ops-hub/apps/web/src/ui/Toast/ToastContainer.tsx

import { useToast } from './ToastContext'
import { ToastItem } from './ToastItem'

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '5rem',
        right: '1rem',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '24rem',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
