// carrier-ops-hub/apps/web/src/services/repos/vehicles.repo.ts

import { collection, query, where, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firestore'
import { COLLECTIONS } from '@coh/shared'

export interface VehicleData {
    id: string
    fleetId: string
    vehicleNumber: string
    vin?: string
    year?: number
    make?: string
    model?: string
    licensePlate?: string
    status: string
    createdAt?: number
    updatedAt?: number
    [key: string]: unknown
}

export const vehiclesRepo = {
    async listByFleet({ fleetId, limit: limitCount }: { fleetId: string; limit?: number }) {
        const vehiclesRef = collection(db, COLLECTIONS.VEHICLES)
        const q = limitCount
            ? query(vehiclesRef, where('fleetId', '==', fleetId), limit(limitCount))
            : query(vehiclesRef, where('fleetId', '==', fleetId))

        const snapshot = await getDocs(q)
        const vehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VehicleData))

        // Client-side sort: ACTIVE first, then vehicleNumber
        return vehicles.sort((a, b) => {
            if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
            if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
            return (a.vehicleNumber || '').localeCompare(b.vehicleNumber || '')
        })
    },

    async getById({ fleetId, vehicleId }: { fleetId: string; vehicleId: string }) {
        const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId)
        const snapshot = await getDoc(vehicleRef)

        if (!snapshot.exists()) {
            throw new Error('Vehicle not found')
        }

        const data = snapshot.data() as Omit<VehicleData, 'id'>
        if (data.fleetId !== fleetId) {
            throw new Error('Unauthorized access to vehicle')
        }

        return { ...data, id: snapshot.id } as VehicleData
    },
}
