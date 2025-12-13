// carrier-ops-hub/apps/web/src/app/routing/routes/driver/home.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/driver/home')({
  component: DriverHomePage,
});

function DriverHomePage() {
  return (
    <div>
      <h1>Driver Home</h1>
      {/* TODO: Implement driver home view */}
    </div>
  );
}
