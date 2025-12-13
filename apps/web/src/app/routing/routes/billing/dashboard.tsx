// carrier-ops-hub/apps/web/src/app/routing/routes/billing/dashboard.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/billing/dashboard')({
  component: BillingDashboard,
});

function BillingDashboard() {
  return (
    <div>
      <h1>Billing Dashboard</h1>
      {/* TODO: Implement billing dashboard */}
    </div>
  );
}
