// carrier-ops-hub/apps/functions/src/callable/bootstrapFleet.ts

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { adminDb, adminAuth } from '../firebaseAdmin'
import { COLLECTIONS } from '@coh/shared'

export const bootstrapFleet = onCall(async (request) => {
  // Reject if not authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated')
  }

  // Only allow in emulator/dev
  const isEmulator = process.env.FIREBASE_EMULATOR_HUB || process.env.FUNCTIONS_EMULATOR === 'true'
  if (!isEmulator) {
    throw new HttpsError('failed-precondition', 'Bootstrap only available in emulator/dev')
  }

  const { fleetName, roles } = request.data

  // Validate input
  if (!fleetName || typeof fleetName !== 'string' || fleetName.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'fleetName is required')
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    throw new HttpsError('invalid-argument', 'roles must be a non-empty array')
  }

  const uid = request.auth.uid
  const now = Date.now()

  try {
    // Create fleet document
    const fleetRef = adminDb.collection(COLLECTIONS.FLEETS).doc()
    const fleetId = fleetRef.id

    await fleetRef.set({
      id: fleetId,
      name: fleetName.trim(),
      createdAt: now,
      updatedAt: now,
    })

    // Prepare user data
    const userData: any = {
      id: uid,
      fleetId,
      roles,
      createdAt: now,
      updatedAt: now,
    }

    // If user is a driver, create driver document
    let driverId: string | undefined
    if (roles.includes('driver')) {
      driverId = uid // Simple mapping: driverId = uid
      const driverRef = adminDb.collection(COLLECTIONS.DRIVERS).doc(driverId)
      await driverRef.set({
        id: driverId,
        fleetId,
        userId: uid,
        firstName: '',
        lastName: '',
        licenseNumber: '',
        licenseState: '',
        phoneNumber: '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      userData.driverId = driverId
    }

    // Create/update user document
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid)
    await userRef.set(userData, { merge: true })

    // Set custom claims
    const customClaims: any = {
      fleetId,
      roles,
    }
    if (driverId) {
      customClaims.driverId = driverId
    }

    await adminAuth.setCustomUserClaims(uid, customClaims)

    return {
      fleetId,
      roles,
      driverId,
    }
  } catch (error) {
    console.error('Error in bootstrapFleet:', error)
    throw new HttpsError('internal', 'Failed to bootstrap fleet')
  }
})
