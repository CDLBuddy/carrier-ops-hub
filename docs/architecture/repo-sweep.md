# Repo Sweep: Carrier Ops Hub

**Date:** December 13, 2025, 9:45 PM EST  
**Auditor:** AI Agent  
**Scope:** Full repository audit of Phase 1-4 implementation

## Executive Summary

**Phase 1-4 Recap:**

- ✅ **Phase 1:** Complete scaffolding (175 files) - monorepo structure with pnpm workspaces, apps/web, apps/functions, packages/shared
- ✅ **Phase 2:** External services connected - GitHub repo, Firebase project (dev), Vercel deployment configured
- ✅ **Phase 3:** Local dev environment operational - dependencies installed (887 packages), dev server running, emulators configured
- ✅ **Phase 4:** First vertical slice implemented - auth flow, fleet bootstrap (emulator only), dispatch dashboard with load CRUD
- ⚠️ **Current State:** Builds successfully on Vercel, but has 20+ TypeScript errors, eslint config issues, extensive TODOs (62 found), and significant security gaps

---

## 1) Build & Tooling Agent

### Root Package Scripts (`package.json`)

```json
{
  "dev": "pnpm --filter web dev",
  "dev:web": "pnpm --filter web dev",
  "dev:emulators": "pnpm exec firebase --config firebase/firebase.json emulators:start --project dev",
  "build": "pnpm -r build",
  "typecheck": "pnpm -r typecheck",
  "lint": "pnpm -r lint",
  "format": "pnpm -r format",
  "firebase:deploy": "pnpm exec firebase --config firebase/firebase.json deploy --project dev"
}
```

- **Node Engine:** `>=18.0.0`
- **Package Manager:** `pnpm@9.15.0`
- **Monorepo Tool:** Turbo 2.3.3

