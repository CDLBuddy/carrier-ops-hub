// carrier-ops-hub/apps/web/src/firebase/storage.ts

import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { app } from './app';

export const storage = getStorage(app);

// Connect to emulator in development
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectStorageEmulator(storage, 'localhost', 9199);
}
