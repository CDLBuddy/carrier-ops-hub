<!-- carrier-ops-hub/docs/architecture/data-model.md -->

# Data Model

This document describes the Firestore data model for Carrier Ops Hub.

## Collections

### `users`

User accounts and authentication profiles.

```typescript
{
  id: string // Document ID (matches Firebase Auth UID)
  email: string // Email address
  displayName: string // Full name
  role: Role // OWNER | DISPATCHER | BILLING | SAFETY | MAINTENANCE | DRIVER
  isActive: boolean // Account status
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes**: None required (queries by ID only)

---

### `drivers`

Driver profiles (extends users with role=DRIVER).

```typescript
{
  id: string // Document ID
  userId: string // Reference to users collection
  firstName: string
  lastName: string
  licenseNumber: string
  licenseState: string
  licenseExpiration: Timestamp
  phoneNumber: string
  email: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes**:

- `userId` (for user → driver lookup)
- `isActive` (for active driver queries)

---

### `vehicles`

Fleet vehicles.

```typescript
{
  id: string
  vehicleNumber: string // User-friendly identifier
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  registrationExpiration: Timestamp
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes**: `isActive`

---

### `loads`

Freight loads to be transported.

```typescript
{
  id: string
  loadNumber: string // User-facing load number (e.g., LD-12345)
  status: LoadStatus // PENDING | ASSIGNED | IN_TRANSIT | etc.

  // Assignment
  driverId: string | null
  vehicleId: string | null

  // Timing
  pickupDate: Timestamp
  deliveryDate: Timestamp

  // Financial
  rateCents: number // Rate in cents

  // Additional
  notes: string | null

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes**:

- `status, pickupDate` (composite - for dispatcher dashboard)
- `driverId, status` (composite - for driver's loads)

**Subcollections**: `stops` (see below)

---

### `loads/{loadId}/stops`

Pickup and delivery stops for a load.

```typescript
{
  id: string
  loadId: string // Parent load
  type: 'PICKUP' | 'DELIVERY'
  sequence: number // Order of stops

  // Location
  address: {
    street: string
    city: string
    state: string
    zip: string
  }

  // Timing
  scheduledTime: Timestamp
  actualTime: Timestamp | null

  isCompleted: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes**: `sequence` (for ordered query)

---

### `documents`

Document metadata (actual files in Storage).

```typescript
{
  id: string
  loadId: string
  type: DocumentType // BOL | POD | RATE_CONFIRMATION | etc.
  fileName: string
  fileUrl: string // Storage URL
  uploadedBy: string // User ID
  createdAt: Timestamp
}
```

**Indexes**: `loadId, createdAt` (composite)

---

### `expenses`

Expenses associated with loads.

```typescript
{
  id: string
  loadId: string
  type: string // FUEL | TOLLS | PARKING | etc.
  amountCents: number
  description: string
  receiptUrl: string | null
  submittedBy: string // User ID
  approvedBy: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Timestamp
}
```

**Indexes**: `loadId, createdAt` (composite)

---

### `events`

Event log (append-only, immutable).

```typescript
{
  id: string
  loadId: string
  type: string // STATUS_CHANGE | LOCATION_UPDATE | etc.
  description: string
  metadata: object | null // Additional structured data
  createdBy: string // User or system ID
  createdAt: Timestamp
}
```

**Indexes**: `loadId, createdAt DESC` (composite - for event timeline)

---

## Relationships

```
users (1) ──┬── (0..1) drivers
            └── (0..*) events.createdBy

drivers (1) ──── (0..*) loads.driverId

vehicles (1) ──── (0..*) loads.vehicleId

loads (1) ──┬── (2..*) stops
            ├── (0..*) documents
            ├── (0..*) expenses
            └── (0..*) events
```

## Design Decisions

### Why Subcollections for Stops?

- Stops are tightly coupled to loads
- Simplifies security rules (inherit load permissions)
- Atomic operations with parent load

### Why Top-Level Collection for Documents?

- Documents may need to be shared across contexts
- Easier to implement global search
- Better for future multi-load documents

### Why Events are Immutable?

- Audit trail for compliance
- Event sourcing pattern for rebuilding state
- No need for update operations (simpler security)

### Why Denormalize Driver/Vehicle Names?

- NOT denormalized in current schema (references only)
- Client-side joins for display
- Keeps data normalized and consistent
