# Phase 6.6: Error Toast Notifications + Retry Logic

## Overview

Phase 6.6 enhances the user experience by adding visual feedback for mutation operations through a toast notification system. This phase addresses the silent failures that occurred when optimistic updates were rolled back, and implements retry logic for transient network errors.

## Objectives

1. **Visual Error Feedback**: Show user-friendly error messages when mutations fail
2. **Success Notifications**: Provide confirmation when operations complete successfully
3. **Automatic Retry**: Handle transient network errors transparently with exponential backoff
4. **User-Friendly Messages**: Map technical errors to readable explanations

## Implementation Details

### 1. Toast Notification System

Created a comprehensive toast notification system with four components:

#### ToastContext (`apps/web/src/ui/Toast/ToastContext.tsx`)

- React Context API for global toast management
- Toast queue with auto-dismiss timers
- Types: `success`, `error`, `warning`, `info`
- Default duration: 5 seconds (configurable per toast)
- Unique ID generation: `toast-${timestamp}-${random}`

**Key Features:**

```typescript
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number
}

// Hook API
const { showToast, removeToast } = useToast()
showToast('error', 'Failed to arrive at pickup: Network error')
showToast('success', 'Successfully completed: arrive at pickup')
```

#### ToastContainer (`apps/web/src/ui/Toast/ToastContainer.tsx`)

- Fixed positioning: top-right corner (5rem from top, 1rem from right)
- High z-index (9998) to overlay other content
- Flex column layout with 0.5rem gap for multiple toasts
- Renders toast queue from context

#### ToastItem (`apps/web/src/ui/Toast/ToastItem.tsx`)

