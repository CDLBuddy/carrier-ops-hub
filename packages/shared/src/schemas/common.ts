// carrier-ops-hub/packages/shared/src/schemas/common.ts

import { z } from 'zod'

export const TimestampSchema = z.object({
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const AddressSchema = z.object({
  street: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  zip: z.string().default(''),
  country: z.string().default('US'),
})

export const MoneySchema = z.object({
  cents: z.number().int(),
  currency: z.string().default('USD'),
})

export type Timestamp = z.infer<typeof TimestampSchema>
export type Address = z.infer<typeof AddressSchema>
export type Money = z.infer<typeof MoneySchema>
