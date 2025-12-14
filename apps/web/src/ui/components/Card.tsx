// carrier-ops-hub/apps/web/src/ui/components/Card.tsx

import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
}

export function Card({ children, title }: CardProps) {
  return (
    <div className="card">
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  )
}
