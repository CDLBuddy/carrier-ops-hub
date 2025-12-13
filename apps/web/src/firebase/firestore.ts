// carrier-ops-hub/apps/web/src/firebase/firestore.ts

import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { app } from './app';

export const db = getFirestore(app);

// Connect to emulator in development
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
