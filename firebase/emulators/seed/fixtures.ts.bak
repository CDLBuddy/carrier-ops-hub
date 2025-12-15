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
    {
        id: 'event-5',
        fleetId: 'fleet-acme',
        loadId: 'load-at-pickup',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 1,
        payload: {
            loadNumber: 'LOAD-2025-004',
        },
    },
    {
        id: 'event-6',
        fleetId: 'fleet-acme',
        loadId: 'load-at-pickup',
        type: EVENT_TYPE.LOAD_ASSIGNED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 1 + 3600000,
        payload: {
            driverId: 'driver-1',
            vehicleId: 'vehicle-1',
        },
    },
    {
        id: 'event-7',
        fleetId: 'fleet-acme',
        loadId: 'load-at-pickup',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-1',
        createdAt: now - 3600000,
        payload: {
            previousStatus: LOAD_STATUS.ASSIGNED,
            newStatus: LOAD_STATUS.AT_PICKUP,
        },
    },
    {
        id: 'event-8',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 5,
        payload: {
            loadNumber: 'LOAD-2025-005',
        },
    },
    {
        id: 'event-9',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.LOAD_ASSIGNED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 5 + 3600000,
        payload: {
            driverId: 'driver-2',
            vehicleId: 'vehicle-2',
        },
    },
    {
        id: 'event-10',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 2,
        payload: {
            previousStatus: LOAD_STATUS.ASSIGNED,
            newStatus: LOAD_STATUS.AT_PICKUP,
        },
    },
    {
        id: 'event-11',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.STOP_COMPLETED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 2 + 1800000,
        payload: {
            stopId: 'stop-5-pickup',
        },
    },
    {
        id: 'event-12',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 2 + 1800000,
        payload: {
            previousStatus: LOAD_STATUS.AT_PICKUP,
            newStatus: LOAD_STATUS.IN_TRANSIT,
        },
    },
    {
        id: 'event-13',
        fleetId: 'fleet-acme',
        loadId: 'load-at-delivery',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 7200000,
        payload: {
            previousStatus: LOAD_STATUS.IN_TRANSIT,
            newStatus: LOAD_STATUS.AT_DELIVERY,
        },
    },
    {
        id: 'event-14',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 10,
        payload: {
            loadNumber: 'LOAD-2025-006',
        },
    },
    {
        id: 'event-15',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.LOAD_ASSIGNED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 10 + 3600000,
        payload: {
            driverId: 'driver-1',
            vehicleId: 'vehicle-1',
        },
    },
    {
        id: 'event-16',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 7,
        payload: {
            previousStatus: LOAD_STATUS.ASSIGNED,
            newStatus: LOAD_STATUS.AT_PICKUP,
        },
    },
    {
        id: 'event-17',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STOP_COMPLETED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 7 + 900000,
        payload: {
            stopId: 'stop-6-pickup',
        },
    },
    {
        id: 'event-18',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 7 + 900000,
        payload: {
            previousStatus: LOAD_STATUS.AT_PICKUP,
            newStatus: LOAD_STATUS.IN_TRANSIT,
        },
    },
    {
        id: 'event-19',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 5,
        payload: {
            previousStatus: LOAD_STATUS.IN_TRANSIT,
            newStatus: LOAD_STATUS.AT_DELIVERY,
        },
    },
    {
        id: 'event-20',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STOP_COMPLETED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 5 + 1200000,
        payload: {
            stopId: 'stop-6-delivery',
        },
    },
    {
        id: 'event-21',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-ready',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-1',
        createdAt: now - 86400000 * 5 + 1200000,
        payload: {
            previousStatus: LOAD_STATUS.AT_DELIVERY,
            newStatus: LOAD_STATUS.DELIVERED,
        },
    },
    {
        id: 'event-22',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 12,
        payload: {
            loadNumber: 'LOAD-2025-007',
        },
    },
    {
        id: 'event-23',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.LOAD_ASSIGNED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 12 + 3600000,
        payload: {
            driverId: 'driver-2',
            vehicleId: 'vehicle-2',
        },
    },
    {
        id: 'event-24',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 8,
        payload: {
            previousStatus: LOAD_STATUS.ASSIGNED,
            newStatus: LOAD_STATUS.AT_PICKUP,
        },
    },
    {
        id: 'event-25',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STOP_COMPLETED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 8,
        payload: {
            stopId: 'stop-7-pickup',
        },
    },
    {
        id: 'event-26',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 8,
        payload: {
            previousStatus: LOAD_STATUS.AT_PICKUP,
            newStatus: LOAD_STATUS.IN_TRANSIT,
        },
    },
    {
        id: 'event-27',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 6,
        payload: {
            previousStatus: LOAD_STATUS.IN_TRANSIT,
            newStatus: LOAD_STATUS.AT_DELIVERY,
        },
    },
    {
        id: 'event-28',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STOP_COMPLETED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 6 + 3600000,
        payload: {
            stopId: 'stop-7-delivery',
        },
    },
    {
        id: 'event-29',
        fleetId: 'fleet-acme',
        loadId: 'load-delivered-blocked',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'driver-2',
        createdAt: now - 86400000 * 6 + 3600000,
        payload: {
            previousStatus: LOAD_STATUS.AT_DELIVERY,
            newStatus: LOAD_STATUS.DELIVERED,
        },
    },
    {
        id: 'event-30',
        fleetId: 'fleet-acme',
        loadId: 'load-cancelled',
        type: EVENT_TYPE.LOAD_CREATED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 6,
        payload: {
            loadNumber: 'LOAD-2025-008',
        },
    },
    {
        id: 'event-31',
        fleetId: 'fleet-acme',
        loadId: 'load-cancelled',
        type: EVENT_TYPE.STATUS_CHANGED,
        actorUid: 'dispatcher-1',
        createdAt: now - 86400000 * 1,
        payload: {
            previousStatus: LOAD_STATUS.UNASSIGNED,
            newStatus: LOAD_STATUS.CANCELLED,
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
