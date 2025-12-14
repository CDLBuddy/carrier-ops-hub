// carrier-ops-hub/apps/functions/src/firebaseAdmin.ts

import * as admin from 'firebase-admin'

admin.initializeApp()

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
export const adminStorage = admin.storage()

// Legacy exports for compatibility
export const db = adminDb
export const auth = adminAuth
export const storage = adminStorage
