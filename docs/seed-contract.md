# Carrier Ops Hub — Seed Contract

**Version:** 1.0.0  
**Date:** 2025-12-14  
**Status:** LOCKED — Breaking changes require version bump

---

## Purpose

This document defines the canonical data shape for all Firestore collections, Storage paths, and Auth claims. All seed fixtures, tests, and production code MUST conform to these contracts.

---

## Auth Claims Contract

### Required Claims (All Users)

```typescript
interface AuthClaims {
  fleetId: string // Fleet membership (REQUIRED)
  roles: Role[] // User roles array (REQUIRED, lowercase)
  driverId?: string // Driver ID (REQUIRED for role='driver', MUST === uid)
}
```

### Role Values (from `packages/shared/src/constants/roles.ts`)

```typescript
type Role = 'owner' | 'dispatcher' | 'driver' | 'billing' | 'safety' | 'maintenance'
```

### Identity Mapping Rules

1. **User UID → Firestore Doc:** Auth `user.uid` MUST match Firestore `users/{uid}` document ID
2. **Driver Identity:** For users with `role='driver'`, the `driverId` claim MUST equal `uid`
   - ✅ Correct: `uid='abc123'` → `claims.driverId='abc123'`
   - ❌ Wrong: `uid='abc123'` → `claims.driverId='driver-xyz'` (needless indirection)
3. **Fleet Scope:** All Firestore queries MUST filter by `fleetId` from claims

### Firestore Rules Assumptions

Rules assume these claims exist:

- `request.auth.token.fleetId` (string)
- `request.auth.token.roles` (array)
- `request.auth.token.driverId` (string, for driver updates)

**Consequence:** Seed users MUST have these claims set via Admin SDK `setCustomUserClaims()`.

---

## Firestore Collections

### Collection: `users`

**Schema:** `packages/shared/src/schemas/user.ts`

**Required Fields:**

```typescript
{
  id: string;              // Matches Auth uid
  email: string;
  firstName?: string;      // Optional
  lastName?: string;       // Optional
  fleetId: string;
  roles: Role[];
  isActive: boolean;       // Default true
  createdAt: number;       // Unix timestamp (ms)
  updatedAt: number;
}
```

**Validation:** `UserSchema.parse(userData)`

---

### Collection: `fleets`

**Schema:** `packages/shared/src/schemas/fleet.ts` (if exists, else inferred)

**Required Fields:**

```typescript
{
  id: string;
  name: string;
  dotNumber?: string;      // DOT number (nullable)
  mcNumber?: string;       // MC number (nullable)
  createdAt: number;
  updatedAt: number;
}
```

---

### Collection: `loads`

**Schema:** `packages/shared/src/schemas/load.ts`

**Required Fields:**

```typescript
{
  id: string;
  fleetId: string;
  loadNumber: string;
  status: LoadStatus;      // UNASSIGNED | ASSIGNED | AT_PICKUP | IN_TRANSIT | AT_DELIVERY | DELIVERED | CANCELLED
  driverId: string | null; // ✅ CANONICAL (NOT assignedDriverUid)
  vehicleId: string | null;// ✅ CANONICAL (NOT assignedVehicleId)
  stops: Stop[];           // Min 2 stops (pickup + delivery)
  pickupDate: number;      // Unix timestamp (ms)
  deliveryDate: number;
  rateCents: number;       // Integer cents
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}
```

**Stop Schema:**

```typescript
{
  type: 'PICKUP' | 'DELIVERY'
  address: string
  city: string
  state: string
  zip: string
  scheduledDate: number // Unix timestamp (ms)
  scheduledTime: string // "09:00" format
  isCompleted: boolean
}
```

**Validation:** `LoadSchema.parse(loadData)`

**Forbidden Fields:**

- ❌ `assignedDriverUid` (use `driverId`)
- ❌ `assignedVehicleId` (use `vehicleId`)

**Firestore Index Requirements:**

- `fleetId` + `status` + `updatedAt`
- `fleetId` + `driverId` + `status` (for driver home query)

---

### Collection: `drivers`

**Schema:** `packages/shared/src/schemas/driver.ts`

**Required Fields:**

