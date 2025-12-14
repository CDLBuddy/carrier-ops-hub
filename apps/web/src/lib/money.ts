// carrier-ops-hub/apps/web/src/lib/money.ts

export function formatMoney(cents: number): string {
  // TODO: Format money properly with locale
  return `$${(cents / 100).toFixed(2)}`
}

export function parseMoney(value: string): number {
  // TODO: Parse money string to cents
  return Math.round(parseFloat(value.replace(/[^0-9.]/g, '')) * 100)
}
