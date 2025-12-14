// carrier-ops-hub/apps/web/src/app/layout/DriverLayout.tsx

import type { ReactNode } from 'react'

interface DriverLayoutProps {
  children: ReactNode
}

export function DriverLayout({ children }: DriverLayoutProps) {
  return (
    <div className="driver-layout">
      {/* TODO: Add driver-specific navigation */}
      {children}
    </div>
  )
}
