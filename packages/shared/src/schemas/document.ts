// carrier-ops-hub/packages/shared/src/schemas/document.ts

import { z } from 'zod'

export const DocumentSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  loadId: z.string(),
  type: z.enum(['BOL', 'POD', 'RATE_CONFIRMATION', 'INVOICE', 'RECEIPT', 'OTHER']),
  fileName: z.string(),
  storagePath: z.string(),
  url: z.string().url(),
  contentType: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
  notes: z.string().optional(),
  amount: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Document = z.infer<typeof DocumentSchema>
