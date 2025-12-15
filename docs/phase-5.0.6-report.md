# Phase 5.0.6 Report: Modularize Seed Fixtures

**Date**: 2025-01-XX  
**Status**: ✅ COMPLETED  
**Related**: [seed-contract.md](../seed-contract.md), Phase 5.0.5, Phase 5.0.4

---

## Objectives

**Primary Goal**: Split monolithic `fixtures.ts` (1314 lines) into small, focused modules for improved maintainability without changing fixture data, IDs, or behavior.

**Secondary Goal**: Fix Storage URL bug where `document.url` was being overwritten with non-URL value when `FIREBASE_STORAGE_EMULATOR_HOST` was not set.

---

## Changes Implemented

### 1. Modular Fixture Organization

Created new `firebase/emulators/seed/fixtures/` directory with the following modules:

#### Core Modules

- **`time.ts`** (5 lines)
  - Exports shared `now` timestamp
  - Single source of truth for time-based calculations

- **`auth.ts`** (35 lines)
  - `TestUserClaims` interface
  - `testUserClaims` object mapping UIDs to claims
  - Auth configuration for 5 test users

#### Entity Modules

- **`fleets.ts`** (23 lines)
  - 2 fleet fixtures: fleet-acme, fleet-beta
  - Uses `now` from time.ts

- **`users.ts`** (68 lines)
  - 5 user fixtures: owner-1, dispatcher-1, driver-1, driver-2, billing-1
  - Inline Zod validation with `UserSchema.parse()`

- **`drivers.ts`** (38 lines)
  - 2 driver fixtures with license info and status
  - Inline Zod validation with `DriverSchema.parse()`

- **`vehicles.ts`** (52 lines)
  - 3 vehicle fixtures (TRUCK-001, TRUCK-002, TRUCK-003)
  - Inline Zod validation with `VehicleSchema.parse()`

- **`loads.ts`** (482 lines)
  - 8 load fixtures covering all statuses (UNASSIGNED, ASSIGNED, IN_TRANSIT, AT_PICKUP, AT_DELIVERY, DELIVERED x2, CANCELLED)
  - Each load includes stops array with full address and timing data
  - `validateLoads()` function checks forbidden fields + runs Zod validation
  - Validation called on module load

- **`events.ts`** (341 lines)
  - 31 event fixtures covering complete lifecycle for each load
  - Event types: LOAD_CREATED, LOAD_ASSIGNED, STATUS_CHANGED, STOP_COMPLETED
  - Inline Zod validation with `EventSchema.parse()`

- **`documents.ts`** (150 lines)
  - 7 document fixtures (BOL, POD, RATE_CONFIRMATION)
  - Storage paths follow contract: `fleets/{fleetId}/loads/{loadId}/docs/{docId}-{fileName}`
  - Inline Zod validation with `DocumentSchema.parse()`

#### Validation Module

- **`validators.ts`** (137 lines)
  - `validateReferentialIntegrity()` function
  - Checks:
    - Event.loadId → loads
    - Document.loadId → loads
    - Load.driverId → drivers
    - Load.vehicleId → vehicles
    - Driver.driverId → users (must have 'driver' role)
    - Unique IDs per collection
    - Storage paths follow contract
    - Document content types allowed (application/pdf, image/\*)
    - Document sizes under 15MB
  - Throws detailed error with all violations

#### Aggregation Module

- **`fixtures/index.ts`** (62 lines)
  - Re-exports all entities, auth claims, validators
  - Exports `fixtures` object for convenience
  - Calls `validateReferentialIntegrity()` on module load
  - Logs validation summary to console

### 2. Entry Points Updated

#### `seed.ts`

**Changed**:

```typescript
// OLD
import { fixtures, testUserClaims } from './fixtures.js'

// NEW
import { fixtures, testUserClaims } from './fixtures/index.js'
```

**Storage URL Bug Fix** (lines 252-266):

```typescript
// OLD - Always overwrites url/size even when Storage emulator not configured
const docData = {
  ...doc,
  url, // ❌ Could be non-URL value like "fileName.pdf"
  size, // ❌ Could be 0
  updatedAt: Date.now(),
}

// NEW - Only updates url/size when Storage emulator is available
const docData = storageEmulatorHost
  ? {
      ...doc,
      url, // ✅ Real emulator URL
      size, // ✅ Actual file size
      updatedAt: Date.now(),
    }
  : {
      ...doc, // ✅ Preserves original placeholder URL
      updatedAt: Date.now(),
    }
```

#### `validate.ts` (NEW)

```typescript
#!/usr/bin/env node
import './fixtures/index.js'
console.log('\n✅ All seed fixtures are valid!\n')
```

