// carrier-ops-hub/firebase/emulators/seed/fixtures/auth.ts

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