```typescript
{
  id: string;
  fleetId: string;
  driverId?: string;       // References user.id if driver has account
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry?: number;  // Unix timestamp (ms), optional
  phoneNumber: string;
  email?: string;          // Optional
  isActive: boolean;       // Default true
  createdAt: number;
  updatedAt: number;
}
```

**Validation:** `DriverSchema.parse(driverData)`

---

### Collection: `vehicles`

**Schema:** `packages/shared/src/schemas/vehicle.ts`

**Required Fields:**

```typescript
{
  id: string
  fleetId: string
  vehicleNumber: string // User-friendly identifier (not unitNumber)
  vin: string // 17 characters
  year: number
  make: string
  model: string
  licensePlate: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' // Default 'ACTIVE'
  isActive: boolean // Default true
  createdAt: number
  updatedAt: number
}
```

**Validation:** `VehicleSchema.parse(vehicleData)`

---

### Collection: `events`

**Schema:** `packages/shared/src/schemas/event.ts`

**Required Fields:**

```typescript
{
  id: string;
  fleetId: string;
  loadId: string;          // ✅ Load-centric (NOT generic entityId)
  type: EventType;         // LOAD_CREATED | LOAD_ASSIGNED | STATUS_CHANGED | STOP_COMPLETED | DOCUMENT_UPLOADED
  actorUid: string;        // Auth uid who triggered event
  createdAt: number;
  payload?: Record<string, any>;
}
```

**EventType Values:** (from `packages/shared/src/constants/events.ts`)

```typescript
;'LOAD_CREATED' | 'LOAD_ASSIGNED' | 'STATUS_CHANGED' | 'STOP_COMPLETED' | 'DOCUMENT_UPLOADED'
```

**Validation:** `EventSchema.parse(eventData)`

**Referential Integrity:**

- `loadId` MUST exist in `loads` collection
- `fleetId` MUST match parent load's `fleetId`

**Firestore Index Requirements:**

- `fleetId` + `loadId` + `createdAt` (descending)

---

### Collection: `documents`

**Schema:** `packages/shared/src/schemas/document.ts`

**Required Fields:**

```typescript
{
  id: string;
  fleetId: string;
  loadId: string;
  type: DocumentType;      // BOL | POD | RATE_CONFIRMATION | INVOICE | RECEIPT | OTHER
  fileName: string;
  storagePath: string;     // ✅ Must follow path contract (see Storage section)
  url: string;             // Download URL from Storage
  contentType: string;     // MIME type (must be allowed type)
  size: number;            // Bytes (max 15MB = 15728640)
  uploadedBy: string;      // Auth uid
  notes?: string;
  amount?: number;         // For invoices/receipts
  createdAt: number;
  updatedAt: number;
}
```

**DocumentType Values:**

```typescript
;'BOL' | 'POD' | 'RATE_CONFIRMATION' | 'INVOICE' | 'RECEIPT' | 'OTHER'
```

**Validation:** `DocumentSchema.parse(docData)`

**Referential Integrity:**

- `loadId` MUST exist in `loads` collection
- `fleetId` MUST match parent load's `fleetId`
- `storagePath` MUST follow contract (see Storage section)
- `contentType` MUST be in allowed list
- `size` MUST be ≤ 15MB

**Firestore Index Requirements:**

- `fleetId` + `loadId` + `createdAt` (descending)

---

## Firebase Storage Contract

### Path Convention

**Document Uploads:**

```
/fleets/{fleetId}/loads/{loadId}/docs/{docId}-{fileName}
```

**Components:**

- `{fleetId}`: Fleet ID from auth claims
- `{loadId}`: Load document ID
- `{docId}`: Document Firestore ID (generated before upload)
- `{fileName}`: Original file name (sanitized)

**Example:**

```
/fleets/fleet-abc/loads/load-123/docs/doc-xyz-BOL-12345.pdf
```

### Allowed MIME Types

✅ **Permitted:**

- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- Any `image/*` type

❌ **Forbidden:**

- Executables: `.exe`, `.sh`, `.bat`, `.cmd`
- Scripts: `.js`, `.py`, `.rb`, `.php`
- Archives: `.zip`, `.tar`, `.gz`
- Any non-image, non-PDF type

