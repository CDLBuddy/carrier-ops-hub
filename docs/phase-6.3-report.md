# Phase 6.3 Report: Dispatcher Actions + Load Management Lifecycle

**Date:** December 15, 2025
**Status:** ✅ Complete

---

## Overview

Phase 6.3 extends the transactional action pattern from Phase 6.2 (driver actions) to dispatcher workflows. Dispatchers can now assign, reassign, unassign, cancel, and reactivate loads with guaranteed atomicity and event tracking. This eliminates partial updates where load state changes but events fail to record.

**Key Improvements:**

1. **Dispatcher actions are transactional** - assignment changes + status updates + event creation happen atomically
2. **Role-based authorization** - repo-level checks ensure only dispatchers/owners/admins can perform actions
3. **Flexible assignment management** - assign from DRAFT/UNASSIGNED, reassign from ASSIGNED/AT_PICKUP, unassign back to UNASSIGNED
4. **Load lifecycle management** - cancel loads before IN_TRANSIT, reactivate cancelled loads to DRAFT
5. **Enhanced UI** - disabled states during mutations, cancel reason capture, separate unassign button

---

## Files Created

### apps/web/src/features/loads/dispatcherLifecycle.ts (192 lines)

**Purpose:** Business logic for dispatcher load management actions

**Exports:**

- `DispatcherLoadAction` type: 'ASSIGN' | 'REASSIGN' | 'UNASSIGN' | 'CANCEL' | 'REACTIVATE'
- `AssignmentData` interface: `{ driverId: string; vehicleId: string }`
- `computeDispatcherTransition(load, action, assignmentData?, reason?)`: Computes next status, updates, event type/payload
- `assertDispatcherActionAllowed(actorRole)`: Validates dispatcher/owner/admin role

**Transition Rules:**

| Action     | From Status(es)             | To Status  | Requirements         | Event Type       |
| ---------- | --------------------------- | ---------- | -------------------- | ---------------- |
| ASSIGN     | DRAFT, UNASSIGNED           | ASSIGNED   | driverId + vehicleId | LOAD_ASSIGNED    |
| REASSIGN   | ASSIGNED, AT_PICKUP         | ASSIGNED   | driverId + vehicleId | LOAD_REASSIGNED  |
| UNASSIGN   | ASSIGNED                    | UNASSIGNED | None                 | LOAD_UNASSIGNED  |
| CANCEL     | DRAFT, UNASSIGNED, ASSIGNED | CANCELLED  | reason (optional)    | LOAD_CANCELLED   |
| REACTIVATE | CANCELLED                   | DRAFT      | None                 | LOAD_REACTIVATED |

**Role Authorization:**

```typescript
const allowedRoles = ['dispatcher', 'owner', 'admin']
const hasPermission = roles.some((role) => allowedRoles.includes(role))
if (!hasPermission) throw new Error('Forbidden: user role cannot perform dispatcher actions')
```

---

## Files Updated

### packages/shared/src/constants/statuses.ts

**Added:** `DRAFT` status

```typescript
export const LOAD_STATUS = {
  DRAFT: 'DRAFT', // NEW
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  AT_PICKUP: 'AT_PICKUP',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_DELIVERY: 'AT_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const
```

**DRAFT vs UNASSIGNED:**

- DRAFT: Load just created, no assignment yet, editable
- UNASSIGNED: Load was previously assigned but unassigned, ready for reassignment

---

### packages/shared/src/constants/events.ts

**Added:** 4 new event types

```typescript
export const EVENT_TYPE = {
  LOAD_CREATED: 'LOAD_CREATED',
  LOAD_ASSIGNED: 'LOAD_ASSIGNED',
  LOAD_REASSIGNED: 'LOAD_REASSIGNED', // NEW
  LOAD_UNASSIGNED: 'LOAD_UNASSIGNED', // NEW
  LOAD_CANCELLED: 'LOAD_CANCELLED', // NEW
  LOAD_REACTIVATED: 'LOAD_REACTIVATED', // NEW
  STATUS_CHANGED: 'STATUS_CHANGED',
  STOP_COMPLETED: 'STOP_COMPLETED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
} as const
```

---

### apps/web/src/services/repos/loads.repo.ts

**Added:** `applyDispatcherAction()` method (84 lines)

