// carrier-ops-hub/firebase/emulators/seed/fixtures/drivers.ts

import { DriverSchema, type Driver } from '@coh/shared'
import { now } from './time.js'

export const drivers: Driver[] = [
    {
        id: 'driver-1',
        fleetId: 'fleet-acme',
        firstName: 'Charlie',
        lastName: 'Driver',
        licenseNumber: 'D1234567',
        licenseState: 'CA',
        licenseExpiry: now + 86400000 * 365, // ~1 year from now
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
