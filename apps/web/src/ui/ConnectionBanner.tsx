// carrier-ops-hub/apps/web/src/ui/ConnectionBanner.tsx

import { useConnectionState } from '@/features/loads/hooks'

/**
 * Banner component that displays when the user is offline.
 * Shows a persistent notification at the top of the screen.
 */
export function ConnectionBanner() {
  const { isOnline, isReconnecting } = useConnectionState()

  if (isOnline && !isReconnecting) {
    return null // Don't show anything when online
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: 500,
        backgroundColor: isReconnecting ? '#FEF3C7' : '#FEE2E2',
        color: isReconnecting ? '#92400E' : '#991B1B',
        borderBottom: isReconnecting ? '1px solid #FCD34D' : '1px solid #FCA5A5',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {isReconnecting ? (
        <span>🔄 Reconnecting to server...</span>
      ) : (
        <span>⚠️ You are currently offline. Changes may not be saved.</span>
      )}
    </div>
  )
}