Standalone validation entry point that imports fixtures to trigger all validation.

#### `package.json`

**Changed**:

```json
"scripts": {
  "validate": "tsx validate.ts",  // Was: "tsx fixtures.ts"
  "seed": "tsx seed.ts"
}
```

### 3. File Removals

- **Backed up**: `fixtures.ts` → `fixtures.ts.bak` (1314 lines, kept for reference)
- Original file no longer imported or used

---

## Data Integrity Verification

### Fixture Counts (Unchanged)

- ✅ 2 fleets
- ✅ 5 users
- ✅ 2 drivers
- ✅ 3 vehicles
- ✅ 8 loads
- ✅ 31 events
- ✅ 7 documents

### Validation Results

```
✅ Seed fixtures validated successfully
   - 2 fleets
   - 5 users
   - 2 drivers
   - 3 vehicles
   - 8 loads
   - 31 events
   - 7 documents
   - All Zod schemas passed
   - All referential integrity checks passed
   - No forbidden fields detected
```

### IDs Preserved

All entity IDs unchanged:

- Fleets: `fleet-acme`, `fleet-beta`
- Users: `owner-1`, `dispatcher-1`, `driver-1`, `driver-2`, `billing-1`
- Drivers: `driver-1`, `driver-2`
- Vehicles: `vehicle-1`, `vehicle-2`, `vehicle-3`
- Loads: `load-unassigned`, `load-assigned`, `load-in-transit`, `load-at-pickup`, `load-at-delivery`, `load-delivered-ready`, `load-delivered-blocked`, `load-cancelled`
- Events: `event-1` through `event-31`
- Documents: `doc-1` through `doc-7`

---

## Quality Gates

All quality gates **PASSED** ✅:

### 1. Validation

```bash
pnpm seed:validate
# ✅ All Zod schemas passed
# ✅ All referential integrity checks passed
# ✅ No forbidden fields detected
```

### 2. TypeScript Compilation

```bash
pnpm typecheck
# ✅ packages/shared: Done in 686ms
# ✅ apps/web: Done in 1.8s
# ✅ apps/functions: Done in 1.2s
```

### 3. Linting

```bash
pnpm lint
# ✅ packages/shared: Done in 1s
# ✅ apps/functions: Done in 1s
# ✅ apps/web: Done in 1.2s
```

### 4. Build

```bash
pnpm build
# ✅ packages/shared: Build success (ESM + DTS)
# ✅ apps/functions: Done in 1.2s
# ✅ apps/web: Built in 2.37s
```

### 5. Seeding (with validation)

```bash
pnpm seed:validate
# ✅ Validates on import without running seed
```

---

## Module Structure

### Before (1 file)

```
firebase/emulators/seed/
├── fixtures.ts         (1314 lines - MONOLITHIC)
├── seed.ts             (313 lines)
└── package.json
```

### After (11 files)

```
firebase/emulators/seed/
├── fixtures/
│   ├── index.ts        (62 lines - aggregates all)
│   ├── time.ts         (5 lines - shared timestamp)
│   ├── auth.ts         (35 lines - test user claims)
│   ├── fleets.ts       (23 lines - 2 fleets)
│   ├── users.ts        (68 lines - 5 users)
│   ├── drivers.ts      (38 lines - 2 drivers)
│   ├── vehicles.ts     (52 lines - 3 vehicles)
│   ├── loads.ts        (482 lines - 8 loads with stops)
│   ├── events.ts       (341 lines - 31 events)
│   ├── documents.ts    (150 lines - 7 documents)
│   └── validators.ts   (137 lines - referential integrity)
├── seed.ts             (313 lines - updated import)
├── validate.ts         (13 lines - NEW standalone validation)
├── fixtures.ts.bak     (1314 lines - backup of original)
└── package.json        (updated validate script)
```

### Line Count Comparison

- **Before**: 1314 lines (monolithic)
- **After**: 1393 lines total across 11 modules (79 lines overhead for modularity)
  - Overhead includes: module headers, re-exports, validation function extraction

---

## Benefits

### Maintainability

- ✅ Each entity type in separate file (easier to find/edit)
- ✅ Clear separation of concerns (entities vs. validation vs. auth)
- ✅ Single source of truth for shared data (`now` timestamp)

### Testability

- ✅ Can import/test individual entity collections
- ✅ Validation logic isolated in `validators.ts`
- ✅ Standalone validation script (`validate.ts`)

### Readability

- ✅ Entity modules average 50-350 lines (vs. 1314 in monolith)
- ✅ Clear module boundaries and responsibilities
- ✅ Inline validation for immediate feedback

