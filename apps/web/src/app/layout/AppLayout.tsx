// carrier-ops-hub/apps/web/src/app/layout/AppLayout.tsx

import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      {/* TODO: Add header, sidebar, etc. */}
      <main>{children}</main>
    </div>
  )
}
