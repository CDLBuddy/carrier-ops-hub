// carrier-ops-hub/packages/shared/src/schemas/stop.ts

import { z } from 'zod'
import { AddressSchema } from './common'

export const StopSchema = z.object({
  id: z.string(),
  type: z.enum(['PICKUP', 'DELIVERY']),
  sequence: z.number().int().min(0),
  address: AddressSchema,
  scheduledTime: z.number(),
  actualTime: z.number().nullable(),
  isCompleted: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Stop = z.infer<typeof StopSchema>
