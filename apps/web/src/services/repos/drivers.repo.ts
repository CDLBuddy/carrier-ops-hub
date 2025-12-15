// carrier-ops-hub/apps/web/src/services/repos/drivers.repo.ts

import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firestore'
import { COLLECTIONS } from '@coh/shared'
import { withDocId, assertFleetMatch } from './repoUtils'

export interface DriverData {
  id: string
  fleetId: string
  firstName: string
  lastName: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: number
  phoneNumber?: string
  status: string
  driverId?: string
  createdAt?: number
  updatedAt?: number
  [key: string]: unknown
}

export const driversRepo = {
  async listByFleet({ fleetId, limit: limitCount }: { fleetId: string; limit?: number }) {
    const driversRef = collection(db, COLLECTIONS.DRIVERS)
    const q = limitCount
      ? query(driversRef, where('fleetId', '==', fleetId), limit(limitCount))
      : query(driversRef, where('fleetId', '==', fleetId))

    const snapshot = await getDocs(q)
    const drivers = snapshot.docs.map((snap) => withDocId<DriverData>(snap))

    // Client-side sort: ACTIVE first, then lastName, then firstName
    return drivers.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
      const lastNameCmp = (a.lastName || '').localeCompare(b.lastName || '')
      if (lastNameCmp !== 0) return lastNameCmp
      return (a.firstName || '').localeCompare(b.firstName || '')
    })
  },

  async getById({ fleetId, driverId }: { fleetId: string; driverId: string }) {
    const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId)
    const snapshot = await getDoc(driverRef)

    if (!snapshot.exists()) {
      throw new Error('Driver not found')
    }

    const driver = withDocId<DriverData>(snapshot)
    assertFleetMatch({
      expectedFleetId: fleetId,
      actualFleetId: driver.fleetId,
      entity: 'driver',
      id: driverId,
    })

    return driver
  },
}
