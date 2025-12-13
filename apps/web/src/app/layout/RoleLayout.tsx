// carrier-ops-hub/apps/web/src/app/layout/RoleLayout.tsx

import type { ReactNode } from 'react';

interface RoleLayoutProps {
  children: ReactNode;
  role: string;
}

export function RoleLayout({ children, role }: RoleLayoutProps) {
  return (
    <div className="role-layout" data-role={role}>
      {/* TODO: Add role-specific navigation */}
      {children}
    </div>
  );
}
