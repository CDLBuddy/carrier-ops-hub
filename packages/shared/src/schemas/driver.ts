// carrier-ops-hub/packages/shared/src/schemas/driver.ts

import { z } from 'zod'

export const DriverSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  driverId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  licenseNumber: z.string(),
  licenseState: z.string().length(2),
  licenseExpiry: z.number().optional(),
  phoneNumber: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Driver = z.infer<typeof DriverSchema>
