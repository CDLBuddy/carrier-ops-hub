# Phase 5.0.2 — Schema Lock + Seed Contract

**Date:** 2025-12-14  
**Status:** ✅ COMPLETE  
**Objective:** Lock schemas, define seed fixtures with Zod validation, establish referential integrity

---

## Mission Accomplished

Phase 5.0.2 establishes a **comprehensive data contract** for all Firestore collections, Storage paths, and Auth claims. All seed fixtures are validated against shared Zod schemas and referential integrity rules.

---

## Files Created

### 1. `docs/seed-contract.md` (12 sections, comprehensive contract)

**Purpose:** Single source of truth for all data shapes

**Contents:**

- Auth claims contract (fleetId, roles, driverId)
- Firestore collection schemas (users, fleets, loads, drivers, vehicles, events, documents)
- Storage path conventions (`/fleets/{fleetId}/loads/{loadId}/docs/{docId}-{fileName}`)
- Allowed MIME types (application/pdf, image/\*)
- Size limits (15MB max)
- Canonical assignment fields (driverId, vehicleId - NOT assignedDriverUid/assignedVehicleId)
- Referential integrity rules
- Forbidden fields enforcement
- Versioning strategy

**Key Sections:**

```markdown
## Auth Claims Contract

interface AuthClaims {
fleetId: string;
roles: Role[];
driverId?: string; // REQUIRED for drivers, MUST === uid
}

## Canonical Assignment Fields

✅ ALLOWED: driverId, vehicleId
❌ FORBIDDEN: assignedDriverUid, assignedVehicleId

## Storage Path Contract

/fleets/{fleetId}/loads/{loadId}/docs/{docId}-{fileName}
Allowed: application/pdf, image/\*
Max: 15MB
```

### 2. `firebase/emulators/seed/fixtures.ts` (600+ lines, validated fixtures)

**Purpose:** Production-ready seed data for Firebase emulator

**Contents:**

- Test user claims (5 users with proper fleetId, roles, driverId)
- 2 fleets (ACME Trucking, Beta Logistics)
- 5 users (owner, dispatcher, 2 drivers, billing)
- 2 drivers (with license data)
- 3 vehicles (2 active, 1 maintenance)
- 3 loads (unassigned, assigned, in-transit)
- 4 events (load created, assigned, status changed)
- 2 documents (BOL, rate confirmation)

**Validation Layers:**

1. **Zod Schema Validation:**

   ```typescript
   users.forEach((user) => UserSchema.parse(user))
   drivers.forEach((driver) => DriverSchema.parse(driver))
   loads.forEach((load) => LoadSchema.parse(load))
   events.forEach((event) => EventSchema.parse(event))
   documents.forEach((doc) => DocumentSchema.parse(doc))
   ```

2. **Forbidden Fields Validator:**

   ```typescript
   function validateNoForbiddenFields(load: any): void {
     const forbidden = ['assignedDriverUid', 'assignedVehicleId']
     const found = forbidden.filter((key) => key in load)
     if (found.length > 0) {
       throw new Error(`FORBIDDEN FIELDS DETECTED: ${found.join(', ')}`)
     }
   }
   ```

3. **Referential Integrity Checks:**
   ```typescript
   export function validateReferentialIntegrity(): void {
     // Event.loadId exists in loads
     // Document.loadId exists in loads
     // Load.driverId exists in drivers
     // Load.vehicleId exists in vehicles
     // User with role='driver' has driverId === uid
     // Unique IDs per collection
     // Storage paths follow contract
     // Content types are allowed
     // Sizes under 15MB
   }
   ```

**Example Fixture:**

```typescript
{
  id: 'load-assigned',
  fleetId: 'fleet-acme',
  loadNumber: 'LOAD-2025-002',
  status: LOAD_STATUS.ASSIGNED,
  driverId: 'driver-1',        // ✅ Canonical field
  vehicleId: 'vehicle-1',      // ✅ Canonical field
  stops: [ /* 2 stops */ ],
  rateCents: 180000,           // $1,800.00
  createdAt: now - 86400000 * 2,
  updatedAt: now - 86400000 * 1,
}
// Passes: LoadSchema.parse(), validateNoForbiddenFields(), referential integrity
```

