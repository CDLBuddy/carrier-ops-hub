// carrier-ops-hub/apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dispatch/loads/$loadId')({
  component: LoadDetailPage,
});

function LoadDetailPage() {
  const { loadId } = Route.useParams();
  
  return (
    <div>
      <h1>Load Detail: {loadId}</h1>
      {/* TODO: Implement load detail view */}
    </div>
  );
}
