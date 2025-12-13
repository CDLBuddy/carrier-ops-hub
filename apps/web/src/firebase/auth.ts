// carrier-ops-hub/apps/web/src/firebase/auth.ts

import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { app } from './app';

export const auth = getAuth(app);

// Connect to emulator in development
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
