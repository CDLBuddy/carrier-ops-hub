<!-- carrier-ops-hub/docs/integrations/truckstop.md -->

# Truckstop.com Integration

Documentation for integrating with Truckstop.com load board.

## Overview

Truckstop.com (formerly Internet Truckstop) is a major load board platform. Similar to DAT, provides:
- Load search and booking
- Truck posting
- Rate intelligence
- Credit checks and broker ratings

**Note**: This integration is planned for post-MVP.

## API Documentation

- **API Docs**: https://developer.truckstop.com
- **Authentication**: OAuth 2.0
- **Base URL**: `https://api.truckstop.com/v3`

## Authentication Flow

1. Register application with Truckstop
2. Implement OAuth 2.0 flow for user authorization
3. Exchange authorization code for access token
4. Use access token for API requests

## Key Endpoints (Planned)

### Search Loads
```
GET /loads
```

**Query Parameters**:
- `origin` - Origin location
- `destination` - Destination location (optional for partial match)
- `equipmentType` - Equipment needed
- `availableDate` - Available date range
- `radius` - Search radius in miles

**Response**:
```json
{
  "results": [
    {
      "loadId": "TS123456",
      "postedBy": "ABC Logistics",
      "origin": {
        "city": "Dallas",
        "state": "TX",
        "latitude": 32.7767,
        "longitude": -96.7970
      },
      "destination": {
        "city": "Atlanta",
        "state": "GA"
      },
      "pickupDates": {
        "earliest": "2024-01-10",
        "latest": "2024-01-12"
      },
      "equipmentType": "Van - 53'",
      "weight": 42000,
      "length": 53,
      "rate": {
        "amount": 2100,
        "currency": "USD",
        "type": "FLAT"
      },
      "distance": 781
    }
  ],
  "totalResults": 45
}
```

### Post Available Truck
```
POST /availabletrucks
```

**Payload**:
```json
{
  "origin": {
    "city": "Atlanta",
    "state": "GA"
  },
  "availableDate": "2024-01-13",
  "equipmentType": "Van - 53'",
  "destinationPreference": {
    "city": "Chicago",
    "state": "IL",
    "radius": 100
  }
}
```

### Get Broker Credit Rating
```
GET /brokers/{brokerId}/credit
```

Returns credit score and payment history for broker.

## Features

### Load Search Filters
- Origin/destination with radius
- Equipment type
- Date range
- Rate range
- Weight/length requirements
- Broker rating minimum

### Rate Intelligence
Truckstop provides:
- Historical rate data
- Market trends
- Recommended rates based on lane

### Broker Verification
- Credit scores
- Payment history
- Days to payment average
- Bond information

## Data Mapping

### Truckstop Load → Our Load
```typescript
{
  loadNumber: `TS-${truckstop.loadId}`,
  externalId: truckstop.loadId,
  externalSource: 'TRUCKSTOP',
  status: 'PENDING',
  rateCents: truckstop.rate.amount * 100,
  // Map origin/destination to stops
  // ...
  metadata: {
    broker: truckstop.postedBy,
    brokerRating: truckstop.brokerRating,
    distance: truckstop.distance
  }
}
```

## Planned Implementation

### Phase 1: Read-Only Search
1. Authenticate via OAuth
2. Display load search UI
3. Show available loads
4. Manual import to create load in system

### Phase 2: Automation
1. Automated load matching (suggest loads for available drivers)
2. Auto-post truck availability when driver becomes available
3. Rate comparison with historical data

### Phase 3: Direct Booking
1. Book loads directly through API
2. Automated rate negotiation
3. Integration with broker payment tracking

## Rate Limits

- **Standard**: 100 requests per minute
- **Premium**: 500 requests per minute

## Cost

- Truckstop.com membership required
- API access tier (varies by plan)
- Evaluate based on load volume

## Comparison: Truckstop vs. DAT

| Feature | Truckstop | DAT |
|---------|-----------|-----|
| Load Volume | High | Very High |
| Rate Data | Excellent | Excellent |
| Broker Info | Very Good | Good |
| API Quality | Modern | Mature |
| Cost | $$$ | $$$$ |

**Recommendation**: Start with one platform (Truckstop recommended for slightly better API), add others if needed.

## Security

1. **OAuth Tokens**: Store securely, refresh proactively
2. **User Permissions**: Restrict to dispatchers and owners
3. **Data Privacy**: Don't expose sensitive load details to unauthorized users

## Testing

Use Truckstop's sandbox environment:
- Register for sandbox credentials
- Sandbox has test load data
- No real bookings or charges in sandbox

## Implementation Priority

**Medium priority** for post-MVP. More valuable than DAT initially due to better API, but still not essential for core operations.
