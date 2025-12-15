#!/usr/bin/env node
// carrier-ops-hub/firebase/emulators/seed/validate.ts

/**
 * Standalone validation script for seed fixtures.
 * Imports fixtures to trigger Zod validation and referential integrity checks.
 * 
 * Usage: pnpm seed:validate
 */

import './fixtures/index.js'

console.log('\n✅ All seed fixtures are valid!\n')
