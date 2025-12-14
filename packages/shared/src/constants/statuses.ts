// carrier-ops-hub/packages/shared/src/constants/statuses.ts

export const LOAD_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  AT_PICKUP: 'AT_PICKUP',
  IN_TRANSIT: 'IN_TRANSIT',
  AT_DELIVERY: 'AT_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export type LoadStatus = (typeof LOAD_STATUS)[keyof typeof LOAD_STATUS]

export const DOCUMENT_TYPE = {
  BOL: 'BOL', // Bill of Lading
  POD: 'POD', // Proof of Delivery
  RATE_CONFIRMATION: 'RATE_CONFIRMATION',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  OTHER: 'OTHER',
} as const

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]
