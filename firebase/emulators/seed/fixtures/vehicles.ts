// carrier-ops-hub/firebase/emulators/seed/fixtures/vehicles.ts

import { VehicleSchema, type Vehicle } from '@coh/shared'
import { now } from './time.js'

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