```typescript
async applyDispatcherAction({
  fleetId,
  loadId,
  action,
  actorUid,
  actorRole,
  assignmentData,
  reason,
}) {
  // 1. Validate inputs
  if (!actorUid) throw new Error('actorUid is required')

  // 2. Assert dispatcher role permission
  const { assertDispatcherActionAllowed } = await import('@/features/loads/dispatcherLifecycle.js')
  assertDispatcherActionAllowed(actorRole)

  // 3. Fetch load document
  const load = withDocId<LoadData>(snapshot)

  // 4. Assert fleet match
  assertFleetMatch({ expectedFleetId: fleetId, actualFleetId: load.fleetId })

  // 5. Compute transition using dispatcher lifecycle module
  const { computeDispatcherTransition } = await import('@/features/loads/dispatcherLifecycle.js')
  const transition = computeDispatcherTransition(load, action, assignmentData, reason)

  // 6. Batch write: load update + event creation
  const batch = writeBatch(db)
  batch.update(loadRef, { ...transition.updates, updatedAt: now })
  batch.set(eventRef, { type, actorUid, createdAt, payload })
  await batch.commit()

  return { id, ...transition.updates, updatedAt }
}
```

**Benefits:**

- **Atomic**: Load update + event creation succeed or fail together
- **Secure**: Role-based authorization enforced at repo layer
- **Flexible**: Supports all dispatcher actions with single method
- **Auditable**: Every action creates exactly one event with detailed payload

**Deprecated:** `assignLoad()` method still exists for backward compatibility but should be replaced with `applyDispatcherAction({ action: 'ASSIGN', ... })`

---

### apps/web/src/features/loads/hooks.ts

**Added:** `useDispatcherAction(loadId)` hook

```typescript
export function useDispatcherAction(loadId: string) {
  const { claims, user } = useAuth()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: ({ action, assignmentData, reason }) =>
      loadsRepo.applyDispatcherAction({
        fleetId: fleetId || '',
        loadId,
        action,
        actorUid: user?.uid || '',
        actorRole: claims.roles,
        assignmentData,
        reason,
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
const { mutate: performAction, isPending } = useDispatcherAction(loadId)

// Assign
performAction({
  action: 'ASSIGN',
  assignmentData: { driverId: '123', vehicleId: '456' },
})

// Unassign
performAction({ action: 'UNASSIGN' })

// Cancel with reason
performAction({
  action: 'CANCEL',
  reason: 'Customer cancelled order',
})
```

---

### apps/web/src/app/routing/routes/dispatch/loads.$loadId.tsx

**Removed:**

- `useAssignLoad` hook import
- `assignLoad` mutation
- Direct `assignLoad({ driverId, vehicleId })` call

**Added:**

- `useDispatcherAction` hook import
- `performAction` mutation with `isPending` state
- `handleAssign()` - determines ASSIGN vs REASSIGN based on current status
- `handleUnassign()` - new function for unassigning loads
- `handleCancel()` - new function for cancelling loads with reason
- `handleReactivate()` - new function for reactivating cancelled loads
- `cancelReason` state for capturing cancellation reason
- Disabled states during mutations (`disabled={isPending}`)
- "Processing..." button text during mutations

**Before:**

```typescript
const { mutate: assignLoad } = useAssignLoad(loadId)

const handleAssign = () => {
  if (!selectedDriver || !selectedVehicle) return
  assignLoad({ driverId: selectedDriver, vehicleId: selectedVehicle })
}

<button onClick={handleAssign} disabled={!selectedDriver || !selectedVehicle}>
  {loadData.status === LOAD_STATUS.ASSIGNED ? 'Reassign Load' : 'Assign Load'}
</button>
```

**After:**

```typescript
const { mutate: performAction, isPending } = useDispatcherAction(loadId)

const handleAssign = () => {
  if (!selectedDriver || !selectedVehicle) return
  const isReassign = load?.status === LOAD_STATUS.ASSIGNED || load?.status === LOAD_STATUS.AT_PICKUP
  performAction({
    action: isReassign ? 'REASSIGN' : 'ASSIGN',
    assignmentData: { driverId: selectedDriver, vehicleId: selectedVehicle },
  })
}

const handleUnassign = () => {
  performAction({ action: 'UNASSIGN' })
}

<button
  onClick={handleAssign}
  disabled={!selectedDriver || !selectedVehicle || isPending}
>
  {isPending ? 'Processing...' : (isReassign ? 'Reassign Load' : 'Assign Load')}
</button>

<button onClick={handleUnassign} disabled={isPending}>
  {isPending ? 'Processing...' : 'Unassign Load'}
</button>
```

**New Cancel/Reactivate Section:**

