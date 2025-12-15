# Truth Sweep (Verified Baseline)  Phase 5.0.2c

**Repo:** carrier-ops-hub  
**Date:** 2025-12-14

This file is a **verified baseline** for the current repo state.

- For the exact git SHA/branch and commands run/output during this repair pass, see: `docs/phase-5.0.2c-report.md`.

---

## Roles (Canonical)

**Source file:** `packages/shared/src/constants/roles.ts`

**Excerpt:**

```ts
export const ROLES = [
  'owner',
  'dispatcher',
  'fleet_manager',
  'maintenance_manager',
  'billing',
  'driver',
] as const
```

**Role values (exact):**
- `owner`
- `dispatcher`
- `fleet_manager`
- `maintenance_manager`
- `billing`
- `driver`

---

## Shared Schemas (Zod)

This section documents the **canonical Zod schemas** used by the shared package.

### User

**Source file:** `packages/shared/src/schemas/user.ts`  
**Inferred type:** `User` (`export type User = z.infer<typeof UserSchema>`)  

**Excerpt:**

```ts
export const UserSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.enum(ROLES)).min(1),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `email: string`
- `firstName?: string`
- `lastName?: string`
- `roles: Role[]` (min 1)
- `isActive: boolean` (default true)
- `createdAt: number`
- `updatedAt: number`

### Driver

**Source file:** `packages/shared/src/schemas/driver.ts`  
**Inferred type:** `Driver`

**Excerpt:**

```ts
export const DriverSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  driverId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  licenseNumber: z.string(),
  licenseState: z.string().length(2),
  licenseExpiry: z.number().optional(),
  phoneNumber: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `driverId?: string`
- `firstName: string`
- `lastName: string`
- `email?: string`
- `licenseNumber: string`
- `licenseState: string` (length 2)
- `licenseExpiry?: number`
- `phoneNumber: string`
- `status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'`
- `createdAt: number`
- `updatedAt: number`

### Vehicle

**Source file:** `packages/shared/src/schemas/vehicle.ts`  
**Inferred type:** `Vehicle`

**Excerpt:**

```ts
export const VehicleSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  vehicleNumber: z.string(),
  vin: z.string().length(17),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']).default('ACTIVE'),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `vehicleNumber: string`
- `vin: string` (length 17)
- `make: string`
- `model: string`
- `year: number` (int 1900..2100)
- `licensePlate: string`
- `status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'` (default 'ACTIVE')
- `createdAt: number`
- `updatedAt: number`

### Stop

**Source file:** `packages/shared/src/schemas/stop.ts`  
**Inferred type:** `Stop`

**Excerpt:**

```ts
export const StopSchema = z.object({
  id: z.string(),
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

**Field list (top-level):**
- `id: string`
- `type: 'PICKUP' | 'DELIVERY'`
- `sequence: number`
- `address: { street: string; city: string; state: string; zip: string; country: string }`
- `scheduledTime: number`
- `actualTime: number | null`
- `isCompleted: boolean` (default false)
- `createdAt: number`
- `updatedAt: number`

### Load

**Source file:** `packages/shared/src/schemas/load.ts`  
**Inferred type:** `Load`

**Excerpt:**

```ts
export const LoadSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  loadNumber: z.string(),
  status: z.enum(loadStatusValues),
  driverId: z.string().nullable(),
  vehicleId: z.string().nullable(),
  stops: z.array(StopSchema).min(2),
  pickupDate: z.number(),
  deliveryDate: z.number(),
  rateCents: z.number().int().min(0),
  notes: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `loadNumber: string`
- `status: LoadStatus` (enum derived from `packages/shared/src/constants/statuses.ts`)
- `driverId: string | null`
- `vehicleId: string | null`
- `stops: Stop[]` (min length 2)
- `pickupDate: number`
- `deliveryDate: number`
- `rateCents: number`
- `notes: string | null`
- `createdAt: number`
- `updatedAt: number`

### Event

**Source file:** `packages/shared/src/schemas/event.ts`  
**Inferred type:** `Event`

**Excerpt:**

