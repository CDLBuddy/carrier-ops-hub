// carrier-ops-hub/packages/shared/src/schemas/event.ts

import { z } from 'zod'
import { EVENT_TYPE } from '../constants/events'

const eventTypeValues = Object.values(EVENT_TYPE) as [string, ...string[]]

export const EventSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  loadId: z.string(),
  type: z.enum(eventTypeValues),
  actorUid: z.string(),
  createdAt: z.number(),
  payload: z.record(z.any()).optional(),
})

export type Event = z.infer<typeof EventSchema>
