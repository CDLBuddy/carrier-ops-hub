// carrier-ops-hub/packages/shared/src/schemas/expense.ts

// TODO: Replace with Zod schemas in Phase 3

export const ExpenseSchema = {
  id: 'string',
  loadId: 'string',
  type: 'string',
  amountCents: 'number',
  description: 'string',
  receiptUrl: 'string | null',
  submittedBy: 'string',
  createdAt: 'date',
};

export type Expense = {
  id: string;
  loadId: string;
  type: string;
  amountCents: number;
  description: string;
  receiptUrl: string | null;
  submittedBy: string;
  createdAt: Date;
};