### Apps/Web Scripts (`apps/web/package.json`)

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "lint": "eslint .",
  "format": "prettier -w ."
}
```

- **Framework:** Vite 6.0.5 + React 18.3.1
- **Routing:** TanStack Router 1.95.0 with plugin
- **State:** TanStack Query 5.62.8
- **Firebase SDK:** 11.1.0

### Apps/Functions Scripts (`apps/functions/package.json`)

```json
{
  "build": "tsc -p tsconfig.json",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "lint": "eslint .",
  "format": "prettier -w ."
}
```

- **Type:** ESM (`"type": "module"`)
- **Node Engine:** 18 (but Vercel uses 24.x, causing warnings)
- **Functions:** Firebase Functions v2 (v6.1.1)
- **Admin SDK:** firebase-admin 13.0.1

### Packages/Shared Scripts (`packages/shared/package.json`)

```json
{
  "build": "tsup src/index.ts --format esm --dts --clean",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "lint": "eslint .",
  "format": "prettier -w ."
}
```

- **Bundler:** tsup 8.3.5
- **Output:** ESM with TypeScript declarations
- **Validation:** Zod 3.24.1

### Turbo Pipeline (`turbo.json`)

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".turbo/**",
        "apps/web/dist/**",
        "packages/**/dist/**",
        "apps/functions/dist/**"
      ]
    },
    "typecheck": { "dependsOn": ["^typecheck"] },
    "lint": {},
    "format": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

- ✅ Build pipeline has proper dependency ordering (shared builds first)
- ✅ Build outputs are cached
- ✅ Typecheck respects dependencies
- ⚠️ Lint and format have no caching (intentional for these tasks)

### ESLint Configuration (`eslint.config.js`)

```javascript
ignores: [
  '**/node_modules/**',
  '**/dist/**',
  '**/.turbo/**',
  '**/routeTree.gen.ts', // ✅ TanStack Router generated file ignored
  'firebase/.firebase/**',
]
```

- ⚠️ **BROKEN:** Missing `@typescript-eslint/parser` package in root dependencies
- ⚠️ **ERROR:** `Cannot find package '@typescript-eslint/parser'` when running `pnpm lint`
- ❌ No TypeScript-specific rules configured (react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, etc.)

### Prettier Ignore (`.prettierignore`)

```
node_modules
dist
.turbo
routeTree.gen.ts
pnpm-lock.yaml
```

- ✅ Properly ignores generated files

### Vercel Configuration

- **Location:** Root `vercel.json` (moved from apps/web in recent fix)
- **Build Command:** `pnpm install && pnpm --filter=@coh/shared build && pnpm --filter=web build`
- **Output Directory:** `apps/web/dist`
- **Root Directory (Vercel Settings):** `.` (monorepo root)
- ✅ README.md documents requirement: "Enable 'Include source files outside of the Root Directory' in Vercel settings" (line 57)

---

## 2) Frontend Routing & UX Agent

### Route Map

| Route                     | Guard                     | Roles             | Purpose                             | File                         |
| ------------------------- | ------------------------- | ----------------- | ----------------------------------- | ---------------------------- |
| `/`                       | None                      | -                 | Root redirects to auth or dashboard | `__root.tsx`                 |
| `/auth/sign-in`           | None                      | -                 | Email/password sign in/sign up      | `auth/sign-in.tsx`           |
| `/auth/bootstrap`         | requireAuth               | Any authenticated | Fleet creation (emulator only)      | `auth/bootstrap.tsx`         |
| `/auth/forgot-password`   | None                      | -                 | Password reset (stub)               | `auth/forgot-password.tsx`   |
| `/my-day`                 | requireAuth               | All               | Quick links + dev claims info       | `my-day/index.tsx`           |
| `/dispatch/dashboard`     | requireAuth + requireRole | dispatcher, owner | Load list + create form             | `dispatch/dashboard.tsx`     |
| `/dispatch/loads/:loadId` | None (stub)               | -                 | Load detail (not implemented)       | `dispatch/loads.$loadId.tsx` |
| `/driver/home`            | requireAuth + requireRole | driver            | Driver landing (no load assigned)   | `driver/home.tsx`            |
| `/driver/loads/:loadId`   | None (stub)               | -                 | Driver load view (not implemented)  | `driver/loads.$loadId.tsx`   |
| `/billing/dashboard`      | None (stub)               | -                 | Billing queue (not implemented)     | `billing/dashboard.tsx`      |
| `/safety/dashboard`       | None (stub)               | -                 | Compliance board (not implemented)  | `safety/dashboard.tsx`       |
| `/owner/dashboard`        | None (stub)               | -                 | Owner overview (not implemented)    | `owner/dashboard.tsx`        |
| `/maintenance/dashboard`  | None (stub)               | -                 | DVIR/maintenance (not implemented)  | `maintenance/dashboard.tsx`  |

### Role Landing Logic (`apps/web/src/app/routing/navigation/roleLanding.ts`)

```typescript
export function getLandingPath(roles: Role[]): string {
  if (roles.includes('driver') && roles.length === 1) return '/driver/home'
  if (roles.includes('dispatcher')) return '/dispatch/dashboard'
  if (roles.includes('billing')) return '/billing/dashboard'
  return '/my-day'
}
```

- ✅ Driver-only users → `/driver/home`
- ✅ Dispatchers → `/dispatch/dashboard`
- ✅ Billing → `/billing/dashboard`
- ✅ Others → `/my-day`

### NavConfig (`apps/web/src/app/routing/navigation/navConfig.ts`)

```typescript
export const navConfig: NavItem[] = [
  { label: 'My Day', path: '/my-day', roles: ['ALL'] },
  { label: 'Dispatch', path: '/dispatch/dashboard', roles: ['DISPATCHER', 'OWNER'] },
  { label: 'Billing', path: '/billing/dashboard', roles: ['BILLING', 'OWNER'] },
  { label: 'Safety', path: '/safety/dashboard', roles: ['SAFETY', 'OWNER'] },
  { label: 'Maintenance', path: '/maintenance/dashboard', roles: ['MAINTENANCE', 'OWNER'] },
  { label: 'Driver Home', path: '/driver/home', roles: ['DRIVER'] },
]
```

- ⚠️ **MISMATCH:** NavConfig uses uppercase role strings ('DISPATCHER') but shared constants use lowercase ('dispatcher')
- ⚠️ **MISMATCH:** 'SAFETY' role in navConfig doesn't exist in shared constants (should be 'fleet_manager'?)
- ❌ NavConfig is defined but not used anywhere in the codebase

### My Day Contents (`apps/web/src/app/routing/routes/my-day/index.tsx`)

- ✅ Displays quick links filtered by user roles
- ✅ Shows dev-only claims panel: `{import.meta.env.DEV && <DevInfo>}`
- ✅ Displays: email, fleetId, roles (with labels), driverId (if present)

### Driver Layout Boundary

- ⚠️ **STUB:** `apps/web/src/app/layout/DriverLayout.tsx` exists but only has `{/* TODO: Add driver-specific navigation */}`
- ⚠️ **NOT WIRED:** No routes currently use DriverLayout
- ⚠️ **MISSING:** Driver-specific nav/header/footer not implemented

### Auth Guards

- ✅ `requireAuth()`: Throws redirect to `/auth/sign-in` if not authenticated
- ✅ `requireRole()`: Throws 403 if user doesn't have required role
- ✅ Used properly in dispatch/dashboard and driver/home

---

## 3) Data Model & Schemas Agent

### Zod Schemas Inventory (`packages/shared/src/schemas/`)

```
common.ts      - AddressSchema, TimestampSchema (unused)
document.ts    - DocumentSchema (BOL, POD, etc.)
driver.ts      - DriverSchema
event.ts       - EventSchema (stub, no fields defined)
expense.ts     - ExpenseSchema
load.ts        - LoadSchema ⚠️
stop.ts        - StopSchema ⚠️
user.ts        - UserSchema (roles enum doesn't match constants)
vehicle.ts     - VehicleSchema
index.ts       - Exports all schemas
```

### Types Export (`packages/shared/src/types/index.ts`)

```typescript
export type { Load } from '../schemas/load'
export type { Stop } from '../schemas/stop'
export type { Driver } from '../schemas/driver'
export type { Vehicle } from '../schemas/vehicle'
export type { Event } from '../schemas/event'
export type { Document } from '../schemas/document'
export type { Expense } from '../schemas/expense'
export type { User } from '../schemas/user'
export type { Address } from '../schemas/common'
```

- ✅ All types properly inferred from Zod schemas via `z.infer<typeof Schema>`

### Domain Constants

#### Roles (`packages/shared/src/constants/roles.ts`)

```typescript
export type Role =
  | 'owner'
  | 'dispatcher'
  | 'fleet_manager'
  | 'maintenance_manager'
  | 'billing'
  | 'driver'

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  dispatcher: 'Dispatcher',
  fleet_manager: 'Fleet Manager',
  maintenance_manager: 'Maintenance Manager',
  billing: 'Billing',
  driver: 'Driver',
}
```

#### Statuses (`packages/shared/src/constants/statuses.ts`)

```typescript
export const LOAD_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_PICKUP: 'AT_PICKUP',
  AT_DELIVERY: 'AT_DELIVERY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const DOCUMENT_TYPE = {
  BOL: 'BOL',
  POD: 'POD',
  RATE_CONFIRMATION: 'RATE_CONFIRMATION',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  OTHER: 'OTHER',
} as const
```

#### Collections (`packages/shared/src/constants/collections.ts`)

```typescript
export const COLLECTIONS = {
  USERS: 'users',
  FLEETS: 'fleets',
  LOADS: 'loads',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  EVENTS: 'events',
  DOCUMENTS: 'documents',
  EXPENSES: 'expenses',
  THREADS: 'threads',
} as const
```

### ⚠️ CRITICAL SCHEMA MISMATCHES

#### Load Status Mismatch

**LoadSchema (`packages/shared/src/schemas/load.ts`):**

```typescript
status: z.enum([
  'AVAILABLE',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'INVOICED',
  'PAID',
  'CANCELLED',
])
```

**LOAD_STATUS constants:**

```typescript
;'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'AT_PICKUP' | 'AT_DELIVERY' | 'COMPLETED' | 'CANCELLED'
```

**Dispatch Dashboard Creates:**

```typescript
status: 'AVAILABLE' // ✅ Valid per schema but not in LOAD_STATUS constants
```

**Impact:**

- ❌ LoadSchema and LOAD_STATUS constants are completely different
- ❌ UI creates 'AVAILABLE' which isn't in constants
- ❌ Schema allows 'DELIVERED', 'INVOICED', 'PAID' but constants have 'AT_PICKUP', 'AT_DELIVERY', 'COMPLETED'
- ❌ This will cause query/filter bugs when trying to match statuses

#### Load Schema Constraints vs. Dispatch Creation

**LoadSchema requires:**

```typescript
stops: z.array(StopSchema).min(2) // ✅ Minimum 2 stops
```

**Dispatch creates:**

```typescript
stops: [
  { id, type: 'PICKUP', sequence: 0, address: {...}, scheduledTime, ... },
  { id, type: 'DELIVERY', sequence: 1, address: {...}, scheduledTime, ... }
]
```

- ✅ Creates exactly 2 stops (meets .min(2) requirement)
- ⚠️ Creates stops with empty address fields (street: '', city: '', state: '', zip: '')
- ⚠️ `StopSchema.address` expects `AddressSchema` which might require non-empty strings

#### Stop Schema Constraints

**StopSchema (`packages/shared/src/schemas/stop.ts`):**

```typescript
export const StopSchema = z.object({
  id: z.string(),
  loadId: z.string(),
  type: z.enum(['PICKUP', 'DELIVERY']),
  sequence: z.number().int().min(0),
  address: AddressSchema,
  scheduledTime: z.number(),
  actualTime: z.number().nullable(),
  isCompleted: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

- ⚠️ **Missing loadId:** Dispatch creates stops without loadId field (adds after load is created)
- ⚠️ **Sequence validation:** No max constraint, could be out of order

#### User Schema Role Mismatch

**UserSchema:**

```typescript
role: z.enum(['OWNER', 'DISPATCHER', 'DRIVER', 'BILLING', 'SAFETY', 'MAINTENANCE'])
```

**Role type (constants):**

```typescript
type Role = 'owner' | 'dispatcher' | 'fleet_manager' | 'maintenance_manager' | 'billing' | 'driver'
```

- ❌ **BREAKING:** UserSchema uses uppercase, Role type uses lowercase
- ❌ **MISSING:** 'fleet_manager' and 'maintenance_manager' not in UserSchema enum
- ❌ **EXTRA:** 'SAFETY' in UserSchema doesn't exist in Role type

---

## 4) Firebase & Security Agent

### Firestore Rules Summary (`firebase/firestore.rules`)

**Tenant Boundaries:**

```javascript
function hasFleetId() {
  return isAuthenticated() && request.auth.token.fleetId is string;
}

function matchesFleetId(fleetId) {
  return hasFleetId() && request.auth.token.fleetId == fleetId;
}
```

- ✅ All tenant data enforces `resource.data.fleetId == request.auth.token.fleetId`
- ✅ Prevents cross-fleet data access

**User Self-Access:**

```javascript
match /users/{uid} {
  allow read, write: if isAuthenticated() && request.auth.uid == uid;
}
```

- ✅ Users can only read/write their own profile

**Default Deny:**

```javascript
match /{document=**} {
  allow read, write: if false;
}
```

- ✅ Secure by default - all access must be explicitly granted

**TODOs in Rules:**

- Line 35: `// TODO: Add owner-only write restrictions` (fleets collection)
- Line 43: `// TODO: Add role-based restrictions (dispatcher/owner can write)` (loads collection)

**Collections Covered:**

- ✅ fleets, loads, drivers, vehicles, events, documents, expenses, threads
- ❌ **MISSING:** No rules for any future collections

**Security Gaps:**

- ⚠️ **No role-based restrictions:** Any authenticated user with fleetId can write to loads/drivers/vehicles
- ⚠️ **No field-level validation:** Can write arbitrary fields to any document
- ⚠️ **No owner restrictions:** Fleet document can be modified by any fleet member
- ⚠️ **Driver-only restrictions missing:** Drivers should only read their assigned loads

### Storage Rules Summary (`firebase/storage.rules`)

```javascript
// Documents
match /documents/{loadId}/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated();
}

// Driver profile photos
match /drivers/{driverId}/photo {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated();
}
```

**Critical Security Issues:**

- ❌ **NO TENANT ISOLATION:** Any authenticated user can read/write ANY document from ANY fleet
- ❌ **NO SIZE LIMITS:** Can upload unlimited file sizes
- ❌ **NO TYPE RESTRICTIONS:** Can upload any file type
- ❌ **NO METADATA VALIDATION:** No checks on document metadata
- Line 7: `// TODO: Define proper storage rules in Phase 3`

**Proper Storage Rules Needed:**

```javascript
// Should check:
// - request.auth.token.fleetId matches document metadata
// - File size limits (e.g., < 10MB)
// - Content type restrictions (PDF, images only)
// - Path structure validation
```

### Emulator Wiring

**Auth (`apps/web/src/firebase/auth.ts`):**

```typescript
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
}
```

- ✅ Connects to emulator when env var is set

**Firestore (`apps/web/src/firebase/firestore.ts`):**

```typescript
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}
```

- ✅ Connects to emulator when env var is set

**Storage (`apps/web/src/firebase/storage.ts`):**

```typescript
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

- ✅ Connects to emulator when env var is set

### Environment Variables

**Firebase App Config (`apps/web/src/firebase/app.ts`):**

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
```

**Type Declarations (`apps/web/env.d.ts`):**

```typescript
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_USE_FIREBASE_EMULATORS?: string
}
```

- ✅ All env vars properly typed

**Example File (`.env.example`):**

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=carrier-ops-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carrier-ops-hub
VITE_FIREBASE_STORAGE_BUCKET=carrier-ops-hub.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_FIREBASE_EMULATORS=false
```

- ✅ Template provided in repo root

---

## 5) Functions & Backend Agent

### Exported Cloud Functions (`apps/functions/src/index.ts`)

**Callable Functions:**

- `bootstrapFleet` - Fleet creation for emulator/dev only

**HTTP Functions:**

- `samsaraWebhook` - Samsara webhook receiver (stub)
- `motiveWebhook` - Motive webhook receiver (stub)

**Firestore Triggers:**

- `onEventCreated` - Event document created trigger (stub)
- `onDocumentCreated` - Document uploaded trigger (stub)

**Scheduled Jobs:**

- `nightlyComplianceSweep` - Daily 2 AM EST compliance check (stub)

### bootstrapFleet Deep Dive (`apps/functions/src/callable/bootstrapFleet.ts`)

**Authentication Check:**

```typescript
if (!request.auth) {
  throw new HttpsError('unauthenticated', 'Must be authenticated')
}
```

- ✅ Rejects unauthenticated requests

**Emulator/Dev Restriction:**

```typescript
const isEmulator = process.env.FIREBASE_EMULATOR_HUB || process.env.FUNCTIONS_EMULATOR === 'true'
if (!isEmulator) {
  throw new HttpsError('failed-precondition', 'Bootstrap only available in emulator/dev')
}
```

- ✅ **CRITICAL SECURITY:** Only works in emulator
- ✅ Prevents production misuse

**Input Validation:**

```typescript
if (!fleetName || typeof fleetName !== 'string' || fleetName.trim().length === 0) {
  throw new HttpsError('invalid-argument', 'fleetName is required')
}
if (!Array.isArray(roles) || roles.length === 0) {
  throw new HttpsError('invalid-argument', 'roles must be a non-empty array')
}
```

- ✅ Validates fleetName (string, non-empty)
- ✅ Validates roles (array, non-empty)
- ⚠️ **MISSING:** No validation that roles are valid Role values

**Database Writes:**

1. **Fleet document:**

   ```typescript
   await fleetRef.set({
     id: fleetId,
     name: fleetName.trim(),
     createdAt: now,
     updatedAt: now,
   })
   ```

2. **User document:**

   ```typescript
   await userRef.set(
     {
       id: uid,
       fleetId,
       roles,
       createdAt: now,
       updatedAt: now,
     },
     { merge: true }
   )
   ```

3. **Driver document (if 'driver' role):**
   ```typescript
   if (roles.includes('driver')) {
     driverId = uid
     await driverRef.set({
       id: driverId,
       fleetId,
       userId: uid,
       firstName: '',
       lastName: '',
       // ... empty fields
     })
   }
   ```

**Custom Claims:**

```typescript
const customClaims = {
  fleetId,
  roles,
  ...(driverId && { driverId }),
}
await adminAuth.setCustomUserClaims(uid, customClaims)
```

- ✅ Sets fleetId for tenant isolation
- ✅ Sets roles array for authorization
- ✅ Sets driverId if driver role selected

**Return Value:**

```typescript
return { fleetId, roles, driverId }
```

- ✅ Client receives confirmation

### Read Models (`apps/functions/src/domain/readModels/`)

**updateDispatcherQueues.ts:**

```typescript
export async function updateDispatcherQueues(loadId: string) {
  // TODO: Update dispatcher queues based on load status
}
```

- ❌ **STUB:** Not implemented
- ❌ **NOT WIRED:** onEventCreated checks for loadId but updateDispatcherQueues does nothing

**updateBillingQueues.ts:**

```typescript
export async function updateBillingQueues(eventId: string) {
  // TODO: Update billing queues
}
```

- ❌ **STUB:** Not implemented
- ❌ **NOT USED:** Never called anywhere

### Alert Functions (`apps/functions/src/domain/alerts/`)

**evaluateHosRisk.ts:**

```typescript
export function evaluateHosRisk(driver: any) {
  // TODO: Implement HOS risk evaluation
  return 'LOW'
}
```

- ❌ **STUB:** Always returns 'LOW'

**evaluateLateRisk.ts:**

```typescript
export function evaluateLateRisk(load: any) {
  // TODO: Implement late risk evaluation logic
  return 'LOW'
}
```

- ❌ **STUB:** Always returns 'LOW'

---

## 6) Integrations Agent

### Samsara Webhook (`apps/functions/src/http/samsaraWebhook.ts`)

```typescript
export const samsaraWebhook = onRequest(async (request, response) => {
  logger.info('Samsara webhook received', { body: request.body })

  // TODO: Implement Samsara webhook handling
  // - Verify webhook signature
  // - Parse event type
  // - Create Event document

  response.status(200).json({ received: true })
})
```

**Status:** ❌ **STUB**

- ✅ Logs webhook body
- ❌ No signature verification
- ❌ No event parsing
- ❌ No database writes
- ❌ Always returns 200 (even for invalid requests)

### Motive Webhook (`apps/functions/src/http/motiveWebhook.ts`)

```typescript
export const motiveWebhook = onRequest(async (request, response) => {
  logger.info('Motive webhook received', { body: request.body })

  // TODO: Implement Motive webhook handling

  response.status(200).json({ received: true })
})
```

**Status:** ❌ **STUB**

- Same issues as Samsara webhook

### Integration Documentation

**Files Found:**

- `docs/integrations/samsara.md` - 187 lines, comprehensive API/webhook docs
- `docs/integrations/motive.md` - 205 lines, comprehensive API/webhook docs
- `docs/integrations/truckstop.md` - Load board integration
- `docs/integrations/dat.md` - Load board integration

**Samsara Documentation (`docs/integrations/samsara.md`):**

- ✅ API endpoints documented (vehicle locations, HOS logs)
- ✅ Webhook events documented (vehicle.location.update, hos.status_changed)
- ✅ Authentication described (API Key in `X-Api-Key` header)
- ✅ Example payloads provided
- ⚠️ **MISSING:** Signature verification implementation details
- ⚠️ **MISSING:** Retry/idempotency handling

**Motive Documentation (`docs/integrations/motive.md`):**

- ✅ API endpoints documented (locations, HOS, DVIR)
- ✅ Webhook events documented (location_updated, hos_violation)
- ✅ OAuth 2.0 mentioned
- ⚠️ **MISSING:** Token refresh flow
- ⚠️ **MISSING:** Rate limiting details

**Gaps Before Production:**

1. ❌ Webhook signature verification (prevent spoofing)
2. ❌ Idempotency keys (prevent duplicate events)
3. ❌ Retry logic (handle transient failures)
4. ❌ Dead letter queue (handle permanent failures)
5. ❌ Rate limiting (prevent abuse)
6. ❌ Entity ID mapping (Samsara vehicleId → our vehicleId)
7. ❌ Event deduplication (same event from multiple sources)
8. ❌ Schema validation (ensure webhook payloads match expected structure)

---

## 7) Code Quality & Testing Agent

### Test Framework

- ❌ **NOT PRESENT:** No test files found anywhere in repo
- ❌ **NOT CONFIGURED:** No vitest/jest/playwright in any package.json
- ❌ **NO CI:** No GitHub Actions or other CI config

### TypeScript Errors (20 found)

**Run Command:** `pnpm typecheck`  
**Result:** `Exit status 2`

**Errors in `apps/web`:**

1. **Unused Variables (17 errors):**
   - `apps/web/src/app/routing/routes/auth/bootstrap.tsx:30` - 'customClaims' declared but never used
   - `apps/web/src/domain/selectors/loadCard.ts:5` - 'load' parameter declared but never used
   - `apps/web/src/features/auth/api.ts:5` - 'email', 'password' declared but never used (stub)
   - `apps/web/src/features/auth/api.ts:15` - 'email' declared but never used (stub)
   - `apps/web/src/features/loads/api.ts:10,15,20` - stub function parameters unused
   - `apps/web/src/features/loads/utils.ts:10` - 'load' parameter unused (stub)
   - `apps/web/src/services/repos/documents.repo.ts:6,11,16` - stub parameters unused
   - `apps/web/src/services/repos/events.repo.ts:6,11` - stub parameters unused
   - `apps/web/src/services/repos/loads.repo.ts:3` - 'Timestamp' imported but unused

2. **Module Resolution Errors (3 errors):**
   - `apps/web/src/app/routing/routes/auth/index.ts:4` - Module './index' declares './index' locally but doesn't export it
   - `apps/web/src/app/routing/routes/dispatch/index.ts:4` - Circular self-export
   - `apps/web/src/app/routing/routes/driver/index.ts:4` - Circular self-export

**Root Cause:** Barrel export files (`index.ts`) that export from themselves:

```typescript
export * from './index' // ❌ Circular
```

### ESLint Errors

**Run Command:** `pnpm lint`  
**Result:** `Exit status 2`

**Error in `packages/shared`:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@typescript-eslint/parser'
```

**Root Cause:**

- ❌ `eslint.config.js` references `@typescript-eslint/parser`
- ❌ Package not installed in root or any workspace
- ❌ ESLint cannot parse TypeScript files

**Additional Issues:**

- ⚠️ No `@typescript-eslint/eslint-plugin` installed
- ⚠️ No TypeScript-specific rules configured
- ⚠️ No `eslint-plugin-react-hooks` for React rules

### Project References

```json
// tsconfig.base.json - NOT using project references
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext"
    // ... no "composite" or "references"
  }
}
```

- ❌ **NOT CONFIGURED:** TypeScript project references not set up
- ⚠️ Could improve build performance for large monorepos
- ⚠️ Shared package has `"composite": false` (was disabled to fix build)

### Dead Code & Unused Exports

**Layouts (`apps/web/src/app/layout/`):**

- `AppLayout.tsx` - Defined but not used (only TODO comment)
- `DriverLayout.tsx` - Defined but not used
- `RoleLayout.tsx` - Defined but not used

**Features (`apps/web/src/features/*/`):**

- `auth/api.ts` - All functions are stubs, never called
- `auth/hooks.ts` - `useCurrentUser()` stub never used
- `loads/api.ts` - Stub functions not used (real impl in repos)
- `loads/utils.ts` - Stub functions never called

**Domain (`apps/web/src/domain/selectors/`):**

- `loadCard.ts` - `selectLoadCardData()` stub never used

**Converters (`apps/web/src/firebase/converters/`):**

- `event.ts` - EventConverter not used anywhere
- `load.ts` - LoadConverter not used anywhere (repos use plain objects)

**Navigation:**

- `navConfig.ts` - Defined but never consumed by any component

### Lint Rule Gaps

**Missing Critical Rules:**

- `react-hooks/rules-of-hooks` - Ensure hooks called in right order
- `react-hooks/exhaustive-deps` - Catch missing dependencies in useEffect/useCallback
- `@typescript-eslint/no-unused-vars` - Already catching in tsc but should be in lint
- `@typescript-eslint/no-explicit-any` - 'any' used in many places (events, loads data)
- `@typescript-eslint/explicit-function-return-type` - No return types on many functions

---

## 8) Backlog & Next Steps Agent

### P0: Required for "Carrier-Useful Loop"

These are absolutely required before any carrier can use the system productively:

1. **Load Detail Page (Shared by Dispatch & Driver)**
   - **Route:** `/dispatch/loads/:loadId` and `/driver/loads/:loadId`
   - **File:** `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx`
   - **Status:** Stub with TODO comment
   - **Requirements:**
     - Display load details (customer, reference, status, rate)
     - Show stops list with addresses and times
     - Edit stop addresses/times
     - Dispatch view: assign driver/vehicle
     - Driver view: update status, complete stops

2. **Assignment Flow**
   - **Location:** Dispatch dashboard or load detail page
   - **Status:** Not implemented
   - **Requirements:**
     - Select driver from dropdown (active drivers only)
     - Select vehicle from dropdown
     - Update load status to 'ASSIGNED'
     - Set load.driverId and load.vehicleId
     - Create Event: 'LOAD_ASSIGNED'

3. **Driver Status Buttons → Create Events**
   - **Location:** Driver load detail page
   - **Status:** Not implemented
   - **Requirements:**
     - "Start Pickup" → status: 'AT_PICKUP', create Event
     - "Complete Pickup" → stop.isCompleted = true, status: 'IN_TRANSIT'
     - "Start Delivery" → status: 'AT_DELIVERY'
     - "Complete Delivery" → stop.isCompleted = true, status: 'DELIVERED'
     - All buttons create Event documents with eventType

4. **Document Upload → Storage + Documents Collection**
   - **Location:** Load detail page
   - **Status:** Stub in `services/repos/documents.repo.ts`
   - **Requirements:**
     - File input accepting PDF/images
     - Upload to Storage: `/documents/{loadId}/{fileName}`
     - Create document record in Firestore
     - Link document to load via documentId
     - Display uploaded docs on load detail
     - Download/preview functionality

5. **Billing Queue: Invoice-Ready vs Blocked**
   - **Location:** `/billing/dashboard`
   - **Status:** Stub
   - **Requirements:**
     - Query loads where status = 'DELIVERED'
     - Check if POD uploaded (doc type = 'POD')
     - Check if rate confirmation exists
     - Display two lists: "Ready to Invoice" and "Blocked"
     - Blocked reasons: missing POD, missing rate conf
     - "Create Invoice" button → generates invoice doc

### P1: Needed for Early Pilots

6. **Expenses + Reimbursements**
   - **Schema:** ✅ ExpenseSchema exists
   - **UI:** Not implemented
   - **Requirements:**
     - Driver submits expense (fuel, tolls, parking)
     - Attach receipt image
     - Manager approval flow
     - Reimbursement tracking

7. **Read Models for Queues**
   - **Files:** `apps/functions/src/domain/readModels/updateDispatcherQueues.ts`, `updateBillingQueues.ts`
   - **Status:** Stubs
   - **Requirements:**
     - `dispatcherQueues` collection: loads grouped by status
     - `billingQueues` collection: loads grouped by billing status
     - Update on Event creation
     - Used for dashboard list queries (faster than full collection scan)

8. **Firestore Composite Indexes**
   - **File:** `firebase/firestore.indexes.json`
   - **Status:** Empty array
   - **Needed Indexes:**
     ```json
     [
       {
         "collectionGroup": "loads",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "fleetId", "order": "ASCENDING" },
           { "fieldPath": "status", "order": "ASCENDING" },
           { "fieldPath": "updatedAt", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "loads",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "fleetId", "order": "ASCENDING" },
           { "fieldPath": "driverId", "order": "ASCENDING" },
           { "fieldPath": "status", "order": "ASCENDING" }
         ]
       },
       {
         "collectionGroup": "events",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "loadId", "order": "ASCENDING" },
           { "fieldPath": "createdAt", "order": "DESCENDING" }
         ]
       }
     ]
     ```

9. **Driver-Only Restrictions in Security Rules**
   - **File:** `firebase/firestore.rules`
   - **Current:** All fleet members can read all loads
   - **Needed:**
     ```javascript
     match /loads/{loadId} {
       allow read: if hasFleetId() && (
         resource.data.fleetId == request.auth.token.fleetId &&
         (resource.data.driverId == null ||
          resource.data.driverId == request.auth.token.driverId)
       );
     }
     ```

### P2: Scale & Hardening

10. **Safety/Compliance Expirations Board**
    - **Route:** `/safety/dashboard`
    - **Status:** Stub
    - **Requirements:**
      - List drivers with expiring licenses (< 30 days)
      - List vehicles with expiring inspections
      - List drivers approaching HOS limits
      - Alert notifications

11. **Maintenance DVIR Flow**
    - **Route:** `/maintenance/dashboard`
    - **Status:** Stub
    - **Requirements:**
      - Driver submits DVIR (Driver Vehicle Inspection Report)
      - Flag issues that need repair
      - Maintenance manager assigns repairs
      - Track repair completion

12. **Integrations Hardening**
    - **Current:** Webhook stubs always return 200
    - **Needed:**
      - Signature verification (Samsara: HMAC-SHA256, Motive: custom)
      - Retry logic with exponential backoff
      - Idempotency keys to prevent duplicate processing
      - Entity ID mapping (Samsara vehicleId → our vehicleId)
      - Dead letter queue for failed events
      - Rate limiting (per-fleet, per-minute)
      - Structured logging with correlation IDs

13. **Observability**
    - **Logging:** Basic `console.log` in functions
    - **Needed:**
      - Structured logging (JSON format)
      - Error reporting (Sentry or Cloud Error Reporting)
      - Performance monitoring (Firebase Performance)
      - Custom metrics (loads created, events processed)
      - Alerting (failed functions, high error rates)

### Known Risks

**Security:**

- ❌ **CRITICAL:** Storage rules allow ANY authenticated user to access ANY fleet's documents
- ⚠️ No role-based write restrictions in Firestore (any fleet member can modify anything)
- ⚠️ No field-level validation in security rules
- ⚠️ Webhook endpoints have no authentication/verification
- ⚠️ Custom claims never expire or refresh (user can escalate privileges)

**Costs:**

- ⚠️ No query limits (could scan entire collections)
- ⚠️ No pagination implemented (loads all results at once)
- ⚠️ Missing composite indexes will cause full collection scans
- ⚠️ No Cloud Storage lifecycle rules (old docs never deleted)
- ⚠️ Functions always cold start (no min instances configured)

**Query Patterns:**

- ⚠️ Loads query uses `orderBy('updatedAt', 'desc')` but no index exists
- ⚠️ Dashboard queries hit Firestore on every page load (no caching)
- ⚠️ Real-time listeners not used (polling pattern would be expensive)
- ⚠️ No limit on query result size

**Data Integrity:**

- ⚠️ Stop.loadId not set when creating load (added after)
- ⚠️ No transactions for multi-doc writes (load + stops)
- ⚠️ No referential integrity (can delete load without deleting stops)
- ⚠️ No soft deletes (actual deletion loses audit trail)

### Decisions to Lock

These constants/enums are used in queries and should be frozen:

**Load Status (must decide on ONE set):**

```typescript
// Current mismatch between schema and constants
// Pick one:
Option A: Use LoadSchema enum
'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'INVOICED' | 'PAID' | 'CANCELLED'

Option B: Use LOAD_STATUS constants
'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'AT_PICKUP' | 'AT_DELIVERY' | 'COMPLETED' | 'CANCELLED'

Recommendation: Merge to:
'AVAILABLE' | 'ASSIGNED' | 'AT_PICKUP' | 'IN_TRANSIT' | 'AT_DELIVERY' | 'DELIVERED' |
'READY_TO_INVOICE' | 'INVOICED' | 'PAID' | 'CANCELLED'
```

**Event Types (not defined yet):**

```typescript
// Must define before P0 work
export type EventType =
  | 'LOAD_CREATED'
  | 'LOAD_ASSIGNED'
  | 'PICKUP_STARTED'
  | 'PICKUP_COMPLETED'
  | 'IN_TRANSIT'
  | 'DELIVERY_STARTED'
  | 'DELIVERY_COMPLETED'
  | 'LOAD_CANCELLED'
  | 'DRIVER_STATUS_CHANGED'
  | 'LOCATION_UPDATE'
  | 'HOS_VIOLATION'
  | 'DOCUMENT_UPLOADED'
```

**Document Types:**

```typescript
// Current:
;'BOL' | 'POD' | 'RATE_CONFIRMATION' | 'INVOICE' | 'RECEIPT' | 'OTHER'

// Missing common types:
;'LUMPER_RECEIPT' |
  'SCALE_TICKET' |
  'FUEL_RECEIPT' |
  'TOLL_RECEIPT' |
  'INSURANCE_CERT' |
  'MC_AUTHORITY'
```

**Roles (fix mismatch):**

```typescript
// Current mismatch - must align:
// Constants: 'owner' | 'dispatcher' | 'fleet_manager' | 'maintenance_manager' | 'billing' | 'driver'
// UserSchema: 'OWNER' | 'DISPATCHER' | 'DRIVER' | 'BILLING' | 'SAFETY' | 'MAINTENANCE'

// Decision: Use lowercase, expand to:
type Role = 'owner' | 'dispatcher' | 'fleet_manager' | 'maintenance_manager' | 'billing' | 'driver'
```

---

## Complete TODO List (62 items)

### Firebase & Infrastructure (7)

1. `firebase/emulators/seed/seed.ts:3` - Implement emulator seeding
2. `firebase/emulators/seed/seed.ts:9-12` - Create test users, drivers, loads, documents
3. `firebase/storage.rules:7` - Define proper storage rules
4. `firebase/migrations/0001-initial-migration.ts:4` - Implement initial data migration
5. `firebase/migrations/0001-initial-migration.ts:9-11` - Set up collections, roles, settings
6. `firebase/firestore.rules:35` - Add owner-only write restrictions
7. `firebase/firestore.rules:43` - Add role-based restrictions for loads

### Backend Functions (6)

8. `apps/functions/src/domain/readModels/updateDispatcherQueues.ts:8` - Update dispatcher queues
9. `apps/functions/src/domain/readModels/updateBillingQueues.ts:8` - Update billing queues
10. `apps/functions/src/http/samsaraWebhook.ts:9` - Implement Samsara webhook handling
11. `apps/functions/src/http/motiveWebhook.ts:9` - Implement Motive webhook handling
12. `apps/functions/src/triggers/onEventCreated.ts:13` - Implement event-driven logic
13. `apps/functions/src/triggers/onDocumentCreated.ts:12` - Implement document processing

### Backend Jobs & Alerts (3)

14. `apps/functions/src/jobs/nightlyComplianceSweep.ts:15` - Implement compliance checks
15. `apps/functions/src/domain/alerts/evaluateHosRisk.ts:6` - Implement HOS risk evaluation
16. `apps/functions/src/domain/alerts/evaluateLateRisk.ts:6` - Implement late risk evaluation

### Shared Utilities (2)

17. `packages/shared/src/utils/ids.ts:6` - Implement load number generation
18. `packages/shared/src/utils/ids.ts:13` - Implement document ID generation

### Web - Data Layer (8)

19. `apps/web/src/services/repos/events.repo.ts:7` - Fetch events for a load
20. `apps/web/src/services/repos/events.repo.ts:12` - Create event
21. `apps/web/src/services/repos/documents.repo.ts:7` - Fetch documents for a load
22. `apps/web/src/services/repos/documents.repo.ts:12` - Upload document to Storage
23. `apps/web/src/services/repos/documents.repo.ts:17` - Delete document
24. `apps/web/src/firebase/converters/event.ts:7` - Add event fields
25. `apps/web/src/firebase/converters/load.ts:7` - Add load fields
26. `apps/web/src/firebase/converters/load.ts:12,18` - Convert Load to/from Firestore

### Web - Features & Utilities (11)

27. `apps/web/src/features/auth/hooks.ts:4,14` - Implement auth hook, return current user
28. `apps/web/src/features/auth/api.ts:6` - Implement sign in with Firebase Auth
29. `apps/web/src/features/auth/api.ts:11` - Implement sign out
30. `apps/web/src/features/auth/api.ts:16` - Implement password reset
31. `apps/web/src/features/loads/api.ts:6,11,16,21` - Implement load CRUD
32. `apps/web/src/features/loads/utils.ts:6` - Format status for display
33. `apps/web/src/features/loads/utils.ts:11` - Calculate total revenue
34. `apps/web/src/domain/selectors/loadCard.ts:6` - Transform load data for card display
35. `apps/web/src/lib/date.ts:4,9` - Implement date/datetime formatting
36. `apps/web/src/lib/money.ts:4,9` - Format money, parse money string
37. `apps/web/src/styles/globals.css:3` - Add Tailwind directives

### Web - Route Implementations (7)

38. `apps/web/src/app/routing/routes/billing/dashboard.tsx:13` - Implement billing dashboard
39. `apps/web/src/app/routing/routes/auth/forgot-password.tsx:13` - Implement forgot password form
40. `apps/web/src/app/routing/routes/safety/dashboard.tsx:13` - Implement safety dashboard
41. `apps/web/src/app/routing/routes/owner/dashboard.tsx:13` - Implement owner dashboard
42. `apps/web/src/app/routing/routes/maintenance/dashboard.tsx:13` - Implement maintenance dashboard
43. `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx:15` - Implement load detail view
44. `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx:15` - Implement driver load detail view

### Web - Layout Components (3)

45. `apps/web/src/app/layout/AppLayout.tsx:12` - Add header, sidebar, etc.
46. `apps/web/src/app/layout/DriverLayout.tsx:12` - Add driver-specific navigation
47. `apps/web/src/app/layout/RoleLayout.tsx:13` - Add role-specific navigation

---

## Recommendations

### Immediate (This Week)

1. **Fix TypeScript errors** - Remove circular barrel exports, add return types
2. **Fix ESLint** - Install `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
3. **Fix schema mismatches** - Align LoadSchema status with LOAD_STATUS constants
4. **Fix Storage rules** - Add tenant isolation with fleetId metadata check
5. **Create EventType enum** - Define all event types before implementing P0 features

### Short-term (Next Sprint)

1. **Implement P0 features** - Load detail, assignment, driver status, docs, billing queue
2. **Add composite indexes** - Create indexes before querying in production
3. **Set up testing** - Add vitest, write unit tests for critical paths
4. **Add error boundaries** - Catch React errors, display fallback UI

### Medium-term (Next Month)

1. **Implement P1 features** - Expenses, read models, driver restrictions
2. **Set up CI/CD** - GitHub Actions for typecheck/lint/test on PRs
3. **Add observability** - Structured logging, error reporting, metrics
4. **Harden integrations** - Signature verification, retries, deduplication

### Long-term (Next Quarter)

1. **Implement P2 features** - Safety board, maintenance DVIR, full integration hardening
2. **Performance optimization** - Real-time listeners, query caching, pagination
3. **Mobile app** - React Native or PWA for driver experience
4. **Advanced features** - Route optimization, automated dispatch, ML predictions

---

## Appendix: Build & Deploy Status

**Local Build:** ✅ `pnpm build` succeeds  
**Local Typecheck:** ❌ `pnpm typecheck` fails with 20 errors  
**Local Lint:** ❌ `pnpm lint` fails with module not found error  
**Vercel Build:** ✅ Successfully deploys to production  
**Vercel URL:** `https://carrier-ops-hub.vercel.app` (confirmed working)

**Why Vercel succeeds but typecheck fails locally:**

- Vercel uses `tsc` for build which is more lenient than `--noEmit` mode
- Unused variable warnings don't prevent JavaScript output
- Module resolution works at runtime even with circular exports (but TypeScript complains)

**Critical Path to Production:**

1. Fix Storage security rules (P0 blocker)
2. Align schemas with constants (P0 blocker)
3. Implement load detail page (P0 feature)
4. Add composite indexes (P1 performance)
5. Set up monitoring (P1 ops requirement)

---

**End of Report**