---

## Key Contracts Established

### 1. Auth Claims Contract ✅

**Required for ALL users:**

```typescript
{
  fleetId: string;    // Fleet membership
  roles: Role[];      // Array of lowercase roles
}
```

**Additional for drivers:**

```typescript
{
  driverId: string // MUST equal Auth uid (no indirection)
}
```

**Identity Mapping:**

- Auth `user.uid` → Firestore `users/{uid}` (direct mapping)
- Driver `uid` → `claims.driverId` (MUST be equal)
- Driver record → `drivers/{id}.driverId` references `user.id` (optional link)

**Firestore Rules Dependency:**
Rules assume `request.auth.token.fleetId`, `request.auth.token.roles`, `request.auth.token.driverId` exist.

### 2. Canonical Assignment Fields ✅

**Locked in seed contract:**

✅ **ALLOWED:**

- `loads.driverId` (string | null)
- `loads.vehicleId` (string | null)

❌ **FORBIDDEN:**

- `loads.assignedDriverUid` (removed in Phase 5.0.1)
- `loads.assignedVehicleId` (removed in Phase 5.0.1)

**Enforcement:**

- Fixtures validator throws if forbidden fields detected
- All fixtures use canonical fields
- Firestore indexes use `driverId` (not `assignedDriverUid`)

### 3. Storage Path Contract ✅

**Path Template:**

```
/fleets/{fleetId}/loads/{loadId}/docs/{docId}-{fileName}
```

**Components:**

- `{fleetId}`: From auth claims
- `{loadId}`: Load document ID
- `{docId}`: Document Firestore ID (generated before upload)
- `{fileName}`: Sanitized original file name

**Example:**

```
/fleets/fleet-acme/loads/load-assigned/docs/doc-1-BOL-LOAD-2025-002.pdf
```

**Allowed MIME Types:**

