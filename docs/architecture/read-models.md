<!-- carrier-ops-hub/docs/architecture/read-models.md -->

# Read Models

This document describes the read model strategy for optimizing queries.

## What are Read Models?

Read models are **denormalized views** of data optimized for specific query patterns. They are derived from the source of truth and maintained by Cloud Functions.

## Why Read Models?

### Problems They Solve
1. **Complex Queries**: Firestore has limited querying capabilities (no joins, limited filters)
2. **Performance**: Pre-computing aggregations is faster than computing on every read
3. **Cost**: Fewer document reads = lower Firestore costs

### Trade-offs
- **Eventual Consistency**: Read models may lag behind source of truth
- **Complexity**: Additional code to maintain synchronization
- **Storage**: Duplicate data increases storage costs

## Read Models in Carrier Ops Hub

### 1. Dispatcher Queues

**Purpose**: Fast access to loads grouped by status for dispatcher dashboard

**Source**: `loads` collection + `events` for recent activity

**Structure**:
```typescript
// Collection: dispatcher_queues/{queueName}
{
  needs_attention: {
    loads: [
      {
        id: string;
        loadNumber: string;
        status: string;
        driverName: string;
        vehicleNumber: string;
        pickupDate: Timestamp;
        lastEvent: string;
        priority: number;
      }
    ],
    count: number;
    updatedAt: Timestamp;
  }
}
```

**Queues**:
- `needs_attention`: Loads requiring dispatcher action
- `in_transit`: Active loads being transported
- `awaiting_pickup`: Assigned but not yet picked up
- `completed_today`: Recently completed loads

**Updated By**: `onLoadStatusChange` function

---

### 2. Billing Queue

**Purpose**: Track loads ready for invoicing

**Source**: `loads` with status=COMPLETED + `documents` for required docs

**Structure**:
```typescript
// Collection: billing_queue/{date}
{
  loads: [
    {
      id: string;
      loadNumber: string;
      completedDate: Timestamp;
      rateCents: number;
      hasDocuments: {
        bol: boolean;
        pod: boolean;
        rateConfirmation: boolean;
      };
      readyForInvoicing: boolean;
    }
  ],
  totalRevenueCents: number;
  count: number;
}
```

**Updated By**: `onLoadCompleted` function

---

### 3. Driver Activity

**Purpose**: Real-time status of all active drivers

**Source**: `drivers` + `loads` (assignments) + Samsara/Motive (location, HOS)

**Structure**:
```typescript
// Collection: driver_activity/{driverId}
{
  driverId: string;
  driverName: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'DRIVING' | 'OFF_DUTY';
  currentLoad: {
    id: string;
    loadNumber: string;
    nextStop: string;
  } | null;
  location: {
    lat: number;
    lng: number;
    timestamp: Timestamp;
  } | null;
  hosSummary: {
    driveTimeRemaining: number;
    dutyTimeRemaining: number;
    nextBreakDue: Timestamp;
  };
  updatedAt: Timestamp;
}
```

**Updated By**: 
- `onLoadAssigned` function
- `onSamsaraWebhook` function (location/HOS updates)

---

## Update Strategies

### 1. Event-Driven Updates

Most common pattern. Cloud Functions trigger on Firestore writes:

```typescript
export const onLoadStatusChange = functions.firestore
  .document('loads/{loadId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      await updateDispatcherQueues(after);
    }
  });
```

### 2. Scheduled Rebuilds

For read models that may drift or need periodic refresh:

```typescript
export const rebuildBillingQueue = functions.pubsub
  .schedule('0 1 * * *') // Daily at 1 AM
  .onRun(async (context) => {
    // Rebuild entire billing queue from source
  });
```

### 3. On-Demand Rebuilds

Manual rebuild triggered by admin:

```typescript
export const rebuildReadModel = functions.https.onCall(
  async (data, context) => {
    // Verify admin role
    // Rebuild specified read model
  }
);
```

## Consistency Guarantees

### Eventual Consistency
- Read models **may be slightly out of date**
- Typically < 1 second lag
- For critical operations, query source of truth directly

### Handling Failures
- Function retries (Cloud Functions automatic retry)
- Dead letter queue for failed updates
- Monitoring/alerting for drift detection

## Best Practices

1. **Document the Source**: Always clearly document which collection(s) a read model derives from
2. **Include Timestamp**: `updatedAt` field helps detect staleness
3. **Idempotent Updates**: Functions should be safe to run multiple times
4. **Rebuild Capability**: Always have a way to rebuild from source
5. **Monitor Drift**: Alert if read model timestamp is too old

## When NOT to Use Read Models

- Data changes infrequently (< 1 query per update)
- Query can be satisfied with Firestore indexes
- Real-time consistency is critical
- Data volume is small (< 1000 documents)
