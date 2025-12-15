// carrier-ops-hub/firebase/emulators/seed/fixtures/fleets.ts

import { now } from './time.js'

export const fleets = [
    {
        id: 'fleet-acme',
        name: 'ACME Trucking Co.',
        dotNumber: '1234567',
        mcNumber: 'MC-987654',
        createdAt: now - 86400000 * 30, // 30 days ago
        updatedAt: now - 86400000 * 30,
    },
    {
        id: 'fleet-beta',
        name: 'Beta Logistics LLC',
        dotNumber: '7654321',
        mcNumber: 'MC-123456',
        createdAt: now - 86400000 * 60, // 60 days ago
        updatedAt: now - 86400000 * 60,
    },
]