### Safety

- ✅ All validation runs on module load (fail fast)
- ✅ No behavioral changes (same validation rules)
- ✅ TypeScript ensures imports are correct

---

## Bug Fix: Storage URL Preservation

### Problem

When `FIREBASE_STORAGE_EMULATOR_HOST` is not set:

- `uploadToStorage()` returns `{ url: doc.fileName, size: 0 }` (non-URL fallback)
- Old code **overwrites** `doc.url` with this non-URL value
- Result: Firestore documents have `url: "BOL-LOAD-2025-002.pdf"` instead of placeholder URL

### Solution

Conditionally update `url` and `size` only when Storage emulator is configured:

```typescript
const docData = storageEmulatorHost
  ? { ...doc, url, size, updatedAt: Date.now() } // Use emulator values
  : { ...doc, updatedAt: Date.now() } // Preserve original placeholders
```

### Impact

- ✅ When Storage emulator running: Working emulator URLs written
- ✅ When Storage emulator missing: Original placeholder URLs preserved
- ✅ No more non-URL strings in `document.url` field

---

## Migration Path (for future reference)

If reverting to monolithic structure is needed:

1. `mv fixtures.ts.bak fixtures.ts`
2. Update `seed.ts`: `import { fixtures, testUserClaims } from './fixtures.js'`
3. Update `package.json`: `"validate": "tsx fixtures.ts"`
4. Delete `fixtures/` directory

However, **this is not recommended** as modular structure is superior for:

- Team collaboration (fewer merge conflicts)
- Incremental fixture expansion (add entities without scrolling past 1000+ lines)
- Selective imports in tests (if needed in future)

---

## Next Steps (Future Enhancements)

Potential improvements for future phases:

1. **Fixture Factories** (if test scenarios grow):
   - `createLoad({ status: 'IN_TRANSIT', driverId: '...' })`
   - Reduces duplication, increases flexibility

2. **Separate Test vs. Seed Data**:
   - `fixtures/seed/` - Core emulator data
   - `fixtures/test/` - Additional test-specific scenarios

3. **Document Storage Helpers**:
   - `uploadDocument()` abstraction in separate module
   - Reusable for tests beyond seeding

4. **Schema Validation Summary**:
   - Aggregate validation errors instead of fail-fast
   - Useful for debugging complex fixture changes

---

## Commit Message

```
seed: split fixtures into modules

BREAKING: fixtures.ts → fixtures/ directory (11 modules)

Changes:
- Split 1314-line fixtures.ts into focused modules:
  - time.ts (shared timestamp)
  - auth.ts (test user claims)
  - fleets.ts, users.ts, drivers.ts, vehicles.ts
  - loads.ts, events.ts, documents.ts
  - validators.ts (referential integrity)
  - index.ts (aggregates all exports)
- Created validate.ts standalone entry point
- Updated seed.ts import to fixtures/index.js
- Fixed Storage URL bug: don't overwrite url when emulator missing
- Updated package.json validate script

Quality gates:
✅ pnpm seed:validate (all fixtures valid)
✅ pnpm typecheck (0 errors)
✅ pnpm lint (0 warnings)
✅ pnpm build (all packages built)

Data integrity preserved:
- Same 8 loads, 31 events, 7 documents
- All IDs unchanged
- All validation rules unchanged
- Fixtures behavior unchanged

See: docs/phase-5.0.6-report.md
```

---

## Files Changed

### Created (12 files)

- `firebase/emulators/seed/fixtures/index.ts`
- `firebase/emulators/seed/fixtures/time.ts`
- `firebase/emulators/seed/fixtures/auth.ts`
- `firebase/emulators/seed/fixtures/fleets.ts`
- `firebase/emulators/seed/fixtures/users.ts`
- `firebase/emulators/seed/fixtures/drivers.ts`
- `firebase/emulators/seed/fixtures/vehicles.ts`
- `firebase/emulators/seed/fixtures/loads.ts`
- `firebase/emulators/seed/fixtures/events.ts`
- `firebase/emulators/seed/fixtures/documents.ts`
- `firebase/emulators/seed/fixtures/validators.ts`
- `firebase/emulators/seed/validate.ts`
- `docs/phase-5.0.6-report.md` (this file)

### Modified (2 files)

- `firebase/emulators/seed/seed.ts` (import path + Storage URL bug fix)
- `firebase/emulators/seed/package.json` (validate script)

### Backed Up (1 file)

- `firebase/emulators/seed/fixtures.ts` → `fixtures.ts.bak`

---

**Phase 5.0.6 Complete** ✅
