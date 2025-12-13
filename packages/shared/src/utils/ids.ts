// carrier-ops-hub/packages/shared/src/utils/ids.ts

// ID generation and validation utilities

export function generateLoadNumber(): string {
  // TODO: Implement load number generation
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LD-${timestamp}-${random}`;
}

export function generateDocumentId(): string {
  // TODO: Implement document ID generation
  return `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function isValidLoadNumber(loadNumber: string): boolean {
  return /^LD-[A-Z0-9]+-[A-Z0-9]+$/.test(loadNumber);
}
