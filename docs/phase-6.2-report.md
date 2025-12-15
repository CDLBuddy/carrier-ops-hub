# Phase 6.2 Report: Transactional Driver Actions + Stop Completion Engine

**Date:** December 15, 2024
**Status:** ✅ Complete

---

## Overview

Phase 6.2 makes driver workflow operations atomic and correct by moving business logic into the repository layer with guaranteed event creation. This eliminates the "UI as source of truth" pattern where events could be written but status updates fail, causing data drift.

**Key Improvements:**

1. **Driver actions are now transactional** - status change + stop completion + event creation happen atomically
2. **Driver ownership enforcement** - repo-level checks ensure drivers can only modify their assigned loads
3. **Stop completion engine** - consistent actualTime and isCompleted updates based on transition rules
4. **Document upload atomicity** - Firestore document + event created in single batch (after Storage upload)
5. **Safer repoUtils** - withDocId now throws on missing data instead of silently failing

---

## Files Created

### apps/web/src/features/loads/lifecycle.ts (142 lines)

**Purpose:** Business logic for driver load status transitions

**Exports:**

- `DriverLoadAction` type: 'ARRIVE_PICKUP' | 'DEPART_PICKUP' | 'ARRIVE_DELIVERY' | 'MARK_DELIVERED'
- `computeDriverTransition(load, action, now)`: Computes next status, stop updates, event type/payload
- `assertDriverActionAllowed(load, claimsDriverId)`: Validates driver ownership

**Transition Rules:**

| Current Status | Action          | Next Status | Stop Update             | Event Type     |
| -------------- | --------------- | ----------- | ----------------------- | -------------- |
| ASSIGNED       | ARRIVE_PICKUP   | AT_PICKUP   | None                    | STATUS_CHANGED |
| AT_PICKUP      | DEPART_PICKUP   | IN_TRANSIT  | Pickup stop completed   | STOP_COMPLETED |
| IN_TRANSIT     | ARRIVE_DELIVERY | AT_DELIVERY | None                    | STATUS_CHANGED |
| AT_DELIVERY    | MARK_DELIVERED  | DELIVERED   | Delivery stop completed | STOP_COMPLETED |

**Stop Completion Details:**

- Sets `actualTime: now`
- Sets `isCompleted: true`
- Sets `updatedAt: now`
- Includes stopId and stopType in event payload

---

## Files Updated

### apps/web/src/services/repos/loads.repo.ts

**Added:** `applyDriverAction()` method (94 lines)

```typescript
async applyDriverAction({
  fleetId,
  loadId,
  action,
  actorUid,
  actorDriverId,
}) {
  // 1. Validate inputs
  if (!actorUid || !actorDriverId) throw

  // 2. Fetch load document
  const load = withDocId<LoadData>(snapshot)

  // 3. Assert fleet match
  assertFleetMatch({ expectedFleetId: fleetId, actualFleetId: load.fleetId })

  // 4. Enforce driver ownership
  if (load.driverId !== actorDriverId) throw new Error('Forbidden')

  // 5. Compute transition using lifecycle module
  const transition = computeDriverTransition(load, action, now)

  // 6. Apply stop updates to stops array
  const updatedStops = [...load.stops]
  // Apply transition.stopUpdates

  // 7. Batch write: load update + event creation
  const batch = writeBatch(db)
  batch.update(loadRef, { status, stops, updatedAt })
  batch.set(eventRef, { type, actorUid, createdAt, payload })
  await batch.commit()

  return { id, status, stops, updatedAt }
}
```

**Benefits:**

- **Atomic**: Both operations succeed or both fail
- **Secure**: Driver ownership enforced at repo layer
- **Consistent**: Stop updates follow business rules
- **Auditable**: Every action creates exactly one event

---

### apps/web/src/features/loads/hooks.ts

**Added:** `useDriverAction(loadId)` hook

