// carrier-ops-hub/apps/web/src/domain/selectors/loadCard.ts

// Selectors for load card display

export function selectLoadCardData(_load: unknown) {
  // TODO: Transform load data for card display
  return {
    id: 'load-id',
    origin: 'City A',
    destination: 'City B',
    status: 'IN_TRANSIT',
    pickupDate: new Date(),
    deliveryDate: new Date(),
  }
}
