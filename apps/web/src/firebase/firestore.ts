// carrier-ops-hub/apps/web/src/firebase/firestore.ts

import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseApp } from './app';

export const db = getFirestore(firebaseApp);

// Connect to Firestore Emulator in development mode only
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, 'localhost', 8080);
}
