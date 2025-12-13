// carrier-ops-hub/apps/web/src/app/providers/AuthProvider.tsx

import { useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // TODO: Load user profile from Firestore
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
