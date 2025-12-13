// carrier-ops-hub/apps/web/src/app/routing/routes/safety/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/safety/dashboard')({
  component: SafetyDashboard,
});

function SafetyDashboard() {
  return (
    <div>
      <h1>Safety Dashboard</h1>
      {/* TODO: Implement safety dashboard */}
    </div>
  );
}
