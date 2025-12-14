// carrier-ops-hub/firebase/emulators/seed/fixtures.ts

import {
    LoadSchema,
    EventSchema,
    DocumentSchema,
    DriverSchema,
    VehicleSchema,
    UserSchema,
    type Load,
    type Event,
    type Document as DocType,
    type Driver,
    type Vehicle,
    type User,
} from '@coh/shared'
import { LOAD_STATUS, DOCUMENT_TYPE, EVENT_TYPE } from '@coh/shared'

/**
 * SEED CONTRACT v1.0.0
 * 
 * This file contains validated fixtures for Firebase emulator seeding.
 * All data MUST pass Zod validation and referential integrity checks.
 * 
 * See: docs/seed-contract.md
 */

// ============================================================================
// FORBIDDEN FIELDS VALIDATOR
// ============================================================================

/**
 * Throws if load contains deprecated assignment fields.
 * Phase 5.0.1 eliminated the assignedDriverUid/assignedVehicleId fork.
 */
function validateNoForbiddenFields(load: Record<string, unknown>): void {
    const forbidden = ['assignedDriverUid', 'assignedVehicleId']
    const found = forbidden.filter((key) => key in load)

    if (found.length > 0) {
        throw new Error(
            `FORBIDDEN FIELDS DETECTED: ${found.join(', ')}. ` +
            `Use canonical fields: driverId, vehicleId. ` +
            `See docs/seed-contract.md for details.`
        )
    }
}

// ============================================================================
// AUTH CLAIMS (for test users)
// ============================================================================

export interface TestUserClaims {
    fleetId: string
    roles: string[]
    driverId?: string // Required for drivers, MUST === uid
}

export const testUserClaims: Record<string, TestUserClaims> = {
    'owner-1': {
        fleetId: 'fleet-acme',
        roles: ['owner'],
    },
    'dispatcher-1': {
        fleetId: 'fleet-acme',
        roles: ['dispatcher'],
    },
    'driver-1': {
        fleetId: 'fleet-acme',
        roles: ['driver'],
        driverId: 'driver-1', // MUST match uid
    },
    'driver-2': {
        fleetId: 'fleet-acme',
        roles: ['driver'],
        driverId: 'driver-2', // MUST match uid
    },
    'billing-1': {
        fleetId: 'fleet-acme',
        roles: ['billing'],
    },
}

// ============================================================================
// FLEETS
// ============================================================================

export const fleets = [
    {
        id: 'fleet-acme',
        name: 'ACME Trucking Co.',
        dotNumber: '1234567',
        mcNumber: 'MC-987654',
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
        updatedAt: Date.now() - 86400000 * 30,
    },
    {
        id: 'fleet-beta',
        name: 'Beta Logistics LLC',
        dotNumber: '7654321',
        mcNumber: 'MC-123456',
        createdAt: Date.now() - 86400000 * 60, // 60 days ago
        updatedAt: Date.now() - 86400000 * 60,
    },
]

// ============================================================================
// USERS
// ============================================================================

const now = Date.now()

export const users: User[] = [
    {
        id: 'owner-1',
        email: 'owner@acme.test',
        firstName: 'Alice',
        lastName: 'Owner',
        fleetId: 'fleet-acme',
        roles: ['owner'],
        isActive: true,
        createdAt: now - 86400000 * 30,
        updatedAt: now - 86400000 * 30,
    },
    {
        id: 'dispatcher-1',
        email: 'dispatcher@acme.test',
        firstName: 'Bob',
        lastName: 'Dispatcher',
        fleetId: 'fleet-acme',
        roles: ['dispatcher'],
        isActive: true,
        createdAt: now - 86400000 * 20,
        updatedAt: now - 86400000 * 20,
    },
    {
        id: 'driver-1',
        email: 'driver1@acme.test',
        firstName: 'Charlie',
        lastName: 'Driver',
        fleetId: 'fleet-acme',
        roles: ['driver'],
        isActive: true,
        createdAt: now - 86400000 * 15,
        updatedAt: now - 86400000 * 15,
    },
    {
        id: 'driver-2',
        email: 'driver2@acme.test',
        firstName: 'Diana',
        lastName: 'Hauler',
        fleetId: 'fleet-acme',
        roles: ['driver'],
        isActive: true,
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 10,
    },
    {
        id: 'billing-1',
        email: 'billing@acme.test',
        firstName: 'Eve',
        lastName: 'Accountant',
        fleetId: 'fleet-acme',
        roles: ['billing'],
        isActive: true,
        createdAt: now - 86400000 * 25,
        updatedAt: now - 86400000 * 25,
    },
]

// Validate all users
users.forEach((user) => UserSchema.parse(user))

