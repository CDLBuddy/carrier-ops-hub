// carrier-ops-hub/packages/shared/src/schemas/actions.ts

import { z } from 'zod'

/**
 * Driver load actions
 */
export const DriverLoadActionSchema = z.enum([
    'ARRIVE_PICKUP',
    'DEPART_PICKUP',
    'ARRIVE_DELIVERY',
    'MARK_DELIVERED',
])

export type DriverLoadAction = z.infer<typeof DriverLoadActionSchema>

/**
 * Dispatcher load actions
 */
export const DispatcherLoadActionSchema = z.enum([
    'ASSIGN',
    'REASSIGN',
    'UNASSIGN',
    'CANCEL',
    'REACTIVATE',
])

export type DispatcherLoadAction = z.infer<typeof DispatcherLoadActionSchema>

/**
 * Assignment data for dispatcher actions
 */
export const AssignmentDataSchema = z.object({
    driverId: z.string().min(1, 'Driver ID is required'),
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
})

export type AssignmentData = z.infer<typeof AssignmentDataSchema>

/**
 * Stop update for driver actions
 */
export const StopUpdateSchema = z.object({
    index: z.number().int().min(0),
    actualTime: z.number(),
    isCompleted: z.boolean(),
    updatedAt: z.number(),
})

export type StopUpdate = z.infer<typeof StopUpdateSchema>

/**
 * Transition result for driver actions
 */
export const DriverTransitionResultSchema = z.object({
    nextStatus: z.string(),
    stopUpdates: z.array(StopUpdateSchema),
    eventType: z.string(),
    eventPayload: z.object({
        previousStatus: z.string(),
        newStatus: z.string(),
        stopId: z.string().optional(),
        actualTime: z.number().optional(),
        stopType: z.string().optional(),
    }),
})

export type DriverTransitionResult = z.infer<typeof DriverTransitionResultSchema>

/**
 * Transition result for dispatcher actions
 */
export const DispatcherTransitionResultSchema = z.object({
    nextStatus: z.string(),
    updates: z.object({
        driverId: z.string().nullable().optional(),
        vehicleId: z.string().nullable().optional(),
        status: z.string().optional(),
    }),
    eventType: z.string(),
    eventPayload: z.object({
        previousStatus: z.string().optional(),
        newStatus: z.string().optional(),
        driverId: z.string().nullable().optional(),
        vehicleId: z.string().nullable().optional(),
        previousDriverId: z.string().nullable().optional(),
        previousVehicleId: z.string().nullable().optional(),
        reason: z.string().optional(),
    }),
})

export type DispatcherTransitionResult = z.infer<typeof DispatcherTransitionResultSchema>
