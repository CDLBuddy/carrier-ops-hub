// carrier-ops-hub/apps/web/src/app/providers/AppProviders.tsx

import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { RouterProvider } from './RouterProvider';

export function AppProviders() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider />
      </AuthProvider>
    </QueryProvider>
  );
}