```ts
export const EventSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  loadId: z.string(),
  type: z.enum(eventTypeValues),
  actorUid: z.string(),
  createdAt: z.number(),
  payload: z.record(z.any()).optional(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `loadId: string`
- `type: EventType` (enum derived from `packages/shared/src/constants/events.ts`)
- `actorUid: string`
- `createdAt: number`
- `payload?: Record<string, unknown>` (schema allows any values)

### Document

**Source file:** `packages/shared/src/schemas/document.ts`  
**Inferred type:** `Document`

**Excerpt:**

```ts
export const DocumentSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  loadId: z.string(),
  type: z.enum(['BOL', 'POD', 'RATE_CONFIRMATION', 'INVOICE', 'RECEIPT', 'OTHER']),
  fileName: z.string(),
  storagePath: z.string(),
  url: z.string().url(),
  contentType: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
  notes: z.string().optional(),
  amount: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})
```

**Field list (top-level):**
- `id: string`
- `fleetId: string`
- `loadId: string`
- `type: 'BOL' | 'POD' | 'RATE_CONFIRMATION' | 'INVOICE' | 'RECEIPT' | 'OTHER'`
- `fileName: string`
- `storagePath: string`
- `url: string`
- `contentType: string`
- `size: number`
- `uploadedBy: string`
- `notes?: string`
- `amount?: number`
- `createdAt: number`
- `updatedAt: number`

---

## Canonical Assignment Fields

**Load assignment fields** (per `packages/shared/src/schemas/load.ts`):
- `driverId: string | null`
- `vehicleId: string | null`

---

## Known drift / mismatches (must fix next phase)

This list is intentionally short and **evidence-backed**.

1) **`bootstrapFleet` writes fields not in shared schemas**
- Evidence: `apps/functions/src/callable/bootstrapFleet.ts` writes a `users` document without required `email` from `UserSchema` (`packages/shared/src/schemas/user.ts`).
- Evidence: `apps/functions/src/callable/bootstrapFleet.ts` writes a `drivers` document containing `userId` and `isActive`, but `DriverSchema` defines `driverId` and has no `isActive` field (`packages/shared/src/schemas/driver.ts`).

2) **`documents.repo` upload is missing required `fileName`**
- Evidence: `apps/web/src/services/repos/documents.repo.ts` constructs `document = { fleetId, loadId, type, storagePath, url, contentType, size, uploadedBy, createdAt, updatedAt, ... }` without `fileName`.
- Canon: `packages/shared/src/schemas/document.ts` requires `fileName: z.string()`.

3) **Load detail pages render `Stop.address` incorrectly**
- Canon: `packages/shared/src/schemas/stop.ts` defines `address: AddressSchema` (object), `scheduledTime: number`, `actualTime: number | null`.
- Drift:
  - `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx` treats `stop.address` as a string and reads `scheduledDate`/`scheduledTime` as date+string.
  - `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx` treats `stop.address` as a string and reads `scheduledDate`/`scheduledTime` as date+string.
  - `apps/web/src/app/routing/routes/driver/home.tsx` treats `currentLoad.stops[0].address` as a string.

4) **Unguarded non-auth routes (missing `beforeLoad` guard)**
- Guarded examples:
  - `apps/web/src/app/routing/routes/index.tsx` redirects when `!context.auth.user`.
  - `apps/web/src/app/routing/routes/dispatch/dashboard.tsx` uses `requireAuth()` and `requireRole()`.
  - `apps/web/src/app/routing/routes/driver/home.tsx` uses `requireAuth()` and `requireRole()`.
- Route files with **no `beforeLoad` guard** (non-auth paths):
  - `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx`
  - `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx`
  - `apps/web/src/app/routing/routes/billing/dashboard.tsx`
  - `apps/web/src/app/routing/routes/owner/dashboard.tsx`
  - `apps/web/src/app/routing/routes/maintenance/dashboard.tsx`
  - `apps/web/src/app/routing/routes/safety/dashboard.tsx`

---

**Statement of scope:** No code behavior changes were made in Phase 5.0.2c; documentation only.
