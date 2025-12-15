// carrier-ops-hub/firebase/emulators/seed/fixtures/documents.ts

import { DocumentSchema, type Document as DocType, DOCUMENT_TYPE } from '@coh/shared'
import { now } from './time.js'

export const documents: DocType[] = [
    {
        id: 'doc-1',
        fleetId: 'fleet-acme',
        loadId: 'load-assigned',
        type: DOCUMENT_TYPE.BOL,
        fileName: 'BOL-LOAD-2025-002.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-assigned/docs/doc-1-BOL-LOAD-2025-002.pdf', // ✅ Follows contract
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-assigned/docs/doc-1-BOL-LOAD-2025-002.pdf',
        contentType: 'application/pdf', // ✅ Allowed MIME
        size: 245760, // 240KB (well under 15MB limit)
        uploadedBy: 'dispatcher-1',
        notes: 'Signed BOL from shipper',
        createdAt: now - 86400000 * 1,
        updatedAt: now - 86400000 * 1,
    },
    {
        id: 'doc-2',
        fleetId: 'fleet-acme',
        loadId: 'load-in-transit',
        type: DOCUMENT_TYPE.RATE_CONFIRMATION,
        fileName: 'RateConfirmation-LOAD-003.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-in-transit/docs/doc-2-RateConfirmation-LOAD-003.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-in-transit/docs/doc-2-RateConfirmation-LOAD-003.pdf',
        contentType: 'application/pdf', // ✅ Allowed MIME
        size: 102400, // 100KB
        uploadedBy: 'dispatcher-1',
        amount: 120000, // $1,200.00 (matches load rateCents)
        createdAt: now - 86400000 * 4,
        updatedAt: now - 86400000 * 4,
    },
    {
        id: 'doc-3',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: DOCUMENT_TYPE.POD,
        fileName: 'POD-LOAD-2025-006.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-delivered-ready/docs/doc-3-POD-LOAD-2025-006.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-delivered-ready/docs/doc-3-POD-LOAD-2025-006.pdf',
        contentType: 'application/pdf',
        size: 198000, // 193KB
        uploadedBy: 'driver-1',
        notes: 'Signed by receiver',
        createdAt: now - 86400000 * 5 + 1200000,
        updatedAt: now - 86400000 * 5 + 1200000,
    },
    {
        id: 'doc-4',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: DOCUMENT_TYPE.RATE_CONFIRMATION,
        fileName: 'RateConfirmation-LOAD-006.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-delivered-ready/docs/doc-4-RateConfirmation-LOAD-006.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-delivered-ready/docs/doc-4-RateConfirmation-LOAD-006.pdf',
        contentType: 'application/pdf',
        size: 105000, // 102KB
        uploadedBy: 'dispatcher-1',
        amount: 275000, // $2,750.00 (matches load rateCents)
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 10,
    },
    {
        id: 'doc-5',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: DOCUMENT_TYPE.RATE_CONFIRMATION,
        fileName: 'RateConfirmation-LOAD-007.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-delivered-blocked/docs/doc-5-RateConfirmation-LOAD-007.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-delivered-blocked/docs/doc-5-RateConfirmation-LOAD-007.pdf',
        contentType: 'application/pdf',
        size: 98000, // 95KB
        uploadedBy: 'dispatcher-1',
        amount: 165000, // $1,650.00 (matches load rateCents)
        createdAt: now - 86400000 * 12,
        updatedAt: now - 86400000 * 12,
    },
    {
        id: 'doc-6',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: DOCUMENT_TYPE.BOL,
        fileName: 'BOL-LOAD-2025-005.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-at-delivery/docs/doc-6-BOL-LOAD-2025-005.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-at-delivery/docs/doc-6-BOL-LOAD-2025-005.pdf',
        contentType: 'application/pdf',
        size: 215000, // 210KB
        uploadedBy: 'driver-2',
        notes: 'BOL from pickup location',
        createdAt: now - 86400000 * 2 + 1800000,
        updatedAt: now - 86400000 * 2 + 1800000,
    },
    {
        id: 'doc-7',
        fleetId: 'fleet-acme',
        loadId: 'load-at-pickup',
        type: DOCUMENT_TYPE.RATE_CONFIRMATION,
        fileName: 'RateConfirmation-LOAD-004.pdf',
        storagePath: 'fleets/fleet-acme/loads/load-at-pickup/docs/doc-7-RateConfirmation-LOAD-004.pdf',
        url: 'https://storage.googleapis.com/carrier-ops-hub-test.appspot.com/fleets/fleet-acme/loads/load-at-pickup/docs/doc-7-RateConfirmation-LOAD-004.pdf',
        contentType: 'application/pdf',
        size: 112000, // 109KB
        uploadedBy: 'dispatcher-1',
        amount: 195000, // $1,950.00 (matches load rateCents)
        createdAt: now - 86400000 * 1,
        updatedAt: now - 86400000 * 1,
    },
]

// Validate all documents
documents.forEach((doc) => DocumentSchema.parse(doc))
