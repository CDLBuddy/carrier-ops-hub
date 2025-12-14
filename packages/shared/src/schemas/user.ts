// carrier-ops-hub/packages/shared/src/schemas/user.ts

import { z } from 'zod'
import { ROLES } from '../constants/roles'

export const UserSchema = z.object({
  id: z.string(),
  fleetId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.enum(ROLES)).min(1),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type User = z.infer<typeof UserSchema>
