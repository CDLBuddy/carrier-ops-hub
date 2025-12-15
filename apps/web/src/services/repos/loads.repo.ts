// carrier-ops-hub/apps/web/src/services/repos/loads.repo.ts

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/firestore'
import { COLLECTIONS, LOAD_STATUS, EVENT_TYPE } from '@coh/shared'
import { withDocId, assertFleetMatch } from './repoUtils'

export interface LoadData {
  id: string // Added by withDocId
  fleetId: string
  loadNumber?: string
  status: string
  customerName?: string
  referenceNumber?: string
  stops: Array<Record<string, unknown>>
  driverId?: string | null
  vehicleId?: string | null
  rateCents?: number
  notes?: string
}

export const loadsRepo = {
  async listByFleet({ fleetId, limit: limitCount = 50 }: { fleetId: string; limit?: number }) {
    const loadsRef = collection(db, COLLECTIONS.LOADS)
    const q = query(
      loadsRef,
      where('fleetId', '==', fleetId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((snap) => withDocId<LoadData>(snap))
  },

  async getById({ fleetId, loadId }: { fleetId: string; loadId: string }) {
    const loadRef = doc(db, COLLECTIONS.LOADS, loadId)
    const snapshot = await getDoc(loadRef)

    if (!snapshot.exists()) {
      throw new Error('Load not found')
    }

    const load = withDocId<LoadData>(snapshot)
    assertFleetMatch({
      expectedFleetId: fleetId,
      actualFleetId: load.fleetId,
      entity: 'load',
      id: loadId,
    })

    return load
  },

  async updateLoad({
    loadId,
    updates,
  }: {
    fleetId?: string
    loadId: string
    updates: Partial<LoadData>
  }) {
    const loadRef = doc(db, COLLECTIONS.LOADS, loadId)

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    }

    await updateDoc(loadRef, updateData)
    return { id: loadId, ...updateData }
  },

  async createLoad({ fleetId, load }: { fleetId: string; load: Partial<LoadData> }) {
    const loadsRef = collection(db, COLLECTIONS.LOADS)
    const now = Date.now()

    const loadData = {
      fleetId,
      loadNumber: load.loadNumber || `LOAD-${Date.now()}`,
      status: load.status || 'UNASSIGNED',
      customerName: load.customerName || '',
      referenceNumber: load.referenceNumber || '',
      stops: load.stops || [],
      driverId: load.driverId || null,
      vehicleId: load.vehicleId || null,
      rateCents: load.rateCents || 0,
      notes: load.notes || '',
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(loadsRef, loadData)
    return { id: docRef.id, ...loadData }
  },

  async assignLoad({
    fleetId,
    loadId,
    driverId,
    vehicleId,
    actorUid,
  }: {
    fleetId: string
    loadId: string
    driverId: string
    vehicleId: string
    actorUid: string
  }) {
    const batch = writeBatch(db)
    const now = Date.now()

    // Update load
    const loadRef = doc(db, COLLECTIONS.LOADS, loadId)
    batch.update(loadRef, {
      driverId,
      vehicleId,
      status: LOAD_STATUS.ASSIGNED,
      updatedAt: now,
    })

    // Create LOAD_ASSIGNED event
    const eventsRef = collection(db, COLLECTIONS.EVENTS)
    const eventRef = doc(eventsRef)
    batch.set(eventRef, {
      fleetId,
      loadId,
      type: EVENT_TYPE.LOAD_ASSIGNED,
      actorUid,
      createdAt: now,
      payload: { driverId, vehicleId },
    })

    await batch.commit()

    return {
      id: loadId,
      driverId,
      vehicleId,
      status: LOAD_STATUS.ASSIGNED,
      updatedAt: now,
    }
  },
}