// ============================================================================
// DRIVERS
// ============================================================================

export const drivers: Driver[] = [
    {
        id: 'driver-1',
        fleetId: 'fleet-acme',
        firstName: 'Charlie',
        lastName: 'Driver',
        licenseNumber: 'D1234567',
        licenseState: 'CA',
        licenseExpiry: now + 86400000 * 365, // 1 year from now
        phoneNumber: '+1-555-0101',
        status: 'ACTIVE',
        driverId: 'driver-1',
        createdAt: now - 86400000 * 15,
        updatedAt: now - 86400000 * 15,
    },
    {
        id: 'driver-2',
        fleetId: 'fleet-acme',
        firstName: 'Diana',
        lastName: 'Hauler',
        licenseNumber: 'D7654321',
        licenseState: 'TX',
        licenseExpiry: now + 86400000 * 400, // ~13 months from now
        phoneNumber: '+1-555-0102',
        status: 'INACTIVE',
        driverId: 'driver-2',
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 10,
    },
]

// Validate all drivers
drivers.forEach((driver) => DriverSchema.parse(driver))

// ============================================================================
// VEHICLES
// ============================================================================

export const vehicles: Vehicle[] = [
    {
        id: 'vehicle-1',
        fleetId: 'fleet-acme',
        vehicleNumber: 'TRUCK-001',
        vin: '1HGBH41JXMN109186',
        year: 2022,
        make: 'Freightliner',
        model: 'Cascadia',
        licensePlate: 'CA-TRK-001',
        status: 'ACTIVE',
        createdAt: now - 86400000 * 20,
        updatedAt: now - 86400000 * 2,
    },
    {
        id: 'vehicle-2',
        fleetId: 'fleet-acme',
        vehicleNumber: 'TRUCK-002',
        vin: '1HGBH41JXMN109187',
        year: 2021,
        make: 'Peterbilt',
        model: '579',
        licensePlate: 'TX-TRK-002',
        status: 'ACTIVE',
        createdAt: now - 86400000 * 25,
        updatedAt: now - 86400000 * 3,
    },
    {
        id: 'vehicle-3',
        fleetId: 'fleet-acme',
        vehicleNumber: 'TRUCK-003',
        vin: '1HGBH41JXMN109188',
        year: 2020,
        make: 'Kenworth',
        model: 'T680',
        licensePlate: 'CA-TRK-003',
        status: 'MAINTENANCE',
        createdAt: now - 86400000 * 30,
        updatedAt: now - 86400000 * 1,
    },
]

// Validate all vehicles
vehicles.forEach((vehicle) => VehicleSchema.parse(vehicle))

// ============================================================================
// LOADS
// ============================================================================

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
]

// Validate all loads
loads.forEach((load) => {
    validateNoForbiddenFields(load)
    LoadSchema.parse(load)
})

// ============================================================================
// EVENTS
// ============================================================================

export const events: Event[] = [
    {
        id: 'event-1',
        fleetId: 'fleet-acme',
        loadId: 'load-unassigned',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 3,
        payload: {
            loadNumber: 'LOAD-2025-001',
        },
    },
    {
        id: 'event-2',
        fleetId: 'fleet-acme',
        loadId: 'load-assigned',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 2,
        payload: {
            loadNumber: 'LOAD-2025-002',
        },
    },
    {
        id: 'event-3',
        fleetId: 'fleet-acme',
        loadId: 'load-assigned',
        type: EVENT_TYPE.LOAD_ASSIGNED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 1,
        payload: {
            driverId: 'driver-1',
            vehicleId: 'vehicle-1',
        },
    },
    {
        id: 'event-4',
        fleetId: 'fleet-acme',
        loadId: 'load-in-transit',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 7200000, // 2 hours ago
        payload: {
            previousStatus: LOAD_STATUS.AT_PICKUP,
            newStatus: LOAD_STATUS.IN_TRANSIT,
        },
    },
]

// Validate all events
events.forEach((event) => EventSchema.parse(event))

// ============================================================================
// DOCUMENTS
// ============================================================================

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
]

// Validate all documents
documents.forEach((doc) => DocumentSchema.parse(doc))

// ============================================================================
// REFERENTIAL INTEGRITY CHECKS
// ============================================================================

/**
 * Validates that all foreign keys point to valid records
 * and that related records share the same fleetId.
 */
