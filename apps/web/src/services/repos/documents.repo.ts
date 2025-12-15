// carrier-ops-hub/apps/web/src/services/repos/documents.repo.ts

import { collection, query, where, orderBy, doc, getDocs, writeBatch } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '@/firebase/firestore'
import { storage } from '@/firebase/storage'
import { COLLECTIONS, DOCUMENT_TYPE, EVENT_TYPE } from '@coh/shared'
import { withDocId } from './repoUtils'

export interface DocumentData {
  id: string
  fleetId: string
  loadId: string
  type: string
  fileName: string
  storagePath: string
  url: string
  contentType: string
  size: number
  uploadedBy: string
  notes?: string
  amount?: number
  createdAt: number
  updatedAt: number
}

export interface UploadDocumentParams {
  fleetId: string
  loadId: string
  file: File
  docType: (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]
  actorUid: string
  notes?: string
  amount?: number
}

export const documentsRepo = {
  async listForLoad({ fleetId, loadId }: { fleetId: string; loadId: string }) {
    const docsRef = collection(db, COLLECTIONS.DOCUMENTS)
    const q = query(
      docsRef,
      where('fleetId', '==', fleetId),
      where('loadId', '==', loadId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((snap) => withDocId<DocumentData>(snap))
  },

  async upload({ fleetId, loadId, file, docType, actorUid, notes, amount }: UploadDocumentParams) {
    const docsRef = collection(db, COLLECTIONS.DOCUMENTS)
    const docRef = doc(docsRef)
    const docId = docRef.id

    // Upload to Storage (not atomic with Firestore, but this is unavoidable)
    const storagePath = `fleets/${fleetId}/loads/${loadId}/docs/${docId}-${file.name}`
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)

    // Get download URL
    const url = await getDownloadURL(storageRef)

    // Prepare document data
    const now = Date.now()
    const document = {
      fleetId,
      loadId,
      type: docType,
      fileName: file.name,
      storagePath,
      url,
      contentType: file.type,
      size: file.size,
      uploadedBy: actorUid,
      createdAt: now,
      updatedAt: now,
      ...(notes !== undefined && { notes }),
      ...(amount !== undefined && { amount }),
    }

    // Atomic batch: document + event
    const batch = writeBatch(db)

    // Create document
    batch.set(docRef, document)

    // Create event
    const eventsRef = collection(db, COLLECTIONS.EVENTS)
    const eventRef = doc(eventsRef)
    batch.set(eventRef, {
      fleetId,
      loadId,
      type: EVENT_TYPE.DOCUMENT_UPLOADED,
      actorUid,
      createdAt: now,
      payload: { documentId: docId, type: docType, fileName: file.name },
    })

    await batch.commit()

    return { id: docId, ...document }
  },

  async getByLoadId(_loadId: string) {
    // Legacy method - use listForLoad instead
    return []
  },

  async delete(_documentId: string) {
    // TODO: Delete document
    throw new Error('Not implemented')
  },
}
