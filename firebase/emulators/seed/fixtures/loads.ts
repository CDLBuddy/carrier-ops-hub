// carrier-ops-hub/firebase/emulators/seed/fixtures/loads.ts

import { LoadSchema, type Load, LOAD_STATUS } from '@coh/shared'
import { now } from './time.js'

const pickupDate = now + 86400000 * 2 // 2 days from now
const deliveryDate = now + 86400000 * 5 // 5 days from now

export const loads: Load[] = [
    {
        id: 'load-unassigned',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-001',
        status: LOAD_STATUS.UNASSIGNED,
        driverId: null, // ✅ Canonical field
        vehicleId: null, // ✅ Canonical field
        stops: [
            {
                id: 'stop-1-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '123 Warehouse Dr',
                    city: 'Los Angeles',
                    state: 'CA',
                    zip: '90001',
                    country: 'US',
                },
                scheduledTime: pickupDate,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 3,
                updatedAt: now - 86400000 * 3,
            },
            {
                id: 'stop-1-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '456 Distribution Blvd',
                    city: 'Dallas',
                    state: 'TX',
                    zip: '75001',
                    country: 'US',
                },
                scheduledTime: deliveryDate,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 3,
                updatedAt: now - 86400000 * 3,
            },
        ],
        pickupDate,
        deliveryDate,
        rateCents: 250000, // $2,500.00
        notes: 'Fragile cargo - handle with care',
        createdAt: now - 86400000 * 3,
        updatedAt: now - 86400000 * 3,
    },
    {
        id: 'load-assigned',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-002',
        status: LOAD_STATUS.ASSIGNED,
        driverId: 'driver-1', // ✅ Canonical field (matches driver id)
        vehicleId: 'vehicle-1', // ✅ Canonical field (matches vehicle id)
        stops: [
            {
                id: 'stop-2-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '789 Factory Ln',
                    city: 'Phoenix',
                    state: 'AZ',
                    zip: '85001',
                    country: 'US',
                },
                scheduledTime: pickupDate - 86400000,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 2,
                updatedAt: now - 86400000 * 1,
            },
            {
                id: 'stop-2-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '321 Retail Center',
                    city: 'Las Vegas',
                    state: 'NV',
                    zip: '89101',
                    country: 'US',
                },
                scheduledTime: deliveryDate - 86400000,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 2,
                updatedAt: now - 86400000 * 1,
            },
        ],
        pickupDate: pickupDate - 86400000,
        deliveryDate: deliveryDate - 86400000,
        rateCents: 180000, // $1,800.00
        notes: null,
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 1,
    },
    {
        id: 'load-in-transit',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-003',
        status: LOAD_STATUS.IN_TRANSIT,
        driverId: 'driver-2', // ✅ Canonical field
        vehicleId: 'vehicle-2', // ✅ Canonical field
        stops: [
            {
                id: 'stop-3-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '555 Port Ave',
                    city: 'Long Beach',
                    state: 'CA',
                    zip: '90802',
                    country: 'US',
                },
                scheduledTime: now - 86400000,
                actualTime: now - 86400000 + 3600000, // 1 hour after scheduled
                isCompleted: true,
                createdAt: now - 86400000 * 4,
                updatedAt: now - 86400000 + 3600000,
            },
            {
                id: 'stop-3-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '888 Commerce Dr',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94102',
                    country: 'US',
                },
                scheduledTime: now + 86400000,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 4,
                updatedAt: now - 3600000,
            },
        ],
        pickupDate: now - 86400000,
        deliveryDate: now + 86400000,
        rateCents: 120000, // $1,200.00
        notes: 'Rush delivery - customer priority',
        createdAt: now - 86400000 * 4,
        updatedAt: now - 3600000, // 1 hour ago
    },
    {
        id: 'load-at-pickup',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-004',
        status: LOAD_STATUS.AT_PICKUP,
        driverId: 'driver-1',
        vehicleId: 'vehicle-1',
        stops: [
            {
                id: 'stop-4-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '100 Manufacturing Way',
                    city: 'San Diego',
                    state: 'CA',
                    zip: '92101',
                    country: 'US',
                },
                scheduledTime: now - 7200000, // 2 hours ago
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 1,
                updatedAt: now - 3600000,
            },
            {
                id: 'stop-4-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '200 Business Park Dr',
                    city: 'Tucson',
                    state: 'AZ',
                    zip: '85701',
                    country: 'US',
                },
                scheduledTime: now + 86400000 * 2,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 1,
                updatedAt: now - 86400000 * 1,
            },
        ],
        pickupDate: now - 7200000,
        deliveryDate: now + 86400000 * 2,
        rateCents: 195000, // $1,950.00
        notes: null,
        createdAt: now - 86400000 * 1,
        updatedAt: now - 3600000,
    },
    {
        id: 'load-at-delivery',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-005',
        status: LOAD_STATUS.AT_DELIVERY,
        driverId: 'driver-2',
        vehicleId: 'vehicle-2',
        stops: [
            {
                id: 'stop-5-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '300 Logistics Center',
                    city: 'Sacramento',
                    state: 'CA',
                    zip: '95814',
                    country: 'US',
                },
                scheduledTime: now - 86400000 * 2,
                actualTime: now - 86400000 * 2 + 1800000, // 30 min after scheduled
                isCompleted: true,
                createdAt: now - 86400000 * 5,
                updatedAt: now - 86400000 * 2 + 1800000,
            },
            {
                id: 'stop-5-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '400 Warehouse Rd',
                    city: 'Reno',
                    state: 'NV',
                    zip: '89501',
                    country: 'US',
                },
                scheduledTime: now - 3600000, // 1 hour ago
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 5,
                updatedAt: now - 7200000,
            },
        ],
        pickupDate: now - 86400000 * 2,
        deliveryDate: now - 3600000,
        rateCents: 145000, // $1,450.00
        notes: 'Customer waiting on site',
        createdAt: now - 86400000 * 5,
        updatedAt: now - 7200000,
    },
    {
        id: 'load-delivered-ready',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-006',
        status: LOAD_STATUS.DELIVERED,
        driverId: 'driver-1',
        vehicleId: 'vehicle-1',
        stops: [
            {
                id: 'stop-6-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '500 Industrial Pkwy',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                scheduledTime: now - 86400000 * 7,
                actualTime: now - 86400000 * 7 + 900000, // 15 min after scheduled
                isCompleted: true,
                createdAt: now - 86400000 * 10,
                updatedAt: now - 86400000 * 7 + 900000,
            },
            {
                id: 'stop-6-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '600 Distribution Way',
                    city: 'Seattle',
                    state: 'WA',
                    zip: '98101',
                    country: 'US',
                },
                scheduledTime: now - 86400000 * 5,
                actualTime: now - 86400000 * 5 + 1200000, // 20 min after scheduled
                isCompleted: true,
                createdAt: now - 86400000 * 10,
                updatedAt: now - 86400000 * 5 + 1200000,
            },
        ],
        pickupDate: now - 86400000 * 7,
        deliveryDate: now - 86400000 * 5,
        rateCents: 275000, // $2,750.00
        notes: 'Delivered successfully - customer signed',
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 5 + 1200000,
    },
    {
        id: 'load-delivered-blocked',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-007',
        status: LOAD_STATUS.DELIVERED,
        driverId: 'driver-2',
        vehicleId: 'vehicle-2',
        stops: [
            {
                id: 'stop-7-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '700 Cargo Terminal',
                    city: 'Oakland',
                    state: 'CA',
                    zip: '94601',
                    country: 'US',
                },
                scheduledTime: now - 86400000 * 8,
                actualTime: now - 86400000 * 8,
                isCompleted: true,
                createdAt: now - 86400000 * 12,
                updatedAt: now - 86400000 * 8,
            },
            {
                id: 'stop-7-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '800 Receiver Blvd',
                    city: 'Fresno',
                    state: 'CA',
                    zip: '93701',
                    country: 'US',
                },
                scheduledTime: now - 86400000 * 6,
                actualTime: now - 86400000 * 6 + 3600000, // 1 hour after scheduled
                isCompleted: true,
                createdAt: now - 86400000 * 12,
                updatedAt: now - 86400000 * 6 + 3600000,
            },
        ],
        pickupDate: now - 86400000 * 8,
        deliveryDate: now - 86400000 * 6,
        rateCents: 165000, // $1,650.00
        notes: 'Missing POD - driver needs to upload',
        createdAt: now - 86400000 * 12,
        updatedAt: now - 86400000 * 6 + 3600000,
    },
    {
        id: 'load-cancelled',
        fleetId: 'fleet-acme',
        loadNumber: 'LOAD-2025-008',
        status: LOAD_STATUS.CANCELLED,
        driverId: null,
        vehicleId: null,
        stops: [
            {
                id: 'stop-8-pickup',
                type: 'PICKUP',
                sequence: 0,
                address: {
                    street: '900 Shipper Lane',
                    city: 'Bakersfield',
                    state: 'CA',
                    zip: '93301',
                    country: 'US',
                },
                scheduledTime: now + 86400000 * 3,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 6,
                updatedAt: now - 86400000 * 1,
            },
            {
                id: 'stop-8-delivery',
                type: 'DELIVERY',
                sequence: 1,
                address: {
                    street: '1000 Consignee Dr',
                    city: 'San Jose',
                    state: 'CA',
                    zip: '95101',
                    country: 'US',
                },
                scheduledTime: now + 86400000 * 5,
                actualTime: null,
                isCompleted: false,
                createdAt: now - 86400000 * 6,
                updatedAt: now - 86400000 * 1,
            },
        ],
        pickupDate: now + 86400000 * 3,
        deliveryDate: now + 86400000 * 5,
        rateCents: 225000, // $2,250.00
        notes: 'Cancelled by shipper - load no longer needed',
        createdAt: now - 86400000 * 6,
        updatedAt: now - 86400000 * 1,
    },
]

// Validate all loads - this will be called by validators module
export function validateLoads(): void {
    loads.forEach((load) => {
        // Validate forbidden fields
        const forbidden = ['assignedDriverUid', 'assignedVehicleId']
        const found = forbidden.filter((key) => key in load)
        if (found.length > 0) {
            throw new Error(
                `FORBIDDEN FIELDS DETECTED in ${load.id}: ${found.join(', ')}. ` +
                `Use canonical fields: driverId, vehicleId.`
            )
        }

        // Validate schema
        LoadSchema.parse(load)
    })
}

// Run validation on module load
validateLoads()