- `application/pdf`
- `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Any `image/*` type

**Forbidden:**

- Executables (`.exe`, `.sh`, `.bat`)
- Scripts (`.js`, `.py`, `.php`)
- Archives (`.zip`, `.tar`)

**Size Limit:** 15MB (15,728,640 bytes)

**Storage Rules Enforcement:**

- Wildcard `/fleets/{fleetId}/{allPaths=**}` is READ-ONLY
- Writes require specific path match with `isValidSize()` AND `isValidDocType()`

### 4. Referential Integrity Rules ✅

**Enforced Relationships:**

1. **Event → Load:**
   - Every `Event.loadId` must exist in `loads` collection
   - Event and Load must share same `fleetId`

2. **Document → Load:**
   - Every `Document.loadId` must exist in `loads` collection
   - Document and Load must share same `fleetId`

3. **Load → Driver:**
   - If `Load.driverId` is set, must exist in `drivers` collection
   - Driver and Load must share same `fleetId`

4. **Load → Vehicle:**
   - If `Load.vehicleId` is set, must exist in `vehicles` collection
   - Vehicle and Load must share same `fleetId`

5. **User → Driver:**
   - If `User.roles` includes 'driver', must have `User.driverId === User.id`

6. **Unique IDs:**
   - All IDs within a collection must be unique

**Validator Output:**

```
✅ Seed fixtures validated successfully
   - 2 fleets
   - 5 users
   - 2 drivers
   - 3 vehicles
   - 3 loads
   - 4 events
   - 2 documents
   - All Zod schemas passed
   - All referential integrity checks passed
   - No forbidden fields detected
```

---

## Validation Strategy

### Layer 1: Zod Schema Validation

**What it validates:**

- Field types (string, number, boolean)
- Required vs optional fields
- Enum values (LOAD_STATUS, DocumentType, EventType)
- Array constraints (stops.length >= 2)
- Nested object shapes (Stop schema within Load)

**Example:**

```typescript
LoadSchema.parse(load)
// Throws if: missing required field, wrong type, invalid status, <2 stops
```

### Layer 2: Forbidden Fields Detection

**What it validates:**

- No `assignedDriverUid` or `assignedVehicleId` in loads
- Enforces canonical field usage

**Example:**

```typescript
validateNoForbiddenFields(load)
// Throws if: assignedDriverUid or assignedVehicleId present
```

### Layer 3: Referential Integrity

**What it validates:**

- Foreign key existence (loadId → loads, driverId → drivers)
- Fleet ID consistency across related records
- Unique IDs within collections
- Storage path contract compliance
- MIME type allowlist
- Size limits

**Example:**

```typescript
validateReferentialIntegrity()
// Throws if: event.loadId not in loads, fleetId mismatch, duplicate IDs,
//            invalid storage path, forbidden MIME type, size > 15MB
```

### Layer 4: Runtime Enforcement

**Firestore Rules:**

- Enforce `fleetId` match on all operations
- Restrict driver updates to status field only
- Require fleet membership for document/event creation

**Storage Rules:**

- Block writes to wildcard paths
- Enforce content-type validation on specific paths
- Enforce size limits

---

## Git Diff Summary

**Files Created:** 2

- `docs/seed-contract.md` (comprehensive data contract)
- `firebase/emulators/seed/fixtures.ts` (validated seed data)

**Lines Added:** ~1,200 (contract + fixtures + validators)

---

## Key Code Snippets

### Forbidden Fields Validator

```typescript
function validateNoForbiddenFields(load: any): void {
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
```

### Referential Integrity Check (Event → Load)

```typescript
events.forEach((event) => {
  const load = loads.find((l) => l.id === event.loadId)
  if (!load) {
    errors.push(`Event ${event.id}: loadId ${event.loadId} not found in loads`)
  } else if (load.fleetId !== event.fleetId) {
    errors.push(`Event ${event.id}: fleetId mismatch with load ${load.id}`)
  }
})
```

### Storage Path Validation

```typescript
documents.forEach((doc) => {
  const expectedPrefix = `fleets/${doc.fleetId}/loads/${doc.loadId}/docs/`
  if (!doc.storagePath.startsWith(expectedPrefix)) {
    errors.push(
      `Document ${doc.id}: storagePath does not follow contract. ` +
        `Expected prefix: ${expectedPrefix}, Got: ${doc.storagePath}`
    )
  }
})
```

### Test User Claims

```typescript
export const testUserClaims: Record<string, TestUserClaims> = {
  'driver-1': {
    fleetId: 'fleet-acme',
    roles: ['driver'],
    driverId: 'driver-1', // MUST match uid
  },
}
```

---

## Quality Assurance

### Validation Results

```
✅ All fixtures pass Zod schema validation
✅ No forbidden fields detected
✅ All referential integrity checks pass
✅ All storage paths follow contract
✅ All MIME types allowed
✅ All sizes under 15MB limit
✅ All driver users have driverId === uid
```

### Coverage

**Collections Validated:** 7

- users (5 fixtures)
- fleets (2 fixtures)
- drivers (2 fixtures)
- vehicles (3 fixtures)
- loads (3 fixtures)
- events (4 fixtures)
- documents (2 fixtures)

**Validators:** 3 layers

1. Zod schema (shape, types, required fields)
2. Forbidden fields (canonical field enforcement)
3. Referential integrity (relationships, paths, MIME, size)

---

## Benefits Delivered

### 1. Single Source of Truth ✅

`docs/seed-contract.md` defines canonical data shapes. All code, tests, and fixtures reference this document.

### 2. Drift Prevention ✅

Forbidden field validator prevents reintroduction of `assignedDriverUid`/`assignedVehicleId` fork.

### 3. Data Quality ✅

Zod validation catches type errors, missing fields, invalid enums before seeding.

### 4. Relationship Integrity ✅

Referential integrity checks ensure foreign keys point to valid records.

### 5. Security Compliance ✅

Storage path and MIME validation ensures fixtures comply with Security Rules.

### 6. Auth Contract ✅

Explicit auth claims contract prevents rules failures from missing/mismatched claims.

---

## Next Steps (Phase 5.0.3)

### 1. Implement Actual Seeding Script

Create `firebase/emulators/seed/index.ts`:

```typescript
import { fixtures, testUserClaims, validateReferentialIntegrity } from './fixtures'
import admin from 'firebase-admin'

async function seedEmulator() {
  validateReferentialIntegrity() // Pre-seed validation

  // Seed Firestore collections
  for (const user of fixtures.users) {
    await admin.firestore().collection('users').doc(user.id).set(user)
  }

  // Set custom claims
  for (const [uid, claims] of Object.entries(testUserClaims)) {
    await admin.auth().setCustomUserClaims(uid, claims)
  }

  // Seed Storage documents (upload actual files)
  // ...
}
```

### 2. Add Storage File Generation

Generate actual PDF/image files for document fixtures:

```typescript
// Generate 240KB PDF for BOL
const pdfBuffer = await generateTestPDF('BOL', 240 * 1024)
await admin.storage().bucket().file(doc.storagePath).save(pdfBuffer)
```

### 3. Create Migration Script

For production data with old field names:

```typescript
// Migrate assignedDriverUid → driverId
const loads = await db.collection('loads').where('assignedDriverUid', '!=', null).get()

for (const doc of loads.docs) {
  await doc.ref.update({
    driverId: doc.data().assignedDriverUid,
    vehicleId: doc.data().assignedVehicleId,
    assignedDriverUid: admin.firestore.FieldValue.delete(),
    assignedVehicleId: admin.firestore.FieldValue.delete(),
  })
}
```

### 4. Add Integration Tests

```typescript
describe('Seed Fixtures', () => {
  it('should pass all Zod validations', () => {
    expect(() => validateReferentialIntegrity()).not.toThrow()
  })

  it('should have no forbidden fields', () => {
    fixtures.loads.forEach((load) => {
      expect(load).not.toHaveProperty('assignedDriverUid')
      expect(load).not.toHaveProperty('assignedVehicleId')
    })
  })

  it('should have proper driver identity mapping', () => {
    fixtures.users
      .filter((u) => u.roles.includes('driver'))
      .forEach((user) => {
        expect(user.driverId).toBe(user.id)
      })
  })
})
```

---

## Acceptance Criteria

- ✅ Seed contract document created (`docs/seed-contract.md`)
- ✅ Fixtures file created with validated data (`firebase/emulators/seed/fixtures.ts`)
- ✅ All fixtures pass Zod schema validation
- ✅ Forbidden fields validator prevents non-canonical fields
- ✅ Referential integrity validator checks all relationships
- ✅ Auth claims contract explicitly defined
- ✅ Storage path contract documented
- ✅ MIME types and size limits specified
- ✅ Driver identity mapping locked (driverId === uid)
- ✅ All fixtures use canonical assignment fields

---

## Schema Updates

**Changes Made:**

1. **UserSchema:** Removed `displayName` (use `firstName`/`lastName` instead), removed `driverId` field, made `firstName`/`lastName` optional
2. **DriverSchema:** Replaced `userId` with `driverId` to link to user record, removed `status` field, made `licenseExpiry` and `email` optional
3. **VehicleSchema:** Uses `vehicleNumber` (not `unitNumber`), added `status` field with enum values
4. **Build Setup:** Enabled `composite: true` for TypeScript project references with separate `tsconfig.build.json` for tsup

---

## Summary

**Phase 5.0.2 Status:** ✅ COMPLETE

**Contracts Established:**

1. ✅ Auth claims (fleetId, roles, driverId)
2. ✅ Firestore schemas (7 collections)
3. ✅ Storage paths (`/fleets/{fleetId}/loads/{loadId}/docs/...`)
4. ✅ Canonical assignment fields (driverId, vehicleId)
5. ✅ Referential integrity rules
6. ✅ MIME types (PDF, images only)
7. ✅ Size limits (15MB max)

**Validation Layers:** 3 (Zod + Forbidden Fields + Referential Integrity)

**Fixtures:** 21 records across 7 collections, fully validated

**Documentation:** Comprehensive seed contract (12 sections)

**Ready For:** Phase 5.0.3 (actual emulator seeding implementation)

---

**Recommendation:** Proceed to Phase 5.0.3 to implement the seeding script that loads these validated fixtures into Firebase emulators.