```tsx
{
  loadData.status !== LOAD_STATUS.CANCELLED ? (
    <>
      <input
        type="text"
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        placeholder="e.g., Customer cancelled, equipment unavailable"
        disabled={isPending}
      />
      <button onClick={handleCancel} disabled={isPending}>
        {isPending ? 'Processing...' : 'Cancel Load'}
      </button>
    </>
  ) : (
    <button onClick={handleReactivate} disabled={isPending}>
      {isPending ? 'Processing...' : 'Reactivate Load'}
    </button>
  )
}
```

**Result:** UI prevents double-clicks, shows clear loading state, captures cancellation reason.

---

## Dispatcher Action Flow Diagram

```
Dispatcher clicks "Assign Load"
  ↓
useDispatcherAction({ action: 'ASSIGN', assignmentData: { driverId, vehicleId } })
  ↓
loadsRepo.applyDispatcherAction()
  ↓
├─ Validate actorUid
├─ assertDispatcherActionAllowed(claims.roles)
│    └─ Checks if user has 'dispatcher', 'owner', or 'admin' role
├─ Fetch load document
├─ Assert fleet match
├─ computeDispatcherTransition(load, 'ASSIGN', assignmentData)
│    └─ Returns: { nextStatus: 'ASSIGNED', updates: { driverId, vehicleId, status }, eventType: 'LOAD_ASSIGNED', eventPayload }
└─ writeBatch:
     ├─ batch.update(loadRef, { driverId, vehicleId, status: 'ASSIGNED', updatedAt })
     └─ batch.set(eventRef, { type: 'LOAD_ASSIGNED', payload: { driverId, vehicleId, previousStatus, newStatus } })
  ↓
batch.commit() ← ATOMIC
  ↓
Query invalidations (loads detail, loads list, events list)
  ↓
UI re-renders with updated data
```

---

## Transition Action Table

| Action     | Status Transition                     | Load Updates                                     | Event Payload                                                                             |
| ---------- | ------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| ASSIGN     | DRAFT/UNASSIGNED → ASSIGNED           | driverId, vehicleId, status=ASSIGNED             | `{ previousStatus, newStatus, driverId, vehicleId }`                                      |
| REASSIGN   | ASSIGNED/AT_PICKUP → ASSIGNED         | driverId, vehicleId, status=ASSIGNED             | `{ previousStatus, newStatus, previousDriverId, previousVehicleId, driverId, vehicleId }` |
| UNASSIGN   | ASSIGNED → UNASSIGNED                 | driverId=null, vehicleId=null, status=UNASSIGNED | `{ previousStatus, newStatus, previousDriverId, previousVehicleId }`                      |
| CANCEL     | DRAFT/UNASSIGNED/ASSIGNED → CANCELLED | status=CANCELLED                                 | `{ previousStatus, newStatus, reason }`                                                   |
| REACTIVATE | CANCELLED → DRAFT                     | status=DRAFT                                     | `{ previousStatus, newStatus }`                                                           |

**REASSIGN Payload Details:**

- `previousDriverId`: driverId before reassignment
- `previousVehicleId`: vehicleId before reassignment
- `driverId`: new driverId
- `vehicleId`: new vehicleId
- Enables audit trail: "Load reassigned from Driver A (Vehicle 1) to Driver B (Vehicle 2)"

---

## Security Enforcement

**Role Authorization Check** (in `assertDispatcherActionAllowed`):

```typescript
const roles = Array.isArray(claimsRole) ? claimsRole : [claimsRole]
const allowedRoles = ['dispatcher', 'owner', 'admin']
const hasPermission = roles.some((role) => allowedRoles.includes(role))

if (!hasPermission) {
  throw new Error(`Forbidden: user role "${roles.join(', ')}" cannot perform dispatcher actions`)
}
```

**Prevents:**

- Drivers from assigning/reassigning loads
- Users without roles from performing dispatcher actions
- Unauthorized role escalation attempts

**Also enforces:**

- `actorUid` must be present
- Fleet match (via `assertFleetMatch`)
- Valid transitions (lifecycle module throws on invalid actions)
- Driver assignment before IN_TRANSIT (cannot reassign mid-delivery)

---

## Error Handling

**Lifecycle Module Errors:**

