# Phase 4.1 Stabilization - Summary

**Date:** December 13, 2025  
**Status:** ✅ Complete

## Objective

Make `pnpm typecheck` and `pnpm lint` pass while closing critical security gaps. No new product features added—focus on correctness, alignment, and security.

## Changes Implemented

### A) ESLint Tooling Fixed ✅

**Added dependencies:**

- `@typescript-eslint/parser@8.49.0`
- `@typescript-eslint/eslint-plugin@8.49.0`
- `eslint-plugin-react-hooks@5.2.0`
- `eslint-plugin-react-refresh@0.4.24`

**Updated `eslint.config.js`:**

- Configured TypeScript parser for `.ts` and `.tsx` files
- Enabled recommended TypeScript rules
- Added React hooks rules (`rules-of-hooks`, `exhaustive-deps`)
- Configured unused variable warnings to allow `_` prefix

**Result:** `pnpm lint` now passes across all packages (0 errors, minor warnings only)

### B) Circular Barrel Exports Fixed ✅

**Problem:** TypeScript module resolution errors from self-referencing barrel exports

**Fixed:**

- Deleted `apps/web/src/app/routing/routes/auth/index.ts`
- Deleted `apps/web/src/app/routing/routes/dispatch/index.ts`
- Deleted `apps/web/src/app/routing/routes/driver/index.ts`

**Reason:** TanStack Router route files only export `Route` for the router, not for barrel re-exports. These files were unnecessary and caused TypeScript errors.

### C) Roles Alignment ✅

**Single Source of Truth:** `packages/shared/src/constants/roles.ts`

**Changes:**

1. Added `ROLES` constant array as canonical enum
2. All roles now lowercase: `owner`, `dispatcher`, `fleet_manager`, `maintenance_manager`, `billing`, `driver`
3. Updated `UserSchema` to use `roles: z.array(z.enum(ROLES)).min(1)` (now an array, not single string)
4. Updated `navConfig.ts` to use typed `Role[]` instead of uppercase strings
5. Removed phantom roles (`SAFETY`, `MAINTENANCE`) - mapped to `fleet_manager` and `maintenance_manager`

**Impact:** All role comparisons now consistent across web and functions

### D) Load Status Alignment ✅

**Unified Status Enum:**

```typescript
;'UNASSIGNED' | 'ASSIGNED' | 'AT_PICKUP' | 'IN_TRANSIT' | 'AT_DELIVERY' | 'DELIVERED' | 'CANCELLED'
```

**Changes:**

1. Updated `packages/shared/src/constants/statuses.ts` with new enum
2. Updated `LoadSchema` to use `LOAD_STATUS` constant values
3. Removed billing-specific statuses (`INVOICED`, `PAID`) - will handle separately
4. Updated dispatch dashboard to create loads with `UNASSIGNED` status (not `AVAILABLE`)

**Migration:** Old loads with `AVAILABLE` status should be migrated to `UNASSIGNED`

### E) Stop Schema Fixed ✅

**Changes:**

1. Removed `loadId` field from `StopSchema` (stops are embedded in `load.stops` array)
2. Updated `AddressSchema` to allow empty strings with `.default('')` for MVP
3. Stops now validate correctly when created by UI

**Impact:** No more schema validation errors when creating loads

### F) Unused Variables/Parameters Fixed ✅

**Pattern:** Prefix unused parameters with underscore (`_email`, `_password`)

**Files Fixed:**

- `apps/web/src/features/auth/api.ts`
- `apps/web/src/features/loads/api.ts`
- `apps/web/src/domain/selectors/loadCard.ts`
- `apps/web/src/features/loads/utils.ts`
- `apps/web/src/services/repos/events.repo.ts`
- `apps/web/src/services/repos/documents.repo.ts`
- `apps/web/src/services/repos/loads.repo.ts` - removed unused `Timestamp` import
- `apps/web/src/app/routing/routes/auth/bootstrap.tsx` - removed unused `claims` variable

**Result:** TypeScript no longer reports unused variable errors

### G) Storage Security Fixed (CRITICAL) ✅

**Problem:** Any authenticated user could access any fleet's documents

**New Path Convention:**

