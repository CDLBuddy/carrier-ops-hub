// carrier-ops-hub/apps/web/src/lib/date.ts

export function formatDate(date: Date | string): string {
  // TODO: Implement date formatting
  return new Date(date).toLocaleDateString()
}

export function formatDateTime(date: Date | string): string {
  // TODO: Implement datetime formatting
  return new Date(date).toLocaleString()
}

export function isDateInPast(date: Date | string): boolean {
  return new Date(date) < new Date()
}
