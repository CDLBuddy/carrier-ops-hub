# Mismatch Matrix — Phase 5.0.2c

**Date:** 2025-12-14  

This matrix ties **shared schemas** ↔ **UI routes** ↔ **repos/functions** and flags verified mismatches.

---

## users

**Schema source:** `packages/shared/src/schemas/user.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| Producer (bootstrap) | `apps/functions/src/callable/bootstrapFleet.ts` | n/a | `users/{uid}`: `id`, `fleetId`, `roles`, `createdAt`, `updatedAt` (and optionally `driverId`) | **Yes**: missing required `email` (schema requires `email: string`). |
| Rules | `firebase/firestore.rules` | n/a | n/a | Rules allow `users/{uid}` read/write for authenticated user; no schema enforcement. |

---

## drivers

**Schema source:** `packages/shared/src/schemas/driver.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| Producer (bootstrap) | `apps/functions/src/callable/bootstrapFleet.ts` | n/a | `drivers/{driverId}`: writes `id`, `fleetId`, `userId`, `firstName`, `lastName`, `licenseNumber`, `licenseState`, `phoneNumber`, `isActive`, `createdAt`, `updatedAt` | **Yes**: schema has `driverId?` (not `userId`), requires `status`, and does not define `isActive`. Also `licenseState` is written as `''` but schema requires length 2. |
| Rules | `firebase/firestore.rules` | n/a | n/a | Tenant-scoped by `fleetId`. |

---

## vehicles

**Schema source:** `packages/shared/src/schemas/vehicle.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| UI routes | `apps/web/src/app/routing/routes/**` | None found in route components (assignment UI accepts free-text IDs) | None | n/a |
| Rules | `firebase/firestore.rules` | n/a | n/a | Tenant-scoped by `fleetId`. |

---

## loads

**Schema source:** `packages/shared/src/schemas/load.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| List UI (dispatch) | `apps/web/src/app/routing/routes/dispatch/dashboard.tsx` | `load.id`, `load.loadNumber`, `load.status`, `load.customerName`, `load.updatedAt` | Creates load via `useCreateLoad()` with `status: 'UNASSIGNED'`, `customerName`, `referenceNumber`, `stops: Stop[]` | **Likely**: schema requires `pickupDate` and `deliveryDate`; this route does not supply them. |
| Repo (create) | `apps/web/src/services/repos/loads.repo.ts` | n/a | Writes `loads/*` with `fleetId`, `loadNumber`, `status`, `customerName`, `referenceNumber`, `stops`, `driverId`, `vehicleId`, `rateCents`, `notes`, `createdAt`, `updatedAt` | **Yes**: does not set required schema fields `pickupDate` and `deliveryDate` from `packages/shared/src/schemas/load.ts`. |
| Detail UI (dispatch) | `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx` | `load.loadNumber`, `load.status`, `load.driverId`, `load.vehicleId`, `stop.type`, `stop.address`, `stop.scheduledDate`, `stop.scheduledTime` | Updates via `useUpdateLoad()` with `{ driverId, vehicleId, status: LOAD_STATUS.ASSIGNED }` | **Yes**: stop shape is treated as `address: string` + `scheduledDate/scheduledTime`, but schema defines `address: object` + `scheduledTime: number`. |
| Home UI (driver) | `apps/web/src/app/routing/routes/driver/home.tsx` | `load.driverId`, `load.status`, `load.loadNumber`, `load.stops[0].address` | None | **Yes**: reads `stops[0].address` as string, but schema defines object. |
| Detail UI (driver) | `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx` | `load.status`, `load.loadNumber`, stop fields as above | Updates via `useUpdateLoad()` with `{ status }` | **Yes**: same stop shape mismatch as dispatch detail. |
| Guarding | `apps/web/src/app/routing/routes/dispatch/dashboard.tsx` | n/a | n/a | Guarded via `beforeLoad` + `requireAuth`/`requireRole`. |
| Guarding | `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx` | n/a | n/a | **Yes (routing mismatch)**: no `beforeLoad` guard present. |

---

## events

**Schema source:** `packages/shared/src/schemas/event.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| Repo (create + list) | `apps/web/src/services/repos/events.repo.ts` | Lists by `fleetId`, `loadId`, ordered by `createdAt` | Creates event with `fleetId`, `loadId`, `type`, `actorUid`, `createdAt: Date.now()`, optional `payload` | No known mismatch: aligns with `EventSchema` required fields. |
| Producer (driver load detail) | `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx` | Reads event timeline (`event.type`, `event.createdAt`) | Calls `eventsRepo.create(...)` | No known mismatch (repo provides `createdAt`). |
| Producer (document upload) | `apps/web/src/services/repos/documents.repo.ts` | n/a | Calls `eventsRepo.create(...)` with payload including `fileName` | No known mismatch (repo provides `createdAt`). |

---

## documents

**Schema source:** `packages/shared/src/schemas/document.ts`

| Producer / Consumer | File | Reads | Writes | Mismatch vs schema |
|---|---|---|---|---|
| Repo (list + upload) | `apps/web/src/services/repos/documents.repo.ts` | Lists documents for load ordered by `createdAt` | Writes `fleetId`, `loadId`, `type`, `storagePath`, `url`, `contentType`, `size`, `uploadedBy`, `createdAt`, `updatedAt`, optional `notes`, optional `amount` | **Yes**: does not write required `fileName` (schema requires `fileName: string`). |
| Detail UI (dispatch) | `apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx` | Reads doc `type`, `createdAt`, `url` | Uploads via `useUploadDocument()` with `docType`, `notes` | Indirect mismatch inherited from repo missing `fileName`. |
| Detail UI (driver) | `apps/web/src/app/routing/routes/driver/loads.$loadId.tsx` | Reads doc `type`, `createdAt`, `url` | Uploads via `useUploadDocument()` with `docType`, `notes` | Indirect mismatch inherited from repo missing `fileName`. |
| Billing UI | `apps/web/src/app/routing/routes/billing/dashboard.tsx` | Reads document `type` to compute readiness | None | **Yes (routing mismatch)**: no `beforeLoad` guard present. |