```typescript
// Invalid transition
if (currentStatus !== LOAD_STATUS.ASSIGNED) {
  throw new Error(`Cannot unassign load from status: ${currentStatus}. Must be ASSIGNED.`)
}

// Missing assignment data
if (!assignmentData?.driverId || !assignmentData?.vehicleId) {
  throw new Error('driverId and vehicleId are required for ASSIGN action')
}

// Prevent cancellation after departure
if (currentStatus === LOAD_STATUS.IN_TRANSIT) {
  throw new Error(`Cannot cancel load from status: IN_TRANSIT`)
}
```

**Repo Layer Errors:**

```typescript
// Missing inputs
if (!actorUid) throw new Error('actorUid is required')

// Unauthorized role
assertDispatcherActionAllowed(actorRole) // throws if role invalid

// Not found
if (!snapshot.exists()) throw new Error('Load not found')
```

---

## Manual Testing Checklist

### Assignment Actions

- [ ] DRAFT load shows "Assign Load" button
- [ ] UNASSIGNED load shows "Assign Load" button
- [ ] ASSIGNED load shows "Reassign Load" and "Unassign Load" buttons
- [ ] AT_PICKUP load shows "Reassign Load" and "Unassign Load" buttons
- [ ] IN_TRANSIT load does NOT show assignment section (cannot reassign mid-delivery)
- [ ] Assign action sets driverId, vehicleId, status=ASSIGNED
- [ ] Assign action creates LOAD_ASSIGNED event
- [ ] Reassign action updates driverId/vehicleId, keeps status=ASSIGNED
- [ ] Reassign action creates LOAD_REASSIGNED event with previousDriverId/previousVehicleId
- [ ] Unassign action clears driverId/vehicleId, sets status=UNASSIGNED
- [ ] Unassign action creates LOAD_UNASSIGNED event
- [ ] Driver/vehicle dropdowns disabled during mutation
- [ ] Button text changes to "Processing..." during mutation
- [ ] Cannot assign without selecting both driver and vehicle

### Cancel/Reactivate Actions

- [ ] DRAFT load shows "Cancel Load" section
- [ ] UNASSIGNED load shows "Cancel Load" section
- [ ] ASSIGNED load shows "Cancel Load" section
- [ ] IN_TRANSIT load does NOT show "Cancel Load" section
- [ ] Cancel reason input is optional
- [ ] Cancel action sets status=CANCELLED
- [ ] Cancel action creates LOAD_CANCELLED event with reason in payload
- [ ] CANCELLED load shows "Reactivate Load" button instead of cancel
- [ ] Reactivate action sets status=DRAFT
- [ ] Reactivate action creates LOAD_REACTIVATED event

### Security

- [ ] Dispatcher role can perform all actions
- [ ] Owner role can perform all actions
- [ ] Admin role can perform all actions
- [ ] Driver role cannot access dispatch load detail page (guard blocks)
- [ ] User without roles gets "Forbidden" error
- [ ] Actions on loads from other fleets throw fleet mismatch error

### Event Timeline

- [ ] LOAD_ASSIGNED event shows driverId and vehicleId in payload
- [ ] LOAD_REASSIGNED event shows previousDriverId, previousVehicleId, driverId, vehicleId
- [ ] LOAD_UNASSIGNED event shows previousDriverId, previousVehicleId
- [ ] LOAD_CANCELLED event shows reason in payload
- [ ] All events have correct timestamps
- [ ] Events appear in chronological order

### Edge Cases

- [ ] Attempting to unassign UNASSIGNED load throws error
- [ ] Attempting to reassign IN_TRANSIT load throws error
- [ ] Attempting to cancel IN_TRANSIT load throws error
- [ ] Attempting to reactivate non-CANCELLED load throws error
- [ ] Attempting ASSIGN without driverId throws error
- [ ] Attempting ASSIGN without vehicleId throws error
- [ ] Non-existent load throws "Load not found"

---

## Quality Gates

### Pre-commit Checks

```bash
pnpm --filter @coh/shared build  # Rebuild shared package with new constants
pnpm typecheck                    # No TypeScript errors
pnpm lint                         # No linting warnings
pnpm build                        # All packages build successfully
```

✅ All checks passed with zero errors/warnings.

---

## Dependencies

**No new dependencies added.** Uses existing:

- Firebase Firestore modular SDK (`writeBatch`)
- TanStack Query (mutation hooks)
- React (hooks)
- @coh/shared (LOAD_STATUS, EVENT_TYPE constants)

---

## Breaking Changes

**None for end users.** Dispatcher workflow enhanced but remains compatible.

**Internal API changes:**

