# Truth Sweep - Phase 5.0.T

## 1) Repo Metadata

**Repository:** carrier-ops-hub  
**Date:** December 14, 2025  
**Git Branch:** `main`  
**Commit SHA:** `76957d10529852a8aaf624397d72ff709677478f`

### Workspace Structure

**apps/**
- `functions/` - Firebase Cloud Functions backend
- `web/` - Web frontend application (Vite + React)

**packages/**
- `shared/` - Shared code, types, schemas, and utilities

**firebase/**
- `emulators/seed/` - Seed scripts and fixtures for local development
- `migrations/` - Database migration scripts
- `scripts/` - Deployment and utility scripts

---

## 2) Canonical Constants (Single Source of Truth)

### Roles (`packages/shared/src/constants/roles.ts`)

```typescript
export const ROLES = [
  'owner',
  'dispatcher',
  'fleet_manager',
  'maintenance_manager',
  'billing',
  'driver',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  dispatcher: 'Dispatcher',
  fleet_manager: 'Fleet Manager',
  maintenance_manager: 'Maintenance Manager',
  billing: 'Billing',
  driver: 'Driver',
}

export const ALL_ROLES: Role[] = [...ROLES]
```

**Where Used:**
- ✅ User schema references `ROLES` constant
- ✅ Auth context uses typed `Role[]`
- ✅ Firebase functions use `ROLES` for validation
- ⚠️ **Violations:** Multiple route guards and navigation configs use hardcoded role arrays instead of referencing constants:
  - `apps/web/src/domain/permissions/index.ts` - Permission guards use hardcoded role strings
  - `apps/web/src/app/layout/navigation/config.ts` - Navigation uses hardcoded role arrays
  - `apps/web/src/app/routing/routes/auth/bootstrap.tsx` - Duplicates entire ROLES array

---

### Load Statuses (`packages/shared/src/constants/statuses.ts`)

```typescript
export const LOAD_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  AT_PICKUP: 'AT_PICKUP',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_DELIVERY: 'AT_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export type LoadStatus = (typeof LOAD_STATUS)[keyof typeof LOAD_STATUS]
```

**Where Used:**
- ✅ Load schema extracts values dynamically from `LOAD_STATUS`
- ✅ Extensive correct usage throughout driver and dispatch routes
- ❌ **Violations (3 found):**
  - `apps/web/src/services/repositories/loadRepository.ts` - Uses string `'UNASSIGNED'` instead of `LOAD_STATUS.UNASSIGNED`
  - `apps/web/src/app/routing/routes/dispatch/dashboard.tsx` - Uses string `'UNASSIGNED'` 
  - `apps/web/src/data/queryKeys.ts` - Uses string `'UNASSIGNED'`

---

### Document Types (`packages/shared/src/constants/documents.ts`)

```typescript
export const DOCUMENT_TYPE = {
  BOL: 'BOL', // Bill of Lading
  POD: 'POD', // Proof of Delivery
  RATE_CONFIRMATION: 'RATE_CONFIRMATION',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  OTHER: 'OTHER',
} as const

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]
```

**Where Used:**
- ⚠️ Document schema uses hardcoded enum array instead of deriving from `DOCUMENT_TYPE`
- ✅ Web app uses `DOCUMENT_TYPE` constants correctly in most places
- ⚠️ Minor violation: `apps/web/src/services/repositories/documentRepository.ts` uses string `'OTHER'` in error message

---

### Event Types (`packages/shared/src/constants/events.ts`)

```typescript
export const EVENT_TYPE = {
  LOAD_CREATED: 'LOAD_CREATED',
  LOAD_ASSIGNED: 'LOAD_ASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  STOP_COMPLETED: 'STOP_COMPLETED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]
```

**Where Used:**
- ✅ Event schema extracts values dynamically from `EVENT_TYPE`
- ✅ Correct usage throughout web app routes and services

---

### Collection Names (`packages/shared/src/constants/collections.ts`)

```typescript
export const COLLECTIONS = {
  FLEETS: 'fleets',
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  LOADS: 'loads',
  STOPS: 'stops',
  DOCUMENTS: 'documents',
  EXPENSES: 'expenses',
  EVENTS: 'events',
  THREADS: 'threads',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]
```

**Where Used:**
- ✅ Excellent usage in functions and web repositories
- ❌ **Major Violation:** `firebase/emulators/seed/seed.ts` uses all hardcoded collection strings instead of `COLLECTIONS` constants

---

## 3) Canonical Schemas (Zod)

All schemas located in `packages/shared/src/schemas/`

### Common Schemas (`common.ts`)

#### `TimestampSchema` → `Timestamp`
- `createdAt: number` - Unix milliseconds
- `updatedAt: number` - Unix milliseconds

#### `AddressSchema` → `Address`
- `street: string` (default: '')
- `city: string` (default: '')
- `state: string` (default: '')
- `zip: string` (default: '')
- `country: string` (default: 'US')

#### `MoneySchema` → `Money`
- `cents: number` - Integer amount to avoid floating point issues
- `currency: string` (default: 'USD')

---

### User Schema (`user.ts`)

**Type:** `User`

**Fields:**
- `id: string`
- `fleetId: string`
- `email: string` - Email format validated
- `displayName?: string` - Optional
- `photoURL?: string` - Optional
- `roles: Role[]` - Array from `ROLES` constant, min 1 required
- `isActive: boolean` (default: true)
- `createdAt: number`
- `updatedAt: number`

**Notable:** Requires at least one role; email validation enforced

---

### Driver Schema (`driver.ts`)

**Type:** `Driver`

**Fields:**
- `id: string`
- `fleetId: string`
- `driverId?: string` - Optional, points back to user UID
- `firstName: string`
- `lastName: string`
- `email?: string` - Email format, optional
- `phone: string`
- `licenseState: string` - Exactly 2 chars (US state code)
- `licenseExpiry?: number` - Optional Unix timestamp
- `status: string` - Enum: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'
- `notes: string`
- `createdAt: number`
- `updatedAt: number`

**Notable:** License state validation (exactly 2 characters); multiple optional fields

---

### Vehicle Schema (`vehicle.ts`)

**Type:** `Vehicle`

**Fields:**
- `id: string`
- `fleetId: string`
- `vehicleNumber: string`
- `vin: string` - Exactly 17 chars
- `make: string`
- `model: string`
- `year: number` - Integer, min: 1900, max: 2100
- `licensePlate: string`
- `status: string` - Enum: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' (default: 'ACTIVE')
- `createdAt: number`
- `updatedAt: number`

**Notable:** VIN validation (exactly 17 characters); year range validation; default status 'ACTIVE'

---

### Load Schema (`load.ts`)

**Type:** `Load`

**Fields:**
- `id: string`
- `fleetId: string`
- `loadNumber: string`
- `status: LoadStatus` - Enum from `LOAD_STATUS` constant
- `driverId: string | null` - Nullable (for unassigned loads)
- `vehicleId: string | null` - Nullable (for unassigned loads)
- `stops: Stop[]` - Array of StopSchema, min 2 required
- `pickupAt: number` - Unix timestamp
- `deliveryAt: number` - Unix timestamp
- `rate: number` - Integer (cents), min: 0
- `notes: string | null` - Nullable
- `createdAt: number`
- `updatedAt: number`

**Notable:** 
- Minimum 2 stops required
- Status values derived from `LOAD_STATUS` constant
- Driver and vehicle nullable for unassigned loads
- Rate stored in cents

---

### Stop Schema (`stop.ts`)

**Type:** `Stop`

**Fields:**
- `id: string`
- `type: string` - Enum: 'PICKUP' | 'DELIVERY'
- `sequence: number` - Integer, min: 0
- `address: Address` - Nested AddressSchema
- `scheduledAt: number` - Unix timestamp
- `actualAt: number | null` - Nullable
- `isCompleted: boolean` (default: false)
- `createdAt: number`
- `updatedAt: number`

**Notable:** Uses nested AddressSchema; tracks both scheduled and actual time; sequence ordering enforced

---

### Document Schema (`document.ts`)

**Type:** `Document`

**Fields:**
- `id: string`
- `fleetId: string`
- `loadId: string`
- `type: DocumentType` - Enum: 'BOL' | 'POD' | 'RATE_CONFIRMATION' | 'INVOICE' | 'RECEIPT' | 'OTHER'
- `fileName: string`
- `storagePath: string`
- `url: string` - URL format validated
- `contentType: string`
- `size: number` - Bytes
- `uploadedBy: string` - User ID
- `description?: string` - Optional
- `amount?: number` - Optional (cents)
- `createdAt: number`
- `updatedAt: number`

**Notable:** URL validation enforced; optional amount field for financial documents

**Deviation:** Schema uses hardcoded enum array instead of deriving from `DOCUMENT_TYPE` constant

---

### Expense Schema (`expense.ts`)

**Type:** `Expense`

**Fields:**
- `id: string`
- `fleetId: string`
- `loadId: string`
- `type: string` - Enum: 'FUEL' | 'TOLLS' | 'PARKING' | 'MEALS' | 'MAINTENANCE' | 'OTHER'
- `amount: number` - Integer (cents), min: 0
- `description: string`
- `receiptUrl: string | null` - URL format, nullable
- `submittedBy: string` - User ID
- `createdAt: number`

**Notable:** 
- Amount stored in cents
- Receipt URL nullable (may not have receipt)
- No `updatedAt` field (immutable expenses)
- No constant exists for expense types (uses hardcoded enum)

---

### Event Schema (`event.ts`)

**Type:** `Event`

**Fields:**
- `id: string`
- `fleetId: string`
- `loadId: string`
- `type: EventType` - Enum from `EVENT_TYPE` constant
- `actor: string` - User ID who triggered the event
- `timestamp: number` - Unix milliseconds
- `payload?: Record<string, any>` - Optional, flexible event-specific data

**Notable:**
- Event type derived from `EVENT_TYPE` constant
- Flexible payload field for event-specific data
- No `updatedAt` (events are immutable)
- Tracks actor (user who triggered the event)

---

### Schema Summary

**Total Schema Files:** 9 files (8 domain schemas + 1 common)  
**Total Exported Types:** 12 types

**Common Patterns:**
- All entities use numeric timestamps (Unix milliseconds)
- All entities are fleet-scoped (all have `fleetId`)
- Money stored as cents (integer) to avoid floating point issues
- Enums for controlled vocabularies
- Nullable vs optional field usage (nullable for assignments, optional for UI fields)

---

## 4) Assignment Field Canon

### Canonical Assignment Fields

The codebase has been **successfully consolidated** to use:
- **`driverId`** - For driver assignments (on loads, driver documents, and auth claims)
- **`vehicleId`** - For vehicle assignments (on loads)

### Evidence

**Load Schema** (`packages/shared/src/schemas/load.ts`):
```typescript
driverId: z.string().nullable(),
vehicleId: z.string().nullable(),
```

**Driver Schema** (`packages/shared/src/schemas/driver.ts`):
```typescript
driverId: z.string().optional(), // Points back to the user record
```

### Legacy Fields Status

✅ **NO LEGACY FIELDS FOUND** - Search returned **zero occurrences** of:
- `assignedDriverUid` 
- `assignedVehicleId`

These deprecated fields have been successfully eliminated from the codebase as part of Phase 5.0.1.

### Validation

The seed fixtures actively prevent reintroduction via `validateNoForbiddenFields()`:

```typescript
/**
 * Throws if load contains deprecated assignment fields.
 * Phase 5.0.1 eliminated the assignedDriverUid/assignedVehicleId fork.
 */
