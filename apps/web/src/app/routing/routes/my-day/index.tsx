// carrier-ops-hub/apps/web/src/app/routing/routes/my-day/index.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/my-day/')({
  component: MyDayPage,
});

function MyDayPage() {
  return (
    <div>
      <h1>My Day</h1>
      {/* TODO: Implement my day dashboard */}
    </div>
  );
}