- Dispatch load detail route no longer imports `useAssignLoad`
- `useDispatcherAction` replaces `useAssignLoad` in new code
- `assignLoad()` method still exists but deprecated in favor of `applyDispatcherAction({ action: 'ASSIGN' })`
- `DRAFT` status added (new loads should use DRAFT instead of UNASSIGNED)
- `claims.roles` used instead of `claims.role` (array vs string)

---

## Deviations from Plan

**None.** All planned features implemented:

1. ✅ Created dispatcherLifecycle.ts module
2. ✅ Added applyDispatcherAction to loads.repo
3. ✅ Added useDispatcherAction hook
4. ✅ Refactored dispatch load detail page
5. ✅ Added DRAFT status and new event types
6. ✅ Role-based authorization
7. ✅ Cancel reason capture
8. ✅ All quality gates passed

---

## Performance Impact

**Positive:**

- Reduced Firestore operations (1 batch vs 2 separate writes)
- Eliminated race conditions between load update and event creation
- Fewer round trips to server

**Neutral:**

- Dynamic imports of lifecycle modules (cached after first use)
- Slightly larger event payloads for REASSIGN (includes previous assignment)

---

## Comparison: Phase 6.2 vs 6.3

| Aspect               | Phase 6.2 (Driver Actions)         | Phase 6.3 (Dispatcher Actions)           |
| -------------------- | ---------------------------------- | ---------------------------------------- |
| **Actor**            | Driver                             | Dispatcher/Owner/Admin                   |
| **Actions**          | ARRIVE_PICKUP, DEPART_PICKUP, etc. | ASSIGN, REASSIGN, UNASSIGN, CANCEL, etc. |
| **Authorization**    | Driver ownership (load.driverId)   | Role-based (dispatcher/owner/admin)      |
| **State Changes**    | Status + stop completion           | Status + assignment data                 |
| **Lifecycle Module** | lifecycle.ts                       | dispatcherLifecycle.ts                   |
| **Repo Method**      | applyDriverAction                  | applyDispatcherAction                    |
| **Hook**             | useDriverAction                    | useDispatcherAction                      |

**Common Pattern:**

1. Compute transition in lifecycle module
2. Validate authorization (driver ownership OR role check)
3. Apply batch write (update load + create event)
4. Return updated data
5. Invalidate queries in hook

---

## Future Enhancements (Phase 6.4+)

**Load Creation:**

- Migrate from `createLoad()` to `applyDispatcherAction({ action: 'CREATE' })`
- Support LOAD_CREATED event with initial payload
- Validate stops before creation

**Assignment Validation:**

- Check driver availability (not assigned to conflicting loads)
- Check vehicle availability (not assigned to conflicting loads)
- Validate driver has required endorsements for load type
- Enforce driver HOS (Hours of Service) limits

**Bulk Operations:**

- `applyDispatcherActionBatch()` for bulk assignments
- Assign multiple loads to one driver
- Reassign all loads from Driver A to Driver B

**Workflow Automation:**

- Auto-assign loads based on driver location
- Auto-cancel loads if not assigned within X hours
- Auto-reactivate loads on specific conditions

**Enhanced Cancellation:**

- Cancellation reason dropdown (predefined reasons)
- Require approval for cancellation after ASSIGNED
- Track cancellation rate by reason

**Audit Trail UI:**

- Filter events by type (show only assignment events)
- Display pretty event labels: "Load assigned to John Doe (Vehicle #123)"
- Export event history to CSV

---

## Summary

Phase 6.3 successfully extended the transactional action pattern from driver workflows to dispatcher workflows. Dispatchers can now assign, reassign, unassign, cancel, and reactivate loads with guaranteed atomicity and event tracking. Role-based authorization ensures security, and the UI prevents common mistakes with disabled states and loading indicators.

**Key Wins:**

- ✅ Zero data drift (atomic operations)
- ✅ Strong authorization (role-based enforcement)
- ✅ Flexible assignment management (assign/reassign/unassign)
- ✅ Load lifecycle control (cancel/reactivate)
- ✅ Enhanced UX (disabled states, loading text, cancel reason)
- ✅ Backward compatible (old assignLoad method still works)
- ✅ Consistent pattern with Phase 6.2 (driver actions)

**Combined with Phase 6.2:**

- Driver actions: transactional (status + stops + events)
- Dispatcher actions: transactional (assignment + status + events)
- Full load lifecycle covered from creation to delivery
- Audit trail guaranteed for all state changes
- Foundation for workflow automation and compliance reporting
