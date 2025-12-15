// carrier-ops-hub/firebase/emulators/seed/fixtures/index.ts

/**
 * SEED CONTRACT v1.0.0
 * 
 * This module aggregates all seed fixtures for Firebase emulator seeding.
 * All data passes Zod validation and referential integrity checks.
 * 
 * See: docs/seed-contract.md
 */

// Export timestamp
export { now } from './time.js'

// Export auth claims and interface
export { testUserClaims, type TestUserClaims } from './auth.js'

// Export entity collections
export { fleets } from './fleets.js'
export { users } from './users.js'
export { drivers } from './drivers.js'
export { vehicles } from './vehicles.js'
export { loads } from './loads.js'
export { events } from './events.js'
export { documents } from './documents.js'

// Export validators
export { validateReferentialIntegrity } from './validators.js'

// Re-export for convenience
import { fleets } from './fleets.js'
import { users } from './users.js'
import { drivers } from './drivers.js'
import { vehicles } from './vehicles.js'
import { loads } from './loads.js'
import { events } from './events.js'
import { documents } from './documents.js'
import { testUserClaims } from './auth.js'
import { validateReferentialIntegrity } from './validators.js'

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

// Run integrity checks on module load
validateReferentialIntegrity()

// Log validation summary
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
