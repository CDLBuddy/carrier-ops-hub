// carrier-ops-hub/packages/shared/src/schemas/expense.ts

import { z } from 'zod';

export const ExpenseSchema = z.object({
    id: z.string(),
    fleetId: z.string(),
    loadId: z.string(),
    type: z.enum(['FUEL', 'TOLLS', 'PARKING', 'MEALS', 'MAINTENANCE', 'OTHER']),
    amountCents: z.number().int().min(0),
    description: z.string(),
    receiptUrl: z.string().url().nullable(),
    submittedBy: z.string(),
    createdAt: z.number(),
});

export type Expense = z.infer<typeof ExpenseSchema>;
