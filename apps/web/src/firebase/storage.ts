// carrier-ops-hub/apps/web/src/firebase/storage.ts

import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { firebaseApp } from './app'

export const storage = getStorage(firebaseApp)

// Connect to Storage Emulator in development mode only
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectStorageEmulator(storage, 'localhost', 9199)
}
