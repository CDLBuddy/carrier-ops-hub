<!-- carrier-ops-hub/docs/integrations/samsara.md -->

# Samsara Integration

Documentation for integrating with Samsara's API and webhooks.

## Overview

Samsara provides telematics, ELD, and fleet management capabilities. We integrate to:
- Track vehicle location in real-time
- Monitor Hours of Service (HOS) compliance
- Receive driver status updates
- Access vehicle diagnostics

## API Documentation

- **API Docs**: https://developers.samsara.com/docs
- **Authentication**: API Key (Header: `X-Api-Key`)
- **Base URL**: `https://api.samsara.com`

## Key Endpoints

### Get Vehicle Locations
```
GET /fleet/vehicles/locations
```
Returns current location for all vehicles.

**Response**:
```json
{
  "data": [
    {
      "id": "vehicle_id",
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "heading": 90
      },
      "time": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get Driver HOS
```
GET /fleet/hos/logs
```
Returns HOS logs for drivers.

## Webhook Integration

### Setup

1. Log in to Samsara dashboard
2. Navigate to Settings → Webhooks
3. Create new webhook with URL: `https://us-central1-carrier-ops-hub.cloudfunctions.net/samsaraWebhook`
4. Select events to subscribe to
5. Copy webhook secret for signature verification

### Events We Subscribe To

#### Vehicle Location Updates
```json
{
  "eventType": "vehicle.location.update",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "vehicleId": "vehicle_123",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "heading": 90
    }
  }
}
```

**Our Action**: Update driver activity read model with latest location

#### HOS Status Change
```json
{
  "eventType": "hos.status.change",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "driverId": "driver_456",
    "status": "DRIVING",
    "hosSummary": {
      "driveTimeRemaining": 240,
      "shiftTimeRemaining": 480
    }
  }
}
```

**Our Action**: 
- Update driver activity read model
- Evaluate HOS risk and create alerts if needed

#### Vehicle Fault
```json
{
  "eventType": "vehicle.fault",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "vehicleId": "vehicle_123",
    "fault": {
      "code": "P0300",
      "description": "Random/Multiple Cylinder Misfire Detected"
    }
  }
}
```

**Our Action**: Create maintenance alert

### Webhook Security

Verify webhook signatures to ensure requests are from Samsara:

```typescript
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

## Data Mapping

### Samsara Vehicle → Our Vehicle
```typescript
{
  externalId: samsara.id,
  unitNumber: samsara.name,
  vin: samsara.vin,
  // ... other fields
}
```

### Samsara Driver → Our Driver
```typescript
{
  externalId: samsara.id,
  firstName: samsara.firstName,
  lastName: samsara.lastName,
  licenseNumber: samsara.licenseNumber,
  licenseState: samsara.licenseState,
  // ... other fields
}
```

## Rate Limits

- **API**: 60 requests per minute
- **Webhooks**: Unlimited (they send to us)

## Error Handling

### Webhook Failures
- Return 5xx status code to trigger Samsara retry
- Samsara retries with exponential backoff
- After 3 failures, webhook is disabled (manual re-enable required)

### API Failures
- Implement exponential backoff
- Cache vehicle locations (5 minute TTL)
- Degrade gracefully (show last known location)

## Testing

Use Samsara sandbox environment for development:
- **Sandbox URL**: `https://api-sandbox.samsara.com`
- Create test vehicles and drivers in sandbox dashboard
- Use sandbox webhook URL during development

## Common Issues

1. **Webhook not receiving events**: Check URL is publicly accessible, verify HTTPS
2. **Signature verification fails**: Ensure using correct secret, check payload encoding
3. **Rate limit errors**: Implement request queuing, use webhooks instead of polling