```
/fleets/{fleetId}/...
/fleets/{fleetId}/loads/{loadId}/docs/{fileName}
```

**Updated `firebase/storage.rules`:**

- All paths now under `/fleets/{fleetId}/...`
- Enforces tenant isolation via `matchesFleetId()` helper
- Added file size limit (15MB)
- Added content type validation (images and PDF only)

**Updated `documents.repo.ts`:**

- Added `fleetId` parameter to upload function
- Updated path format in TODO comment

**⚠️ BREAKING CHANGE:** Old documents at `/documents/{loadId}/...` won't be accessible. Must migrate to new structure.

### H) Firestore Indexes Added ✅

**Updated `firebase/firestore.indexes.json` with MVP indexes:**

```json
{
  "indexes": [
    {
      "collectionGroup": "loads",
      "fields": [
        { "fieldPath": "fleetId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "loads",
      "fields": [
        { "fieldPath": "fleetId", "order": "ASCENDING" },
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "fields": [
        { "fieldPath": "fleetId", "order": "ASCENDING" },
        { "fieldPath": "loadId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Impact:** Queries will use indexes instead of full collection scans

### I) Functions Package Fixed ✅

**Problem:** TypeScript complaining about ESM imports in CommonJS module

**Changes:**

1. `apps/functions/package.json`: Set `"type": "commonjs"`
2. `apps/functions/tsconfig.json`:
   - `"module": "commonjs"`
   - `"moduleResolution": "node"`
   - `"verbatimModuleSyntax": false` (allows ESM syntax to compile to CommonJS)
   - Added `"allowSyntheticDefaultImports": true`

**Result:** Functions code uses ESM syntax (cleaner) but compiles to CommonJS (Firebase compatible)

### J) NavConfig Wired into My Day ✅

**Problem:** `navConfig.ts` was dead code (defined but never used)

**Solution:**

1. Import `navConfig` in `my-day/index.tsx`
2. Filter navConfig by user roles
3. Render filtered links dynamically
4. Fixed property access (`link.to` → `link.path`)

**Impact:** Single source of truth for navigation, no duplicate link definitions

### K) README Updated ✅

**Added Phase 4.1 section documenting:**

- All changes made
- Breaking changes (storage paths, UserSchema, load statuses)
- Quality gates (typecheck, lint, build)

## Quality Gates

### Before Phase 4.1

- ❌ `pnpm typecheck` - 20 errors in apps/web
- ❌ `pnpm lint` - Cannot find @typescript-eslint/parser
- ⚠️ `pnpm build` - Passed but with warnings
- ❌ Storage rules - Zero tenant isolation
- ❌ Schemas misaligned - 3 different role enums, 2 different status enums

### After Phase 4.1

- ✅ `pnpm typecheck` - **0 errors** (all packages pass)
- ✅ `pnpm lint` - **0 errors** (minor warnings about unused stubs and `any` types only)
- ✅ `pnpm build` - All packages build successfully
- ✅ Storage rules - Full tenant isolation with size/type validation
- ✅ Schemas aligned - Single source of truth for roles and statuses

## Breaking Changes

### 1. Storage Paths

**Old:** `/documents/{loadId}/{fileName}`  
**New:** `/fleets/{fleetId}/loads/{loadId}/docs/{fileName}`

**Migration Required:** Must move existing documents to new path structure

### 2. UserSchema

**Old:** `role: string` (single role)  
**New:** `roles: string[]` (array of roles)

**Migration Required:** Transform existing user documents:

```javascript
// Before
{ id: 'uid', role: 'OWNER', ... }

