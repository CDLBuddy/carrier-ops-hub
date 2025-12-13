<!-- carrier-ops-hub/docs/architecture/sources-of-truth.md -->

# Sources of Truth

This document defines where authoritative data lives in the system.

## Principle

**Each piece of data should have exactly one source of truth.** Other systems may cache or derive data, but there's always one canonical source.

## Data Sources

### Firestore Collections

#### `users` Collection
**Source of Truth**: User authentication and profile data
- Email, display name, role
- Created/updated timestamps
- Active status

**Derived Data**: None
**Consumers**: All apps (web, functions)

#### `drivers` Collection
**Source of Truth**: Driver profile and compliance data
- License information
- Contact details
- CDL expiration dates
- Linked user ID

**Derived Data**: 
- HOS data (sourced from Samsara/Motive)
- Location (sourced from Samsara/Motive)

**Consumers**: Web app, Functions (for compliance checks)

#### `vehicles` Collection
**Source of Truth**: Vehicle details
- Unit numbers, VIN
- Registration information
- Maintenance records

**Derived Data**:
- Current location (from telematics)
- Odometer readings (from telematics)

**Consumers**: Web app, Functions

#### `loads` Collection
**Source of Truth**: Load details and lifecycle
- Pickup/delivery locations and times
- Rates and customer info
- Assignments (driver, vehicle)
- Current status

**Derived Data**: None (all data is entered or updated by users/functions)
**Consumers**: Web app, Functions

#### `events` Collection
**Source of Truth**: Event log (append-only)
- All status changes
- User actions
- System-generated events
- Timestamps

**Derived Data**: None (events are immutable)
**Consumers**: Web app (for timeline), Functions (for triggers)

#### `documents` Collection
**Source of Truth**: Document metadata
- File names, types, URLs
- Upload timestamps
- Associated load IDs

**Actual Files**: Stored in Firebase Storage
**Consumers**: Web app, Functions

### External Systems

#### Samsara/Motive
**Source of Truth**: 
- Real-time vehicle location
- ELD/HOS data
- Driver status

**Flow**: External → Functions (via webhook) → Firestore events → Read models
**Consumers**: Functions receive webhooks, web app displays data

#### Firebase Storage
**Source of Truth**: Actual document files (PDFs, images)
- BOL scans
- POD photos
- Receipts

**Metadata**: Stored in Firestore `documents` collection

## Read Models (Derived Data)

Read models are denormalized views optimized for specific queries. They are **NOT** sources of truth.

### Dispatcher Queues
- **Source**: Derived from `loads` and `events` collections
- **Updated by**: Cloud Functions triggers
- **Purpose**: Fast queries for dispatcher dashboard

### Billing Queues
- **Source**: Derived from `loads` with status="COMPLETED"
- **Updated by**: Cloud Functions triggers
- **Purpose**: Track loads ready for invoicing

### Driver Activity
- **Source**: Derived from `drivers`, `loads`, and external telematics data
- **Updated by**: Cloud Functions processing webhooks
- **Purpose**: Real-time driver status for dispatch

## Data Flow Rules

1. **User Input** → Direct writes to source of truth collections
2. **External Data** → Webhooks → Functions → Events → Read models
3. **Queries** → Prefer read models when available for performance
4. **Updates** → Always update source of truth, read models update via triggers

## Conflict Resolution

If derived data conflicts with source of truth:
1. **Source of truth wins**
2. Rebuild read model from source
3. Log discrepancy for investigation
