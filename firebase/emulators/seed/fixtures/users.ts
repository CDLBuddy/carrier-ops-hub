// carrier-ops-hub/firebase/emulators/seed/fixtures/users.ts

import { UserSchema, type User } from '@coh/shared'
import { now } from './time.js'

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