```typescript
export function useDriverAction(loadId: string) {
  const { claims, user } = useAuth()
  const fleetId = claims.fleetId
  const driverId = claims.driverId

  return useMutation({
    mutationFn: (action: DriverLoadAction) =>
      loadsRepo.applyDriverAction({
        fleetId: fleetId || '',
        loadId,
        action,
        actorUid: user?.uid || '',
        actorDriverId: driverId || '',
      }),
    onSuccess: () => {
      // Invalidate loads detail, loads list, events list
      queryClient.invalidateQueries(...)
    },
  })
}
```

**Usage:**

```tsx
const { mutate: performAction, isPending } = useDriverAction(loadId)
// Later:
<button onClick={() => performAction('ARRIVE_PICKUP')} disabled={isPending}>
```

---

### apps/web/src/app/routing/routes/driver/loads.$loadId.tsx

**Removed:**

- `handleStatusChange()` function (manually created events + updated load)
- Import of `eventsRepo` and `EVENT_TYPE`
- Direct calls to `eventsRepo.create()`

**Added:**

- `useDriverAction` hook instead of `useUpdateLoad`
- `isPending` state from mutation
- Disabled button state while pending
- "Updating..." button text during mutation

**Before:**

```typescript
const handleStatusChange = async (newStatus, eventType) => {
  await eventsRepo.create({ ... }) // Separate operation
  updateLoad({ status: newStatus }) // Could fail after event created
}
<button onClick={() => handleStatusChange(LOAD_STATUS.AT_PICKUP, EVENT_TYPE.STATUS_CHANGED)}>
```

**After:**

```typescript
const { mutate: performAction, isPending } = useDriverAction(loadId)
<button
  onClick={() => performAction('ARRIVE_PICKUP')}
  disabled={isPending}
  className="... disabled:bg-gray-400"
>
  {isPending ? 'Updating...' : 'Arrived at Pickup'}
</button>
```

**Result:** No more "event written but status failed" drift. Buttons disabled during updates.

---

### apps/web/src/services/repos/documents.repo.ts

**Changed:** `upload()` method now uses `writeBatch` for document + event

**Before:**

```typescript
await uploadBytes(storageRef, file)
const url = await getDownloadURL(storageRef)
await setDoc(docRef, document)        // Separate operation
await eventsRepo.create({ ... })      // Could fail after document created
```

**After:**

```typescript
await uploadBytes(storageRef, file)
const url = await getDownloadURL(storageRef)

const batch = writeBatch(db)
batch.set(docRef, document)           // Atomic batch
batch.set(eventRef, { ... })          // Both succeed or both fail
await batch.commit()
```

**Note:** Storage upload cannot be atomic with Firestore (different systems), but Firestore document + event are now atomic.

---

### apps/web/src/services/repos/repoUtils.ts

**Enhanced:** `withDocId()` safety check

**Before:**

```typescript
export function withDocId<T>(snap: DocumentSnapshot): T & { id: string } {
  const data = snap.data()
  return { ...data, id: snap.id } as T & { id: string }
}
// Could return { undefined, id: '...' } if snapshot doesn't exist
```

**After:**

```typescript
export function withDocId<T>(snap: DocumentSnapshot): T & { id: string } {
  const data = snap.data()
  if (!data) {
    throw new Error(`Snapshot ${snap.id} has no data - document may not exist`)
  }
  return { ...data, id: snap.id } as T & { id: string }
}
```

**Benefit:** Fails fast with clear error instead of propagating `undefined` data.

---

## Driver Action Flow Diagram

