<!-- carrier-ops-hub/firebase/migrations/README.md -->

# Firestore Migrations

This directory contains one-time migration scripts for Firestore data transformations.

## Naming Convention

`NNNN-description.ts` where NNNN is a 4-digit sequence number.

## Running Migrations

Migrations should be run manually via Firebase Admin SDK with appropriate credentials:

```bash
pnpm --filter functions tsx firebase/migrations/NNNN-migration-name.ts
```

## Guidelines

- Each migration should be idempotent when possible
- Log all changes for audit trail
- Test on emulators first
- Back up production data before running

## Migration Log

| Number | Description | Date | Status |
|--------|-------------|------|--------|
| 0001 | Initial migration | - | Pending |
