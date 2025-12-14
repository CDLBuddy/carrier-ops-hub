// carrier-ops-hub/packages/shared/src/schemas/vehicle.ts

import { z } from 'zod'

export const VehicleSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  vehicleNumber: z.string(),
  vin: z.string().length(17),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']).default('ACTIVE'),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Vehicle = z.infer<typeof VehicleSchema>