```
Driver clicks "Arrived at Pickup"
  ↓
useDriverAction('ARRIVE_PICKUP')
  ↓
loadsRepo.applyDriverAction()
  ↓
├─ Fetch load document
├─ Assert fleet match
├─ Enforce driver ownership (load.driverId === actorDriverId)
├─ computeDriverTransition(load, 'ARRIVE_PICKUP', now)
│    └─ Returns: { nextStatus: 'AT_PICKUP', stopUpdates: [], eventType: 'STATUS_CHANGED' }
├─ Apply stop updates (none in this case)
└─ writeBatch:
     ├─ batch.update(loadRef, { status: 'AT_PICKUP', updatedAt: now })
     └─ batch.set(eventRef, { type: 'STATUS_CHANGED', payload: { previousStatus: 'ASSIGNED', newStatus: 'AT_PICKUP' } })
  ↓
batch.commit() ← ATOMIC
  ↓
Query invalidations (loads detail, loads list, events list)
  ↓
UI re-renders with updated data
```

---

## Transition Action Table

| Action          | Status Transition        | Stop Changes                                | Event Type     | Event Payload                                                             |
| --------------- | ------------------------ | ------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| ARRIVE_PICKUP   | ASSIGNED → AT_PICKUP     | None                                        | STATUS_CHANGED | `{ previousStatus, newStatus }`                                           |
| DEPART_PICKUP   | AT_PICKUP → IN_TRANSIT   | Pickup stop: actualTime, isCompleted=true   | STOP_COMPLETED | `{ previousStatus, newStatus, stopId, stopType: 'PICKUP', actualTime }`   |
| ARRIVE_DELIVERY | IN_TRANSIT → AT_DELIVERY | None                                        | STATUS_CHANGED | `{ previousStatus, newStatus }`                                           |
| MARK_DELIVERED  | AT_DELIVERY → DELIVERED  | Delivery stop: actualTime, isCompleted=true | STOP_COMPLETED | `{ previousStatus, newStatus, stopId, stopType: 'DELIVERY', actualTime }` |

---

## Security Enforcement

**Driver Ownership Check** (in `applyDriverAction`):

```typescript
if (load.driverId !== actorDriverId) {
  throw new Error(`Forbidden: load ${loadId} not assigned to driver ${actorDriverId}`)
}
```

**Prevents:**

- Driver A modifying Driver B's loads
- Unassigned drivers attempting actions
- Missing driverId in claims (throws early if `!actorDriverId`)

**Also enforces:**

- `actorUid` must be present (throws if empty string)
- Fleet match (via `assertFleetMatch`)
- Valid transitions (lifecycle module throws on invalid actions)

---

## Error Handling

**Lifecycle Module Errors:**

```typescript
// Invalid transition
if (currentStatus !== LOAD_STATUS.ASSIGNED) {
  throw new Error(`Cannot arrive at pickup from status: ${currentStatus}`)
}

// Missing stop
if (pickupIndex === -1) {
  throw new Error('No pickup stop found')
}
```

**Repo Layer Errors:**

```typescript
// Missing inputs
if (!actorUid) throw new Error('actorUid is required')
if (!actorDriverId) throw new Error('actorDriverId is required')

// Not found
if (!snapshot.exists()) throw new Error('Load not found')

// Unauthorized
if (load.driverId !== actorDriverId) throw new Error('Forbidden')
```

**repoUtils Errors:**

```typescript
// Empty snapshot
if (!data) throw new Error(`Snapshot ${snap.id} has no data`)
```

---

## Manual Testing Checklist

### Driver Actions

- [ ] Driver can only see loads assigned to them
- [ ] "Arrived at Pickup" button only shows when status = ASSIGNED
- [ ] Clicking "Arrived at Pickup" creates STATUS_CHANGED event
- [ ] "Depart Pickup" button only shows when status = AT_PICKUP
- [ ] Clicking "Depart Pickup" sets pickup stop actualTime + isCompleted=true
- [ ] "Depart Pickup" creates STOP_COMPLETED event with stopId in payload
- [ ] "Arrived at Delivery" button only shows when status = IN_TRANSIT
- [ ] "Mark Delivered" button only shows when status = AT_DELIVERY
- [ ] "Mark Delivered" sets delivery stop actualTime + isCompleted=true
- [ ] Buttons are disabled during mutation (isPending)
- [ ] Button text changes to "Updating..." during mutation
- [ ] Each action creates exactly ONE event in timeline
- [ ] Status and stop updates are consistent (no drift)

