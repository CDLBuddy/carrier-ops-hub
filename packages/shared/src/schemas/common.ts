// carrier-ops-hub/packages/shared/src/schemas/common.ts

// Common schema definitions
// TODO: Install and import zod in Phase 3

export const TimestampSchema = {
  createdAt: 'date',
  updatedAt: 'date',
};

export const AddressSchema = {
  street: 'string',
  city: 'string',
  state: 'string',
  zip: 'string',
  country: 'string',
};

export const MoneySchema = {
  cents: 'number',
  currency: 'string',
};
