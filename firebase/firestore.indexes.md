<!-- carrier-ops-hub/firebase/firestore.indexes.md -->

# Firestore Indexes

This document explains the composite indexes required for the application.

## Loads by Status and Date

```
Collection: loads
Fields: status (ASC), pickupDate (ASC)
```

Used for dashboard queries filtering by load status and sorting by pickup date.

## Events by Load

```
Collection: events
Fields: loadId (ASC), createdAt (DESC)
```

Used for displaying event history for a specific load in reverse chronological order.

## Adding New Indexes

1. Add the index definition to `firestore.indexes.json`
2. Document it here with use case
3. Deploy with `firebase deploy --only firestore:indexes`