### Size Limits

- **Max file size:** 15MB (15,728,640 bytes)
- Enforced in Storage rules via `request.resource.size < 15 * 1024 * 1024`

### Storage Rules Enforcement

Storage rules (`firebase/storage.rules`) enforce:

1. **Read:** `matchesFleetId(fleetId)` - user must belong to fleet
2. **Write:** Must be specific path with `isValidSize()` AND `isValidDocType()`
3. **Wildcard:** `/fleets/{fleetId}/{allPaths=**}` is READ-ONLY (no writes)

---

## Canonical Assignment Fields

### ✅ ALLOWED on `loads` collection:

```typescript
{
  driverId: string | null // Driver UID (matches Auth uid)
  vehicleId: string | null // Vehicle doc ID
}
```

### ❌ FORBIDDEN (deprecated from Phase 5.0.1):

```typescript
{
  assignedDriverUid: string | null // ❌ DO NOT USE
  assignedVehicleId: string | null // ❌ DO NOT USE
}
```

**Consequence:** Fixtures, tests, and production code MUST NOT use forbidden fields. Validators MUST throw if detected.

---

## Referential Integrity Rules

### Load → Driver/Vehicle

```typescript
// If load.driverId is set:
assert(
  drivers.some((d) => d.id === load.driverId),
  'Driver not found'
)
assert(d.fleetId === load.fleetId, 'Driver fleet mismatch')

// If load.vehicleId is set:
assert(
  vehicles.some((v) => v.id === load.vehicleId),
  'Vehicle not found'
)
assert(v.fleetId === load.fleetId, 'Vehicle fleet mismatch')
```

### Event → Load

```typescript
assert(
  loads.some((l) => l.id === event.loadId),
  'Load not found for event'
)
assert(l.fleetId === event.fleetId, 'Fleet mismatch')
```

### Document → Load

```typescript
assert(
  loads.some((l) => l.id === doc.loadId),
  'Load not found for document'
)
assert(l.fleetId === doc.fleetId, 'Fleet mismatch')
```

### Unique IDs Per Collection

```typescript
const loadIds = new Set(loads.map((l) => l.id))
assert(loadIds.size === loads.length, 'Duplicate load IDs')
// Repeat for all collections
```

---

## Seed Fixture Requirements

All fixtures in `firebase/emulators/seed/fixtures.ts` MUST:

1. **Pass Zod validation:** `Schema.parse(data)` for every record
2. **Use canonical fields:** No `assignedDriverUid`/`assignedVehicleId`
3. **Maintain referential integrity:** All foreign keys point to valid records
4. **Share consistent fleetId:** Related records must have matching `fleetId`
5. **Include auth claims:** Test users must have `fleetId`, `roles`, `driverId` (if driver)
6. **Follow storage paths:** Document `storagePath` must match contract
7. **Respect MIME types:** Document `contentType` must be allowed type
8. **Stay under size limits:** Document `size` ≤ 15MB

---

## Versioning

**Breaking Changes:**

Changes that require seed regeneration or migration:

- Adding new required fields
- Renaming fields
- Changing field types
- Adding new referential integrity rules

**Version Bump Required:**

- Major version: Breaking schema changes
- Minor version: New optional fields
- Patch version: Documentation/clarification only

**Current Version:** 1.0.0

---

## Enforcement

**In Code:**

1. All fixture data passes `Schema.parse()` before seeding
2. Referential integrity validators throw on violations
3. Forbidden field detector throws if non-canonical fields present

**In CI/CD:**

1. Fixtures validation runs on every commit
2. Failed validation blocks deployment
3. Schema changes require contract update + version bump

---

## References

- **Shared Schemas:** `packages/shared/src/schemas/`
- **Constants:** `packages/shared/src/constants/`
- **Firestore Rules:** `firebase/firestore.rules`
- **Storage Rules:** `firebase/storage.rules`
- **Firestore Indexes:** `firebase/firestore.indexes.json`

---

**Last Updated:** 2025-12-14  
**Maintained By:** Carrier Ops Hub Core Team
