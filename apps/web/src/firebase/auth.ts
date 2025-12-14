// carrier-ops-hub/apps/web/src/firebase/auth.ts

import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { firebaseApp } from './app';

export const auth = getAuth(firebaseApp);

// Connect to Auth Emulator in development mode only
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}
