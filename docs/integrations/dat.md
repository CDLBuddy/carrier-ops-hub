<!-- carrier-ops-hub/docs/integrations/dat.md -->

# DAT Load Board Integration

Documentation for integrating with DAT load board.

## Overview

DAT is one of the largest load boards in North America. Integration allows:
- Searching for available freight
- Posting truck availability
- Accessing rate information
- Booking loads directly

**Note**: This integration is planned for post-MVP.

## API Documentation

- **API Docs**: https://dat.com/api-docs
- **Authentication**: API Key
- **Base URL**: `https://api.dat.com/v2`

## Key Endpoints (Planned)

### Search Loads
```
GET /loads/search
```

**Query Parameters**:
- `origin` - Origin city/state
- `destination` - Destination city/state
- `equipmentType` - VAN, REEFER, FLATBED, etc.
- `pickupDate` - Earliest pickup date

**Response**:
```json
{
  "loads": [
    {
      "id": "load_123",
      "origin": {
        "city": "Los Angeles",
        "state": "CA"
      },
      "destination": {
        "city": "Phoenix",
        "state": "AZ"
      },
      "equipmentType": "VAN",
      "weight": 30000,
      "rateUsd": 1200,
      "pickupDate": "2024-01-05"
    }
  ]
}
```

### Post Truck Availability
```
POST /trucks
```

**Payload**:
```json
{
  "origin": {
    "city": "Phoenix",
    "state": "AZ"
  },
  "availableDate": "2024-01-05",
  "equipmentType": "VAN",
  "destination": {
    "city": "Los Angeles",
    "state": "CA"
  }
}
```

### Get Rate Recommendations
```
GET /rates
```

Query parameters similar to load search. Returns historical rate data.

## Planned Features

### MVP (Post-Launch)
- ❌ Manual load search (user enters criteria)
- ❌ Display available loads in UI
- ❌ Copy load details to create new load in system

### Future Enhancements
- Automated load matching (system suggests loads for available drivers)
- Direct booking from DAT
- Rate analysis and recommendations
- Automated truck posting

## Data Mapping

### DAT Load → Our Load
```typescript
{
  loadNumber: `DAT-${dat.id}`,
  status: 'PENDING',
  rateCents: dat.rateUsd * 100,
  // Create stops from origin/destination
  // ...
}
```

## Rate Limits

- Standard: 60 requests per minute
- Premium: 120 requests per minute

## Security Considerations

1. **API Key Storage**: Store in environment variables, never commit to repo
2. **User Permissions**: Only dispatchers/owners should access load board
3. **Data Validation**: Verify all DAT data before importing to system

## Cost

DAT API access requires:
- DAT membership ($$$)
- API access tier (additional cost)

Evaluate ROI before implementing.

## Alternative Load Boards

Consider also:
- **Truckstop.com**: Similar features, different network
- **123Loadboard**: Lower cost option
- **Direct Freight**: Owner-operator focused

Each requires separate integration.

## Implementation Priority

**Low priority for MVP**. Focus on core TMS features first. Load board integration adds value but isn't essential for day-to-day operations.