// After
{ id: 'uid', roles: ['owner'], ... }
```

### 3. Load Status Values

**Old:** `AVAILABLE`, `PENDING`, `COMPLETED`  
**New:** `UNASSIGNED`, `DELIVERED`

**Migration Required:** Update existing loads:

- `AVAILABLE` → `UNASSIGNED`
- `PENDING` → `UNASSIGNED`
- `COMPLETED` → `DELIVERED`

## Files Changed

**Root:**

- `package.json` - Added ESLint dependencies
- `eslint.config.js` - Configured TypeScript parser and rules
- `README.md` - Added Phase 4.1 section

**Shared Package:**

- `packages/shared/src/constants/roles.ts` - Added ROLES array
- `packages/shared/src/constants/statuses.ts` - Unified load status enum
- `packages/shared/src/schemas/user.ts` - Changed to roles array with ROLES enum
- `packages/shared/src/schemas/load.ts` - Use LOAD_STATUS constant
- `packages/shared/src/schemas/stop.ts` - Removed loadId field
- `packages/shared/src/schemas/common.ts` - AddressSchema allows empty strings

**Web App:**

- `apps/web/src/app/routing/navigation/navConfig.ts` - Use lowercase Role type
- `apps/web/src/app/routing/routes/auth/index.ts` - **DELETED**
- `apps/web/src/app/routing/routes/dispatch/index.ts` - **DELETED**
- `apps/web/src/app/routing/routes/driver/index.ts` - **DELETED**
- `apps/web/src/app/routing/routes/auth/bootstrap.tsx` - Removed unused claims variable
- `apps/web/src/app/routing/routes/dispatch/dashboard.tsx` - Use UNASSIGNED status
- `apps/web/src/app/routing/routes/my-day/index.tsx` - Wire in navConfig
- `apps/web/src/features/auth/api.ts` - Prefix unused params with \_
- `apps/web/src/features/loads/api.ts` - Prefix unused params with \_
- `apps/web/src/domain/selectors/loadCard.ts` - Prefix unused params with \_
- `apps/web/src/features/loads/utils.ts` - Prefix unused params with \_
- `apps/web/src/services/repos/events.repo.ts` - Prefix unused params with \_
- `apps/web/src/services/repos/documents.repo.ts` - Add fleetId param, prefix unused
- `apps/web/src/services/repos/loads.repo.ts` - Remove unused Timestamp import

**Functions:**

- `apps/functions/package.json` - Set type: commonjs
- `apps/functions/tsconfig.json` - CommonJS module, disable verbatimModuleSyntax

**Firebase:**

- `firebase/storage.rules` - Full tenant isolation with fleet-based paths
- `firebase/firestore.indexes.json` - Added MVP composite indexes

## Next Steps

**Immediate (Before P0 Features):**

1. Deploy updated Firestore indexes: `firebase deploy --only firestore:indexes`
2. Deploy updated Storage rules: `firebase deploy --only storage`
3. Test security rules in emulator before production deployment

**P0 Features (Phase 5):**

1. Load detail page (shared by dispatch & driver)
2. Assignment flow (dispatcher assigns driver/vehicle)
3. Driver status buttons (create events)
4. Document upload (use new storage paths)
5. Billing queue (ready to invoice vs blocked)

**Data Migration (Before Production):**

1. Transform user documents: `role` → `roles` array
2. Update load statuses to new enum values
3. Migrate existing documents to new storage path structure
4. Add fleetId to all existing collections

## Verification Commands

```bash
# Type check
pnpm typecheck
# Should output: Done in ~3s with 0 errors

# Lint
pnpm lint
# Should output: 0 errors, minor warnings only

# Build
pnpm build
# Should output: All packages build successfully

# Test in dev
pnpm dev:emulators  # Terminal 1
pnpm dev            # Terminal 2
# Navigate to http://localhost:3000
# Sign up → Bootstrap → Create load
# Should work without errors
```

## Lessons Learned

1. **Barrel Exports:** Route files don't need barrel exports for TanStack Router - they only export `Route`
2. **verbatimModuleSyntax:** Must disable for Firebase Functions to allow ESM syntax with CommonJS output
3. **Schema Alignment:** Multiple enum definitions cause query bugs - establish single source of truth early
4. **Storage Security:** Path structure is critical for security rules - plan before storing documents
5. **TypeScript Config:** Base configs can conflict with package-specific needs - override when necessary

## Documentation Added

- `docs/architecture/repo-sweep.md` - Comprehensive audit report (62 TODOs, schema mismatches, security gaps)
- `docs/architecture/phase-4.1-stabilization-summary.md` - This document

---

**Phase 4.1 Complete** ✅  
All quality gates passing. Ready for Phase 5 (P0 Features).
