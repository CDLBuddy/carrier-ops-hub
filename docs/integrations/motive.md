<!-- carrier-ops-hub/docs/integrations/motive.md -->

# Motive (formerly KeepTruckin) Integration

Documentation for integrating with Motive's API and webhooks.

## Overview

Motive provides ELD, fleet management, and compliance tools. Similar to Samsara, we integrate for:

- Real-time location tracking
- HOS compliance monitoring
- Driver status updates
- DVIR (Driver Vehicle Inspection Reports)

## API Documentation

- **API Docs**: https://gomotive.com/developers
- **Authentication**: OAuth 2.0 or API Key
- **Base URL**: `https://api.gomotive.com/v1`

## Key Endpoints

### Get Vehicle Locations

```
GET /vehicles/locations
```

**Response**:

```json
{
  "locations": [
    {
      "vehicle_id": "12345",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "bearing": 90,
      "recorded_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get HOS Logs

```
GET /hos_logs
```

Returns HOS logs for specified date range and drivers.

### Get DVIR

```
GET /vehicle_inspections
```

Returns driver vehicle inspection reports.

## Webhook Integration

### Setup

1. Contact Motive support or use dashboard
2. Register webhook endpoint: `https://us-central1-carrier-ops-hub.cloudfunctions.net/motiveWebhook`
3. Obtain webhook signing secret
4. Subscribe to relevant events

### Events We Subscribe To

#### Location Update

```json
{
  "event_type": "location_updated",
  "timestamp": "2024-01-01T12:00:00Z",
  "vehicle": {
    "id": "12345",
    "location": {
      "lat": 37.7749,
      "lon": -122.4194,
      "bearing": 90
    }
  }
}
```

#### HOS Event

```json
{
  "event_type": "hos_event",
  "timestamp": "2024-01-01T12:00:00Z",
  "driver": {
    "id": "67890",
    "status": "DRIVING"
  },
  "hos_summary": {
    "drive_time_remaining_minutes": 240,
    "shift_time_remaining_minutes": 480,
    "cycle_time_remaining_minutes": 4200
  }
}
```

#### DVIR Submitted

```json
{
  "event_type": "dvir_submitted",
  "timestamp": "2024-01-01T12:00:00Z",
  "inspection": {
    "id": "inspect_123",
    "vehicle_id": "12345",
    "driver_id": "67890",
    "status": "SAFE",
    "defects": []
  }
}
```

### Webhook Security

Motive uses HMAC signature verification:

```typescript
function verifyMotiveSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const expectedSignature = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}
```

Header: `X-Motive-Signature`

## Data Mapping

### Motive Vehicle → Our Vehicle

```typescript
{
  externalId: motive.vehicle_id,
  vehicleNumber: motive.number,
  vin: motive.vin,
  make: motive.make,
  model: motive.model,
  year: motive.year
}
```

### Motive Driver → Our Driver

```typescript
{
  externalId: motive.driver_id,
  firstName: motive.first_name,
  lastName: motive.last_name,
  licenseNumber: motive.license_number,
  licenseState: motive.license_state
}
```

## Rate Limits

- **API**: 100 requests per minute per account
- **Webhooks**: No limit (they send to us)

## Error Handling

### Webhook Retries

- Return 2xx for successful processing
- Return 5xx for temporary failures (Motive will retry)
- Motive retries up to 5 times with exponential backoff

### API Best Practices

- Cache vehicle locations (recommended 5 min refresh)
- Use webhooks for real-time updates instead of polling
- Handle 429 (rate limit) with exponential backoff

## Testing

### Sandbox Environment

- **Sandbox URL**: `https://api-sandbox.gomotive.com/v1`
- Request sandbox credentials from Motive support
- Sandbox mirrors production but uses test data

### Local Testing

- Use ngrok or similar to expose local webhook endpoint
- Point Motive webhook to ngrok URL
- Test with sandbox account

## Migration from KeepTruckin

If migrating from old KeepTruckin API:

1. Update base URL (gomotive.com instead of keeptruckin.com)
2. Verify endpoint paths (most unchanged)
3. Update webhook URLs
4. Test thoroughly in sandbox

## Common Issues

1. **401 Unauthorized**: Check API key is valid and properly formatted in header
2. **Webhook payload too large**: Motive recommends using event ID to fetch full details via API
3. **Duplicate events**: Implement idempotency using event ID
4. **Missing location data**: Some vehicles may not have GPS; handle null locations gracefully