export function validateReferentialIntegrity(): void {
    const errors: string[] = []

    // Check: Event.loadId exists in loads
    events.forEach((event) => {
        const load = loads.find((l) => l.id === event.loadId)
        if (!load) {
            errors.push(`Event ${event.id}: loadId ${event.loadId} not found in loads`)
        } else if (load.fleetId !== event.fleetId) {
            errors.push(`Event ${event.id}: fleetId mismatch with load ${load.id}`)
        }
    })

    // Check: Document.loadId exists in loads
    documents.forEach((doc) => {
        const load = loads.find((l) => l.id === doc.loadId)
        if (!load) {
            errors.push(`Document ${doc.id}: loadId ${doc.loadId} not found in loads`)
        } else if (load.fleetId !== doc.fleetId) {
            errors.push(`Document ${doc.id}: fleetId mismatch with load ${load.id}`)
        }
    })

    // Check: Load.driverId exists in drivers (if set)
    loads.forEach((load) => {
        if (load.driverId) {
            const driver = drivers.find((d) => d.id === load.driverId)
            if (!driver) {
                errors.push(`Load ${load.id}: driverId ${load.driverId} not found in drivers`)
            } else if (driver.fleetId !== load.fleetId) {
                errors.push(`Load ${load.id}: driver fleetId mismatch`)
            }
        }
    })

    // Check: Load.vehicleId exists in vehicles (if set)
    loads.forEach((load) => {
        if (load.vehicleId) {
            const vehicle = vehicles.find((v) => v.id === load.vehicleId)
            if (!vehicle) {
                errors.push(`Load ${load.id}: vehicleId ${load.vehicleId} not found in vehicles`)
            } else if (vehicle.fleetId !== load.fleetId) {
                errors.push(`Load ${load.id}: vehicle fleetId mismatch`)
            }
        }
    })

    // Check: Drivers should have matching driverId pointing to a user
    drivers.forEach((driver) => {
        if (driver.driverId) {
            const user = users.find(u => u.id === driver.driverId)
            if (!user) {
                errors.push(`Driver ${driver.id}: driverId ${driver.driverId} not found in users`)
            } else if (!user.roles.includes('driver')) {
                errors.push(`Driver ${driver.id}: user ${driver.driverId} does not have 'driver' role`)
            }
        }
    })

    // Check: Unique IDs per collection
    const checkUnique = (collection: Record<string, unknown>[], name: string) => {
        const ids = collection.map((item) => item.id)
        const uniqueIds = new Set(ids)
        if (uniqueIds.size !== ids.length) {
            errors.push(`${name}: Duplicate IDs detected`)
        }
    }

    checkUnique(users, 'users')
    checkUnique(drivers, 'drivers')
    checkUnique(vehicles, 'vehicles')
    checkUnique(loads, 'loads')
    checkUnique(events, 'events')
    checkUnique(documents, 'documents')

    // Check: Storage paths follow contract
    documents.forEach((doc) => {
        const expectedPrefix = `fleets/${doc.fleetId}/loads/${doc.loadId}/docs/`
        if (!doc.storagePath.startsWith(expectedPrefix)) {
            errors.push(
                `Document ${doc.id}: storagePath does not follow contract. ` +
                `Expected prefix: ${expectedPrefix}, Got: ${doc.storagePath}`
            )
        }
    })

    // Check: Document content types are allowed
    const allowedMimeTypes = ['application/pdf', /^image\/.+/]
    documents.forEach((doc) => {
        const isAllowed = allowedMimeTypes.some((pattern) =>
            typeof pattern === 'string' ? doc.contentType === pattern : pattern.test(doc.contentType)
        )
        if (!isAllowed) {
            errors.push(
                `Document ${doc.id}: contentType ${doc.contentType} not allowed. ` +
                `Allowed: application/pdf, image/*`
            )
        }
    })

    // Check: Document sizes under 15MB
    const maxSize = 15 * 1024 * 1024 // 15MB
    documents.forEach((doc) => {
        if (doc.size > maxSize) {
            errors.push(`Document ${doc.id}: size ${doc.size} exceeds 15MB limit`)
        }
    })

    if (errors.length > 0) {
        throw new Error(
            `REFERENTIAL INTEGRITY VIOLATIONS (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join('\n')
        )
    }
}

// Run integrity checks on module load
validateReferentialIntegrity()

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export const fixtures = {
    fleets,
    users,
    drivers,
    vehicles,
    loads,
    events,
    documents,
    testUserClaims,
}

console.log('✅ Seed fixtures validated successfully')
console.log(`   - ${fleets.length} fleets`)
console.log(`   - ${users.length} users`)
console.log(`   - ${drivers.length} drivers`)
console.log(`   - ${vehicles.length} vehicles`)
console.log(`   - ${loads.length} loads`)
console.log(`   - ${events.length} events`)
console.log(`   - ${documents.length} documents`)
console.log(`   - All Zod schemas passed`)
console.log(`   - All referential integrity checks passed`)
console.log(`   - No forbidden fields detected`)
