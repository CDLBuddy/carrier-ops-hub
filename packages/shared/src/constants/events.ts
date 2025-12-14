// carrier-ops-hub/packages/shared/src/constants/events.ts

export const EVENT_TYPE = {
  LOAD_CREATED: 'LOAD_CREATED',
  LOAD_ASSIGNED: 'LOAD_ASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  STOP_COMPLETED: 'STOP_COMPLETED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]