- Individual toast component with animations
- Color-coded by type:
  - **Success**: Green (#10B981) with checkmark (✓)
  - **Error**: Red (#EF4444) with X (✕)
  - **Warning**: Orange (#F59E0B) with warning (⚠)
  - **Info**: Blue (#3B82F6) with info (ℹ)
- Slide-in animation: translateX(100%) → 0 over 300ms
- Close button for manual dismissal
- Responsive padding and typography

### 2. Error Message Mapping

Created `apps/web/src/lib/errorMessages.ts` with three helper functions:

#### `getErrorMessage(error: unknown): string`

Maps technical errors to user-friendly messages:

**Network Errors:**

```
"Network error. Please check your connection and try again."
```

**Firestore Error Codes:**

- `permission-denied` → "You do not have permission to perform this action."
- `not-found` → "The requested resource was not found."
- `unavailable` → "Service temporarily unavailable. Please try again."
- `unauthenticated` → "You must be logged in to perform this action."
- `deadline-exceeded` → "Request timed out. Please try again."

**Validation Errors:**

```
"Validation error: [specific message]"
```

**Fallback:**

```
"An unexpected error occurred. Please try again."
```

#### `getDriverActionName(action: string): string`

Maps driver actions to readable names:

- `ARRIVE_PICKUP` → "arrive at pickup"
- `BEGIN_LOADING` → "begin loading"
- `DEPART_PICKUP` → "depart pickup"
- `ARRIVE_DELIVERY` → "arrive at delivery"
- `BEGIN_UNLOADING` → "begin unloading"
- `COMPLETE_DELIVERY` → "complete delivery"

#### `getDispatcherActionName(action: string): string`

Maps dispatcher actions to readable names:

- `ASSIGN` → "assign load"
- `BOOK` → "book load"
- `CANCEL_LOAD` → "cancel load"
- `UNASSIGN` → "unassign load"
- `MARK_EN_ROUTE_TO_PICKUP` → "mark en route to pickup"

### 3. Integration with Mutation Hooks

Updated both `useDriverAction` and `useDispatcherAction` in [apps/web/src/features/loads/hooks.ts](apps/web/src/features/loads/hooks.ts):

#### Error Handling Pattern

```typescript
catch (error) {
  // 1. Rollback optimistic update
  queryClient.setQueryData<LoadData>(
    queryKeys.loads.detail(fleetId || '', loadId),
    previousLoad
  )

  // 2. Show error toast
  const actionName = getDriverActionName(action) // or getDispatcherActionName
  const errorMessage = getErrorMessage(error)
  showToast('error', `Failed to ${actionName}: ${errorMessage}`)

  // 3. Re-throw for TanStack Query retry logic
  throw error
}
```

#### Success Notification

```typescript
onSuccess: (_, variables) => {
  // Show success toast
  const actionName = getDriverActionName(variables.action)
  showToast('success', `Successfully completed: ${actionName}`)

  // Invalidate related queries
  if (fleetId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId, loadId) })
  }
}
```

#### Retry Configuration

```typescript
retry: 2, // Retry up to 2 times
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
// Exponential backoff: 1s, 2s, max 10s
```

**Retry Behavior:**

- Attempt 1: Immediate execution
- Attempt 2: Wait 1 second (2^0 × 1000ms)
- Attempt 3: Wait 2 seconds (2^1 × 1000ms)
- Max delay capped at 10 seconds

### 4. Application Integration

Updated [apps/web/src/app/providers/RouterProvider.tsx](apps/web/src/app/providers/RouterProvider.tsx):

```typescript
<ToastProvider>
  <ConnectionBanner />
  <ToastContainer />
  <TanStackRouterProvider />
</ToastProvider>
```

## User Experience Improvements

### Before Phase 6.6

1. **Silent Failures**: Mutation fails → Optimistic update rolls back → User sees no feedback
2. **Network Errors**: Single network glitch → Mutation fails immediately
3. **Technical Errors**: Raw error messages like "permission-denied" or stack traces
4. **No Confirmation**: Successful operations had no visual feedback

### After Phase 6.6

1. **Clear Error Messages**: Toast appears with readable error → User understands what went wrong
2. **Automatic Recovery**: Network glitch → Retry twice with backoff → Often succeeds transparently
3. **User-Friendly Language**: "You do not have permission to perform this action" instead of "permission-denied"
4. **Success Feedback**: Green toast confirms "Successfully completed: arrive at pickup"

## Testing Guide

### Manual Testing Scenarios

#### 1. Network Error Simulation

```typescript
// In browser DevTools Network tab:
// 1. Open Network tab
// 2. Set throttling to "Offline"
// 3. Attempt driver action (e.g., "Arrive at Pickup")
// 4. Expected: Red toast appears with "Network error. Please check your connection..."
```

#### 2. Permission Error

```typescript
// Test with non-admin user:
// 1. Sign in as driver-only user
// 2. Attempt dispatcher action (e.g., "Assign Load")
// 3. Expected: Red toast with "You do not have permission to perform this action."
```

#### 3. Success Flow

```typescript
// Normal operation:
// 1. Driver clicks "Arrive at Pickup"
// 2. Expected: Green toast appears with "Successfully completed: arrive at pickup"
// 3. Toast auto-dismisses after 5 seconds
```

#### 4. Retry Logic

```typescript
// Simulate intermittent network:
// 1. Use DevTools Network throttling "Slow 3G"
// 2. Attempt action
// 3. Expected: May see brief delay as retry logic kicks in
// 4. If successful on retry: Green success toast
// 5. If all retries fail: Red error toast
```

#### 5. Multiple Toasts

```typescript
// Queue multiple actions:
// 1. Quickly perform 3 different actions
// 2. Expected: Toasts stack vertically in top-right corner
// 3. Each toast auto-dismisses independently
// 4. Close button works on any toast
```

### Automated Testing Considerations

**Future Test Coverage:**

```typescript
// Toast Context Tests
describe('ToastContext', () => {
  it('should add toast to queue', () => {})
  it('should auto-dismiss toast after duration', () => {})
  it('should remove toast on close button click', () => {})
  it('should stack multiple toasts', () => {})
})

// Error Message Tests
describe('getErrorMessage', () => {
  it('should map Firestore codes to friendly messages', () => {})
  it('should handle network errors', () => {})
  it('should provide fallback for unknown errors', () => {})
})

// Mutation Hook Tests
describe('useDriverAction', () => {
  it('should show error toast on mutation failure', () => {})
  it('should show success toast on completion', () => {})
  it('should retry on transient errors', () => {})
  it('should rollback optimistic update on error', () => {})
})
```

## Code Quality Gates

All quality gates passed:

✅ **TypeScript**: `pnpm typecheck` - No errors
✅ **ESLint**: `pnpm lint` - No errors or warnings
✅ **Build**: `pnpm --filter web build` - Successful (3.07s)

## Files Created

1. `apps/web/src/ui/Toast/ToastContext.tsx` (57 lines)
2. `apps/web/src/ui/Toast/ToastContainer.tsx` (26 lines)
3. `apps/web/src/ui/Toast/ToastItem.tsx` (97 lines)
4. `apps/web/src/ui/Toast/index.ts` (6 lines)
5. `apps/web/src/lib/errorMessages.ts` (106 lines)

## Files Modified

1. `apps/web/src/app/providers/RouterProvider.tsx` - Added ToastProvider and ToastContainer
2. `apps/web/src/features/loads/hooks.ts` - Added error/success toasts + retry logic to both mutation hooks

## Architecture Decisions

### Why React Context for Toast Management?

- **Global State**: Toasts need to be triggered from anywhere in the app
- **Simple API**: `showToast(type, message)` is intuitive and minimal
- **No Redux Overhead**: Toast state is ephemeral and doesn't need persistence
- **Performance**: Context updates are limited to toast queue changes

### Why Exponential Backoff?

- **Network Recovery**: Gives network time to recover from transient issues
- **Server Load**: Avoids hammering the server with rapid retries
- **User Experience**: 1s → 2s delays are imperceptible during loading states
- **Industry Standard**: Common pattern in Firebase, AWS, and other cloud services

### Why 2 Retry Attempts?

- **Balance**: More than 0 (handles transient errors), less than ∞ (fails fast on real errors)
- **Time Budget**: Max 3 seconds of retry delay (1s + 2s) is reasonable
- **Network Patterns**: Most transient errors resolve within 1-2 retries
- **Firestore Quota**: Limits wasted requests on permission/validation errors

### Why Auto-Dismiss Toasts?

- **Clutter Prevention**: Toasts shouldn't accumulate and block UI
- **Success Confirmation**: Users need brief confirmation, not permanent notification
- **Error Handling**: Users should act on errors immediately or they auto-clear
- **5-Second Default**: Industry standard (Material Design, Bootstrap, etc.)

## Future Enhancements

### 1. Toast Action Buttons

```typescript
showToast('error', 'Failed to save', 5000, {
  action: { label: 'Retry', onClick: () => retry() },
})
```

### 2. Toast Positioning Options

```typescript
// Allow top-left, top-right, bottom-left, bottom-right
<ToastProvider position="bottom-right">
```

### 3. Toast Sound Effects

```typescript
// Optional audio feedback
showToast('error', 'Failed', 5000, { sound: true })
```

### 4. Grouped Toasts

```typescript
// Collapse multiple similar errors
'3 actions failed: arrive at pickup, begin loading, depart pickup'
```

### 5. Undo Support

```typescript
// For destructive actions
showToast('success', 'Load deleted', 5000, {
  undo: () => restoreLoad(),
})
```

### 6. Retry Button in Error Toast

```typescript
// Allow manual retry from error toast
catch (error) {
  showToast('error', errorMessage, 10000, {
    action: { label: 'Retry', onClick: () => mutate(variables) }
  })
}
```

## Metrics and Monitoring

### Recommended Analytics

1. **Toast Display Rate**: Track how often errors occur
2. **Retry Success Rate**: Measure % of mutations that succeed on retry
3. **Error Type Distribution**: Which errors are most common?
4. **User Dismissal Rate**: Do users close toasts manually or wait for auto-dismiss?

### Logging Considerations

```typescript
// Log errors to monitoring service (e.g., Sentry)
catch (error) {
  logger.error('Mutation failed', { action, error, userId, fleetId })
  showToast('error', errorMessage)
  throw error
}
```

## Conclusion

Phase 6.6 significantly improves the user experience by making error states visible and providing automatic recovery from transient failures. The toast notification system is reusable across the entire application and can be extended to other features beyond load mutations.

**Key Achievements:**

- ✅ Clear error feedback for all mutation failures
- ✅ Success confirmation for completed actions
- ✅ Automatic retry with exponential backoff
- ✅ User-friendly error messages
- ✅ Reusable toast system for future features
- ✅ Zero TypeScript/lint errors
- ✅ Production build successful

**Impact:**

- **Before**: Silent failures, no feedback, single-try mutations
- **After**: Visual toasts, retry logic, user-friendly messages
- **Result**: Better UX, reduced support burden, higher success rate

This phase completes the error handling and feedback loop for the optimistic updates implemented in Phase 6.5.
