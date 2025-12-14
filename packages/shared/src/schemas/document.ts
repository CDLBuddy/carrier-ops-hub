// carrier-ops-hub/packages/shared/src/schemas/document.ts

import { z } from 'zod';

export const DocumentSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    loadId: z.string(),
    type: z.enum(['BOL', 'POD', 'RATE_CONFIRMATION', 'INVOICE', 'RECEIPT', 'OTHER']),
    fileName: z.string(),
    fileUrl: z.string().url(),
    uploadedBy: z.string(),
    createdAt: z.number(),
});

export type Document = z.infer<typeof DocumentSchema>;
