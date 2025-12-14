// carrier-ops-hub/apps/web/src/services/repos/loads.repo.ts

import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { COLLECTIONS } from '@coh/shared';

export interface LoadData {
    fleetId: string;
    loadNumber?: string;
    status: string;
    customerName?: string;
    referenceNumber?: string;
    stops: any[];
    driverId?: string | null;
    vehicleId?: string | null;
    rateCents?: number;
    notes?: string;
}

export const loadsRepo = {
    async listByFleet({ fleetId, limit: limitCount = 50 }: { fleetId: string; limit?: number }) {
        const loadsRef = collection(db, COLLECTIONS.LOADS);
        const q = query(
            loadsRef,
            where('fleetId', '==', fleetId),
            orderBy('updatedAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },

    async createLoad({ fleetId, load }: { fleetId: string; load: Partial<LoadData> }) {
        const loadsRef = collection(db, COLLECTIONS.LOADS);
        const now = Date.now();

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
        };

        const docRef = await addDoc(loadsRef, loadData);
        return { id: docRef.id, ...loadData };
    },
};