function validateNoForbiddenFields(load: Record<string, unknown>): void {
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

**Source:** `firebase/emulators/seed/fixtures.ts`

### Field Semantics

- **`driverId`**: References the driver's document ID (nullable on loads)
- **`vehicleId`**: References the vehicle's document ID (nullable on loads)  
- **`driver.driverId`**: Optional field that points back to Firebase Auth user UID (for driver users only)
- **Auth Claims `driverId`**: For driver role users, contains their driver document ID (must match driver document's ID)

---

## 5) Auth Claims Contract

### Custom Claims Structure

Based on `apps/web/src/types/auth.ts`:

```typescript
export interface AuthClaims {
  fleetId?: string
  roles: Role[]
  driverId?: string
}
```

### Required vs Optional Claims

| Claim | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `roles` | `Role[]` | ✅ Yes | `[]` | Authorization & routing |
| `fleetId` | `string` | ❌ Optional | undefined | Multi-tenant isolation |
| `driverId` | `string` | ❌ Optional | undefined | Driver document linking |

### Mapping Rules

1. **User Authentication → Fleet Access**
   - Users without `fleetId` are redirected to bootstrap flow
   - All tenant data operations require `token.fleetId` to match document `fleetId`

2. **Driver Role → Driver Document**
   - Optional `driverId` claim links to the driver document
   - Not enforced in current rules but available for future driver-specific access

3. **User Document**
   - User's Firebase Auth `uid` must match the document ID in `users/{uid}`

### Evidence from Firestore Rules

**Helper Functions** (`firebase/firestore.rules`):

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function hasFleetId() {
  return isAuthenticated() && request.auth.token.fleetId is string;
}

function matchesFleetId(fleetId) {
  return hasFleetId() && request.auth.token.fleetId == fleetId;
}

function hasRole(role) {
  return isAuthenticated() && 
         request.auth.token.roles is list && 
         role in request.auth.token.roles;
}

function isOwnerOrDispatcher() {
  return hasRole('owner') || hasRole('dispatcher');
}

function isDriver() {
  return hasRole('driver');
}
```

**Multi-Tenant Enforcement Example** (loads collection):

```javascript
match /loads/{loadId} {
  allow read: if hasFleetId() && resource.data.fleetId == request.auth.token.fleetId;
  allow create: if hasFleetId() && 
                   isOwnerOrDispatcher() && 
                   request.resource.data.fleetId == request.auth.token.fleetId;
  allow update: if hasFleetId() && 
                   resource.data.fleetId == request.auth.token.fleetId &&
                   (isOwnerOrDispatcher() || driverOnlyUpdatingStatus());
  allow delete: if hasFleetId() && 
                   isOwnerOrDispatcher() && 
                   resource.data.fleetId == request.auth.token.fleetId;
}
```

### Evidence from Routing

**Root Redirect Logic** (`apps/web/src/app/routing/routes/index.tsx`):

```tsx
beforeLoad: ({ context }) => {
  // Not authenticated → sign in
  if (!context.auth.user) {
    throw redirect({ to: '/auth/sign-in' })
  }

  // Authenticated but no fleet → bootstrap
  if (!context.auth.claims.fleetId) {
    throw redirect({ to: '/auth/bootstrap' })
  }

  // Has fleet → role landing
  const landing = getLandingPath(context.auth.claims.roles)
  throw redirect({ to: landing })
}
```

**Role-Based Landing Pages** (`apps/web/src/lib/routing.ts`):

```typescript
export function getLandingPath(roles: Role[]): string {
  // Driver-only users go to driver home
  if (roles.includes('driver') && roles.length === 1) {
    return '/driver/home'
  }

  // Dispatchers go to dispatch dashboard
  if (roles.includes('dispatcher')) {
    return '/dispatch/dashboard'
  }

  // Billing users go to billing dashboard
  if (roles.includes('billing')) {
    return '/billing/dashboard'
  }

  // Default to my-day
  return '/my-day'
}
```

### Claims Setting Implementation

Auth claims are set during user creation via Firebase Admin SDK (`apps/functions/src/callable/bootstrapFleet.ts`):

```typescript
await auth.setCustomUserClaims(uid, {
  fleetId: fleetDoc.id,
  roles: ['owner'],
})
```

And also in seed scripts (`firebase/emulators/seed/seed.ts`):

```typescript
await auth.setCustomUserClaims(uid, testUserClaims[authUserId])
```

### Critical Invariants

1. All Firestore tenant data requires `fleetId` match
2. Users without `fleetId` cannot access tenant data (enforced by `hasFleetId()`)
3. Role checks use `token.roles` as a list
4. Bootstrap flow is required for users with auth but no `fleetId`
5. Driver-only users (`roles: ['driver']`) have special routing to `/driver/home`

---

## 6) Firebase Storage Contract

### Storage Path Structure

**Root pattern:** `/fleets/{fleetId}/...`
- All fleet-specific data organized under fleet ID

**Load documents:** `/fleets/{fleetId}/loads/{loadId}/docs/{fileName}`
- Specific path for load-related document uploads

### Write Permissions and Conditions

**Write Access GRANTED:**
- **Path:** `/fleets/{fleetId}/loads/{loadId}/docs/{fileName}` (lines 38-41 of `firebase/storage.rules`)
  - User must be authenticated with matching `fleetId` token claim
  - Must meet size constraints (< 15MB)
  - Must meet MIME type restrictions

**Write Access DENIED:**
- **Path:** `/fleets/{fleetId}/{allPaths=**}` (lines 30-33)
  - READ ONLY - writes explicitly denied
- **Path:** `/{allPaths=**}` (lines 44-46)
  - Default deny-all for any unmatched paths

### MIME Type and Size Constraints

**MIME Type Restrictions** (lines 24-26):
- `image/*` (any image format)
- `application/pdf`

**Size Limit** (line 21):
- Maximum: **15MB** (15,728,640 bytes)

### Wildcard Write Status

**YES - Wildcard write is DISABLED**

Confirmed at **lines 44-46** of `firebase/storage.rules`:

```
match /{allPaths=**} {
  allow read, write: if false;
}
```

This rule explicitly denies all read and write operations for any path not matched by more specific rules above it, effectively disabling wildcard access.

---

## 7) UI + Routing Map

### Route Structure

```
apps/web/src/app/routing/routes/
├── __root.tsx                          # Root layout component
├── index.tsx                           # Landing page with role-based redirects
│
├── auth/
│   ├── bootstrap.tsx                   # Fleet setup for new users
│   ├── forgot-password.tsx             # Password reset
│   └── sign-in.tsx                     # Login page
│
├── billing/
│   └── dashboard.tsx                   # Billing dashboard
│
├── dispatch/
│   ├── dashboard.tsx                   # Dispatch load management
│   └── loads.$loadId.tsx               # Dispatch load detail view
│
├── driver/
│   ├── home.tsx                        # Driver home page
│   └── loads.$loadId.tsx               # Driver load detail view
│
├── maintenance/
│   └── dashboard.tsx                   # Maintenance dashboard
│
├── my-day/
│   └── index.tsx                       # Default landing page
│
├── owner/
│   └── dashboard.tsx                   # Owner dashboard
│
└── safety/
    └── dashboard.tsx                   # Safety dashboard
```

### Launch Route Behavior (`/` Redirects)

**File:** `apps/web/src/app/routing/routes/index.tsx`

**Redirect Logic:**
1. **Not authenticated** → `/auth/sign-in`
2. **Authenticated but no fleet** → `/auth/bootstrap`
3. **Has fleet** → Role-based landing page:
   - **Driver only** → `/driver/home`
   - **Dispatcher** → `/dispatch/dashboard`
   - **Billing** → `/billing/dashboard`
   - **Default** → `/my-day`

---

### Page-Level Field Access

#### 1. **Dispatch Load Detail** (`dispatch/loads.$loadId.tsx`)

**Collections:** `loads` (read + write), `documents` (read + write), `events` (read)

**Fields READ from `loads`:**
- `id`, `fleetId`, `loadNumber`, `status`, `driverId`, `vehicleId`
- `stops[]` - `type`, `sequence`, `address`, `scheduledAt`, `actualAt`

**Fields WRITTEN to `loads`:**
- `driverId` (assignment)
- `vehicleId` (assignment)
- `status` (set to `LOAD_STATUS.ASSIGNED`)
- `updatedAt` (auto-timestamp)

**Fields WRITTEN to `documents`:**
- `id`, `fleetId`, `loadId`, `type`, `fileName`, `storagePath`
- `url`, `contentType`, `size`, `uploadedBy`, `createdAt`, `updatedAt`

**Mutation Pattern:**
- Uses `useUpdateLoad` hook → `loadRepository.update()` → `updateDoc()`
- Uses `useUploadDocument` hook → `documentRepository.upload()` → `uploadBytesResumable()` + `addDoc()`

---

#### 2. **Driver Load Detail** (`driver/loads.$loadId.tsx`)

**Collections:** `loads` (read + write), `stops` (read + write), `documents` (read + write)

**Fields READ from `loads`:**
- `id`, `fleetId`, `status`, `driverId` (for validation)
- `stops[]` - `type`, `address`, `scheduledAt`, `isCompleted`

**Fields WRITTEN to `loads`:**
- `status` (status transitions)
- `updatedAt` (auto-timestamp)

**Fields WRITTEN to `events`:**
- `id`, `fleetId`, `loadId`, `type` (e.g., `EVENT_TYPE.STATUS_CHANGED`, `STOP_COMPLETED`)
- `actor`, `timestamp`, `payload` (contains `oldStatus`, `newStatus`)

**Fields WRITTEN to `documents`:**
- Same as dispatch, but `type` defaults to `DOCUMENT_TYPE.POD`

**Status Transition Logic:**
- `ASSIGNED` → `AT_PICKUP` (event: `STATUS_CHANGED`)
- `AT_PICKUP` → `IN_TRANSIT` (event: `STOP_COMPLETED`)
- `IN_TRANSIT` → `AT_DELIVERY` (event: `STATUS_CHANGED`)
- `AT_DELIVERY` → `DELIVERED` (event: `STOP_COMPLETED`)

**Mutation Pattern:**
- Creates event FIRST via `eventRepository.create()` → `addDoc()`
- THEN updates load status via `loadRepository.update()` → `updateDoc()`
- Document uploads via `documentRepository.upload()` → Storage + `addDoc()`

---

#### 3. **Driver Home** (`driver/home.tsx`)

**Collections:** `loads` (read-only)

**Fields READ from `loads`:**
- `id`, `loadNumber`, `status`, `driverId` (for filtering)
- `stops[0]` - `scheduledAt` (for "Next Stop" display)

**Filter Logic:**
- Shows loads where `driverId === currentUser.claims.driverId`
- Excludes `DELIVERED` and `CANCELLED` statuses
- Displays first active load as "Current Load"

**No Mutations** - Read-only page

---

#### 4. **Billing Dashboard** (`billing/dashboard.tsx`)

**Collections:** `loads` (read-only), `documents` (read-only)

**Fields READ from `loads`:**
- `id`, `loadNumber`, `status` (filters for `DELIVERED`)

**Fields READ from `documents`:**
- `loadId`, `type` (checks for `DOCUMENT_TYPE.POD` and `DOCUMENT_TYPE.RATE_CONFIRMATION`)

**Business Logic:**
- Filters loads with `status === LOAD_STATUS.DELIVERED`
- Groups loads by billing readiness:
  - **Ready:** Has both POD and Rate Confirmation
  - **Blocked:** Missing either document

**No Mutations** - Read-only dashboard

---

### Mutation Summary

**Load Mutations:**
- Method: `loadRepository.update()` → `updateDoc()`
- Common fields: `driverId`, `vehicleId`, `status`, `updatedAt`

**Document Mutations:**
- Method: `documentRepository.upload()` → Storage upload + `addDoc()`
- Flow: Upload file → Get URL → Create Firestore doc → Create event

**Event Mutations:**
- Method: `eventRepository.create()` → `addDoc()`
- Common types: `STATUS_CHANGED`, `STOP_COMPLETED`, `DOCUMENT_UPLOADED`
- Pattern: Driver flow creates events BEFORE updating load status

**Load Status Flow:**
```
UNASSIGNED → ASSIGNED → AT_PICKUP → IN_TRANSIT → AT_DELIVERY → DELIVERED
                ↓
            CANCELLED (can happen from any state)
```

---

## 8) Seeds: What Exists vs What's Missing

### Files Found

**Location:** `firebase/emulators/seed/`

1. **`fixtures.ts`** (677 lines) - All validated test data fixtures
2. **`seed.ts`** (117 lines) - Main seed script
3. **`package.json`** (17 lines) - Seed package configuration
4. **`tsconfig.json`** (19 lines) - TypeScript configuration

---

### What Exists

#### Fixtures (`fixtures.ts`)

**Contains:**
- **Test User Claims** - Auth custom claims for 5 test users:
  - `owner-1`: owner role
  - `dispatcher-1`: dispatcher role
  - `driver-1`, `driver-2`: driver roles (with `driverId` matching uid)
  - `billing-1`: billing role

- **Fixture Collections:**
  - **2 Fleets** (`fleet-acme`, `fleet-test`)
  - **5 Users** (owner, dispatcher, 2 drivers, billing)
  - **2 Drivers** (Charlie Driver, Diana Hauler)
  - **3 Vehicles** (TRUCK-001, TRUCK-002, TRUCK-003)
  - **3 Loads** (unassigned, assigned, in-transit)
  - **4 Events** (load created, assigned, status changed)
  - **2 Documents** (BOL, Rate Confirmation)

- **Validation Functions:**
  - `validateNoForbiddenFields()` - Ensures no deprecated assignment fields
  - `validateReferentialIntegrity()` - Comprehensive referential integrity checker:
    - Events → Loads relationship
    - Documents → Loads relationship
    - Loads → Drivers/Vehicles relationships
    - Driver → User relationships
    - Unique ID validation per collection
    - Storage path validation
    - MIME type validation
    - File size validation (≤ 15MB)

- **Schema Validation:** All collections validated with Zod schemas from `@coh/shared`

#### Seed Script (`seed.ts`)

**What it does:**
1. ✅ Initializes Firebase Admin SDK with emulator endpoints
2. ✅ Creates Auth users with password `password123`
3. ✅ **Sets custom user claims** via `auth.setCustomUserClaims()`
4. ✅ Seeds Firestore collections in order:
   - Fleets → Users → Drivers → Vehicles → Loads → Events → Documents
5. ✅ Provides console output with progress logging

**Evidence:**
```typescript
// Lines 21-44: Auth user creation with custom claims (line 36)
await auth.setCustomUserClaims(uid, testUserClaims[authUserId])

// Lines 46-100: Firestore collection seeding
```

#### Package Configuration (`package.json`)

**Scripts:**
- `validate`: Runs `tsx fixtures.ts` to validate fixtures without seeding
- `seed`: Runs `tsx seed.ts` to execute full seed process

**Dependencies:**
- `@coh/shared` - Workspace package (schemas, types, constants)
- `firebase-admin` (v13.0.1) - Admin SDK

---

### What's Missing

#### 1. **Storage File Uploads** 🚨 MAJOR GAP

**Evidence:**
- Documents in fixtures contain `storagePath` and `url` fields with fake/placeholder values
- No `bucket.upload()` calls found in seed scripts
- Document URLs point to `https://storage.googleapis.com/...` but files are never uploaded
- Storage paths validated but not created

**Impact:**
- Document metadata exists in Firestore but actual PDF/image files don't exist in Storage
- Any code that tries to download documents will fail (404 errors)
- Storage rules can't be tested properly

**Example from fixtures:**
```typescript
// Document has metadata but no actual file uploaded:
{
  id: 'doc-1',
  storagePath: 'fleets/fleet-acme/loads/load-assigned/docs/doc-1-BOL-LOAD-2025-002.pdf',
  url: 'https://storage.googleapis.com/...', // ❌ File doesn't exist
  contentType: 'application/pdf',
  size: 245760
}
```

#### 2. **Additional Missing Functionality**

**Storage Implementation:**
- No sample PDF/image files to upload
- No Storage emulator upload logic
- No download URL generation from Storage API

**Additional Collections:**
- `expenses/` - No expense fixtures
- `threads/` - No messaging thread fixtures
- Potential read models (per `architecture/read-models.md`)

**Test Data Variety:**
- Limited status variety (only 3 load statuses: UNASSIGNED, ASSIGNED, IN_TRANSIT)
- No edge cases (expired licenses, overdue loads, etc.)
- No DELIVERED or CANCELLED loads in fixtures

---

### Summary Table

| Component | Status | Details |
|-----------|--------|---------|
| **Fixtures File** | ✅ Complete | 677 lines, 7 collections, validated |
| **Seed Script** | ✅ Implemented | Auth + Firestore seeding working |
| **Auth Claims** | ✅ Implemented | `setCustomUserClaims()` called |
| **Zod Validation** | ✅ Implemented | All schemas validated |
| **Referential Integrity** | ✅ Implemented | Comprehensive checks |
| **Forbidden Fields Check** | ✅ Implemented | Validates no deprecated fields |
| **Storage Uploads** | ❌ **NOT IMPLEMENTED** | Major gap - files don't exist |
| **Storage Path Validation** | ✅ Implemented | Paths validated in fixtures |
| **Sample Files (PDFs)** | ❌ Missing | No actual files to upload |
| **Package Scripts** | ✅ Complete | `validate` and `seed` scripts |

---

## 9) Scripts and Quality Gates

### Root `package.json` Scripts

```json
"scripts": {
  "dev": "pnpm --filter web dev",
  "dev:web": "pnpm --filter web dev",
  "dev:emulators": "pnpm exec firebase --config firebase/firebase.json emulators:start --project carrier-ops-hub",
  "seed:validate": "pnpm --filter @coh/seed validate",
  "seed:all": "pnpm --filter @coh/seed validate && pnpm --filter @coh/seed seed",
  "build": "pnpm -r build",
  "typecheck": "pnpm -r typecheck",
  "lint": "pnpm -r lint",
  "format": "pnpm -r format",
  "firebase:deploy": "pnpm exec firebase --config firebase/firebase.json deploy --project dev"
}
```

### How to Run Emulators

```bash
pnpm dev:emulators
```

Starts Firebase emulators (Firestore, Auth, Functions, Storage) with configuration from `firebase/firebase.json`

### How to Seed

**Validate fixtures only:**
```bash
pnpm seed:validate
```
Runs `fixtures.ts` to validate seed data structure

**Validate and seed:**
```bash
pnpm seed:all
```
Validates fixtures, then executes `seed.ts` to populate emulator

**Seed package scripts** (`firebase/emulators/seed/package.json`):
```json
"scripts": {
  "validate": "tsx fixtures.ts",
  "seed": "tsx seed.ts"
}
```

### Build/Typecheck/Lint Commands

**Build (all packages):**
```bash
pnpm build
```

**Typecheck (all packages):**
```bash
pnpm typecheck
```

**Lint (all packages):**
```bash
pnpm lint
```

**Format (all packages):**
```bash
pnpm format
```

### Development Commands

**Web app (local dev):**
```bash
pnpm dev       # or pnpm dev:web
```

### Firebase Scripts

**`firebase/scripts/deploy.sh`**
- Purpose: Deploy Firebase configuration, functions, and rules
- Usage examples:
  - `./deploy.sh` - Deploy everything
  - `./deploy.sh --functions-only` - Deploy only functions
  - `./deploy.sh --rules-only` - Deploy only Firestore and Storage rules

**`firebase/scripts/export-emulator-data.sh`**
- Purpose: Export current emulator data to `./firebase/emulator-data` directory
- Use case: Capture emulator state for backup or sharing test data

### Project Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=9.0.0 (packageManager: pnpm@9.15.0)

---

## 10) Risk Register

### Identified Risks and Mismatches

#### 1. **Hardcoded Role Arrays** ⚠️ Maintainability Risk
- **Files:** 
  - `apps/web/src/domain/permissions/index.ts`
  - `apps/web/src/app/layout/navigation/config.ts`
  - `apps/web/src/app/routing/routes/auth/bootstrap.tsx`
- **Issue:** Permission guards, navigation config, and bootstrap form duplicate role strings instead of referencing `ROLES` constant
- **Impact:** Changes to roles require updates in multiple places
- **Assessment:** Appears intentional but not ideal

#### 2. **Load Status String Literals** ❌ Inconsistency
- **Files:**
  - `apps/web/src/services/repositories/loadRepository.ts`
  - `apps/web/src/app/routing/routes/dispatch/dashboard.tsx`
  - `apps/web/src/data/queryKeys.ts`
- **Issue:** Uses `'UNASSIGNED'` string instead of `LOAD_STATUS.UNASSIGNED`
- **Impact:** Bypasses type safety and increases risk of typos
- **Assessment:** Appears accidental - should use constant

#### 3. **Seed Script Collection Names** ❌ Inconsistency
- **File:** `firebase/emulators/seed/seed.ts`
- **Issue:** All collection references use hardcoded strings instead of `COLLECTIONS` constants
- **Impact:** Seed script not aligned with app code patterns
- **Assessment:** Appears accidental - should use constants

#### 4. **Document Schema Hardcoded Enum** ⚠️ Inconsistency
- **File:** `packages/shared/src/schemas/document.ts`
- **Issue:** Uses hardcoded enum array instead of deriving from `DOCUMENT_TYPE` constant
- **Impact:** Schema and constant can drift out of sync
- **Assessment:** Appears accidental - load and event schemas use better pattern

#### 5. **No Expense Type Constant** ⚠️ Missing Pattern
- **File:** `packages/shared/src/schemas/expense.ts`
- **Issue:** Uses hardcoded enum array - no `EXPENSE_TYPE` constant exists
- **Impact:** Expense types not centralized like other enums
- **Assessment:** Unknown if intentional

#### 6. **No Stop Type Constant** ⚠️ Missing Pattern
- **Finding:** Stop types `'PICKUP'` and `'DELIVERY'` used in schemas but no constant defined
- **Impact:** Stop types not centralized like other enums
- **Assessment:** Unknown if intentional

#### 7. **Storage Uploads Not Implemented** 🚨 Critical Gap
- **File:** `firebase/emulators/seed/seed.ts`
- **Issue:** Document metadata seeded but actual files never uploaded to Storage
- **Impact:** Document downloads will fail (404); Storage rules untested
- **Assessment:** Intentional deferral - noted in seed contract as future work

#### 8. **Limited Test Data Variety** ⚠️ Testing Gap
- **File:** `firebase/emulators/seed/fixtures.ts`
- **Issue:** Only 3 load statuses represented (UNASSIGNED, ASSIGNED, IN_TRANSIT)
- **Impact:** Cannot test UI behavior for DELIVERED, CANCELLED, AT_PICKUP, AT_DELIVERY loads
- **Assessment:** Appears intentional (MVP scope)

#### 9. **Expense and Thread Collections Missing from Seeds** ⚠️ Coverage Gap
- **Files:** Feature exists in web app but no fixtures
- **Issue:** Cannot test expense tracking or messaging features with emulator
- **Impact:** Requires manual data creation for testing these features
- **Assessment:** Unknown if intentional

#### 10. **Driver-Specific Rules Not Enforced** ℹ️ Unused Claim
- **File:** `firebase/firestore.rules`
- **Issue:** `driverId` claim exists but not used for driver-specific access rules
- **Impact:** Drivers can read all loads in their fleet, not just their own
- **Assessment:** Appears intentional (current design allows this)

---

## 11) Quality Check Results

### TypeCheck Results

```bash
$ pnpm typecheck

> carrier-ops-hub@0.1.0 typecheck C:\Users\kylel\carrier-ops-hub
> pnpm -r typecheck

Scope: 4 of 5 workspace projects
packages/shared typecheck$ tsc -p tsconfig.json --noEmit
└─ Done in 755ms
apps/web typecheck$ tsc -p tsconfig.json --noEmit
└─ Done in 1.7s
apps/functions typecheck$ tsc -p tsconfig.json --noEmit
└─ Done in 1.2s
```

**Status:** ✅ PASSED - No type errors

---

### Lint Results

```bash
$ pnpm lint

> carrier-ops-hub@0.1.0 lint C:\Users\kylel\carrier-ops-hub
> pnpm -r lint

Scope: 4 of 5 workspace projects
packages/shared lint$ eslint .
└─ Done in 1.2s
apps/functions lint$ eslint .
└─ Done in 1s
apps/web lint$ eslint .
└─ Done in 1.2s
```

**Status:** ✅ PASSED - No lint errors

---

### Build Results

```bash
$ pnpm build

> carrier-ops-hub@0.1.0 build C:\Users\kylel\carrier-ops-hub
> pnpm -r build

Scope: 4 of 5 workspace projects
packages/shared build$ tsup src/index.ts --format esm --dts --clean --tscon…
│ CLI Using tsconfig: tsconfig.build.json
│ CLI tsup v8.5.1
│ CLI Target: es2022
│ CLI Cleaning output folder
│ ESM Build start
│ ESM dist\index.js 7.09 KB
│ ESM ⚡️ Build success in 89ms
│ DTS Build start
│ DTS ⚡️ Build success in 1199ms
│ DTS dist\index.d.ts 15.99 KB
└─ Done in 2s
apps/functions build$ tsc -p tsconfig.json
└─ Done in 1.1s
apps/web build$ vite build
│ dist/assets/dashboard-DLfQcybt.js          2.30 kB │ gzip:   0.97 kB        
│ dist/assets/home-BKT7xa7o.js               2.98 kB │ gzip:   1.13 kB        
│ dist/assets/dashboard-AIeWJyqJ.js          3.57 kB │ gzip:   1.27 kB
│ dist/assets/loads._loadId-CpgIwxAx.js      4.46 kB │ gzip:   1.44 kB
│ dist/assets/loads._loadId-CoiYjBO9.js      4.60 kB │ gzip:   1.55 kB
│ dist/assets/bootstrap-YdH415N7.js         14.99 kB │ gzip:   4.74 kB
│ dist/assets/hooks-9G1icUQm.js             35.62 kB │ gzip:   9.45 kB
│ dist/assets/hooks-B4B-bq-w.js            318.07 kB │ gzip:  81.75 kB
│ dist/assets/index-CVixwP0P.js            490.50 kB │ gzip: 132.56 kB
│ ✓ built in 2.36s                                                            
└─ Done in 3.6s
```

**Status:** ✅ PASSED - All packages built successfully

---

## Final Statement

**No code changes were made in this phase.**

This document was created purely for documentation purposes as part of Phase 5.0.T (Truth Sweep). Only `docs/truth-sweep.md` was added to the repository.

All information was gathered through:
- File reading
- Command execution (git, ripgrep, package scripts)
- Analysis of existing code patterns
- Validation of quality gates

The repository remains in a fully functional state with:
- ✅ All types valid
- ✅ No lint errors
- ✅ All packages building successfully

---

**Documentation completed:** December 14, 2025  
**Git commit SHA:** 76957d10529852a8aaf624397d72ff709677478f  
**Branch:** main
