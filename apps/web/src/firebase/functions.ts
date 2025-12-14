// carrier-ops-hub/apps/web/src/firebase/functions.ts

import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { firebaseApp } from './app'

export const functions = getFunctions(firebaseApp)

// Connect to Functions Emulator in development mode only
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}
