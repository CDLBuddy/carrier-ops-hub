// carrier-ops-hub/firebase/emulators/seed/fixtures/validators.ts

import { users } from './users.js'
import { drivers } from './drivers.js'
import { vehicles } from './vehicles.js'
import { loads } from './loads.js'
import { events } from './events.js'
import { documents } from './documents.js'

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