### Security

- [ ] Driver cannot modify loads assigned to other drivers
- [ ] Driver without driverId in claims gets clear error
- [ ] Invalid status transitions throw errors
- [ ] Actions on non-existent loads throw "Load not found"

### Document Upload

- [ ] Uploading document creates DOCUMENT_UPLOADED event
- [ ] If document upload fails, no event is created
- [ ] If Firestore batch fails, document creation is rolled back
- [ ] Document and event are always in sync

### Edge Cases

- [ ] Load with missing pickup stop throws error on "Depart Pickup"
- [ ] Load with missing delivery stop throws error on "Mark Delivered"
- [ ] Non-existent snapshot throws clear "has no data" error
- [ ] Empty actorUid throws "actorUid is required"

---

## Quality Gates

### Pre-commit Checks

```bash
pnpm seed:all       # Verify seed data loads correctly
pnpm typecheck      # No TypeScript errors
pnpm lint           # No linting warnings
pnpm build          # All packages build successfully
```

### Development Server

```bash
pnpm --filter web dev
```

### Manual Testing Flow

1. Seed database with test data
2. Log in as driver user
3. Navigate to assigned load
4. Click through each status transition button
5. Verify events appear in timeline
6. Check Firestore console for stop actualTime/isCompleted
7. Try to access another driver's load (should fail)
8. Upload document and verify event creation

---

## Dependencies

**No new dependencies added.** Uses existing:

- Firebase Firestore modular SDK (`writeBatch`)
- TanStack Query (mutation hooks)
- React (hooks)

---

## Breaking Changes

**None for end users.** Driver workflow remains the same from UI perspective.

**Internal API changes:**

- Driver route no longer imports `eventsRepo` or calls `eventsRepo.create()` directly
- `useUpdateLoad` replaced with `useDriverAction` in driver route
- `withDocId` now throws on missing data (previously returned `{ undefined, id }`)

---

## Deviations from Plan

**None.** All steps executed as specified:

1. ✅ Created lifecycle.ts module
2. ✅ Added applyDriverAction to loads.repo
3. ✅ Added useDriverAction hook
4. ✅ Refactored driver load detail page
5. ✅ Made document upload atomic
6. ✅ Tightened repoUtils withDocId
7. ✅ Created this report

---

## Performance Impact

**Positive:**

- Reduced Firestore operations (1 batch vs 2 separate writes)
- Eliminated race conditions between status update and event creation
- Fewer round trips to server

**Neutral:**

- Slightly larger payload in single batch vs separate operations
- Dynamic import of lifecycle module (cached after first use)

---

## Future Enhancements (Phase 6.2.1+)

**Timeline Rendering:**

- Pretty labels for event types
- Payload rendering (show driverId, vehicleId, stopType in UI)
- Event grouping by day/hour
- Filtering by event type

**Additional Actions:**

- Cancel load (ASSIGNED → CANCELLED)
- Unassign load (dispatcher action)
- Reassign to different driver
- Add/edit notes at each stop

**Stop Management:**

- Add new stops mid-transit
- Reorder stops
- Mark stop as skipped
- Capture signature/photo at stop

**Validation:**

- Integrate `devValidate` with Zod schemas
- Runtime payload validation
- Schema version tracking

---

## Summary

Phase 6.2 successfully transformed driver actions from "UI as source of truth" to proper domain operations with guaranteed atomicity and event tracking. The lifecycle module encapsulates business rules, the repo layer enforces security, and the UI simply triggers actions. This foundation enables reliable auditing, prevents data drift, and supports future workflow enhancements.

**Key Wins:**

- ✅ Zero data drift (atomic operations)
- ✅ Strong security (driver ownership enforced)
- ✅ Consistent stop completion
- ✅ Clean separation of concerns (UI → hooks → repo → lifecycle)
- ✅ Backward compatible (no schema changes)
