// carrier-ops-hub/apps/web/src/app/routing/routes/auth/sign-in.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      {/* TODO: Implement sign-in form */}
    </div>
  );
}
