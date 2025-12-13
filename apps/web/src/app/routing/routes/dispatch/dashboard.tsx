// carrier-ops-hub/apps/web/src/app/routing/routes/dispatch/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dispatch/dashboard')({
  component: DispatchDashboard,
});

function DispatchDashboard() {
  return (
    <div>
      <h1>Dispatch Dashboard</h1>
      {/* TODO: Implement dispatch dashboard */}
    </div>
  );
}
