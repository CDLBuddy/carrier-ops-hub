// carrier-ops-hub/apps/web/src/services/repos/events.repo.ts

import { collection, query, where, orderBy, limit, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/firestore'
import { COLLECTIONS, type EventType } from '@coh/shared'

export interface CreateEventParams {
  fleetId: string
  loadId: string
  type: EventType
  actorUid: string
  payload?: Record<string, unknown>
}

export const eventsRepo = {
  async listForLoad({
    fleetId,
    loadId,
    limit: maxResults = 50,
  }: {
    fleetId: string
    loadId: string
    limit?: number
  }) {
    const eventsRef = collection(db, COLLECTIONS.EVENTS)
    const q = query(
      eventsRef,
      where('fleetId', '==', fleetId),
      where('loadId', '==', loadId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  async create({ fleetId, loadId, type, actorUid, payload }: CreateEventParams) {
    const eventsRef = collection(db, COLLECTIONS.EVENTS)
    const event = {
      fleetId,
      loadId,
      type,
      actorUid,
      createdAt: Date.now(),
      ...(payload && { payload }),
    }

    const docRef = await addDoc(eventsRef, event)
    return { id: docRef.id, ...event }
  },
}
