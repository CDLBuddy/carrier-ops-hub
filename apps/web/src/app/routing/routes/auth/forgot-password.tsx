// carrier-ops-hub/apps/web/src/app/routing/routes/auth/forgot-password.tsx

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div>
      <h1>Forgot Password</h1>
      {/* TODO: Implement forgot password form */}
    </div>
  );
}
