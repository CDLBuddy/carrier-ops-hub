// carrier-ops-hub/apps/web/src/features/loads/dispatcherLifecycle.ts

import { LOAD_STATUS, EVENT_TYPE, DispatcherLoadActionSchema, AssignmentDataSchema, DispatcherTransitionResultSchema } from '@coh/shared'
import { validateInput, devValidate } from '@/lib/validation'
import type { LoadData } from './hooks'

export type DispatcherLoadAction =
    | 'ASSIGN'
    | 'REASSIGN'
    | 'UNASSIGN'
    | 'CANCEL'
    | 'REACTIVATE'

export interface DispatcherTransitionResult {
    nextStatus: string
    updates: {
        driverId?: string | null
        vehicleId?: string | null
        status?: string
    }
    eventType: string
    eventPayload: {
        previousStatus?: string
        newStatus?: string
        driverId?: string | null
        vehicleId?: string | null
        previousDriverId?: string | null
        previousVehicleId?: string | null
        reason?: string
    }
}

export interface AssignmentData {
    driverId: string
    vehicleId: string
}

/**
 * Computes the next state for dispatcher load actions.
 * Throws errors for invalid transitions.
 */
export function computeDispatcherTransition(
    load: LoadData,
    action: DispatcherLoadAction,
    assignmentData?: AssignmentData,
    reason?: string
): DispatcherTransitionResult {
    // Validate action input
    validateInput(DispatcherLoadActionSchema, action, 'computeDispatcherTransition')

    // Validate assignmentData if provided
    if (assignmentData) {
        validateInput(AssignmentDataSchema, assignmentData, 'assignmentData')
    }

    const currentStatus = load.status

    let result: DispatcherTransitionResult

    switch (action) {
        case 'ASSIGN': {
            if (currentStatus !== LOAD_STATUS.UNASSIGNED && currentStatus !== LOAD_STATUS.DRAFT) {
                throw new Error(
                    `Cannot assign load from status: ${currentStatus}. Must be UNASSIGNED or DRAFT.`
                )
            }
            if (!assignmentData?.driverId || !assignmentData?.vehicleId) {
                throw new Error('driverId and vehicleId are required for ASSIGN action')
            }

            result = {
                nextStatus: LOAD_STATUS.ASSIGNED,
                updates: {
                    driverId: assignmentData.driverId,
                    vehicleId: assignmentData.vehicleId,
                    status: LOAD_STATUS.ASSIGNED,
                },
                eventType: EVENT_TYPE.LOAD_ASSIGNED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.ASSIGNED,
                    driverId: assignmentData.driverId,
                    vehicleId: assignmentData.vehicleId,
                },
            }
            break
        }

        case 'REASSIGN': {
            if (currentStatus !== LOAD_STATUS.ASSIGNED && currentStatus !== LOAD_STATUS.AT_PICKUP) {
                throw new Error(
                    `Cannot reassign load from status: ${currentStatus}. Must be ASSIGNED or AT_PICKUP.`
                )
            }
            if (!assignmentData?.driverId || !assignmentData?.vehicleId) {
                throw new Error('driverId and vehicleId are required for REASSIGN action')
            }

            result = {
                nextStatus: LOAD_STATUS.ASSIGNED,
                updates: {
                    driverId: assignmentData.driverId,
                    vehicleId: assignmentData.vehicleId,
                    status: LOAD_STATUS.ASSIGNED,
                },
                eventType: EVENT_TYPE.LOAD_REASSIGNED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.ASSIGNED,
                    previousDriverId: load.driverId ?? null,
                    previousVehicleId: load.vehicleId ?? null,
                    driverId: assignmentData.driverId,
                    vehicleId: assignmentData.vehicleId,
                },
            }
            break
        }

        case 'UNASSIGN': {
            if (currentStatus !== LOAD_STATUS.ASSIGNED) {
                throw new Error(`Cannot unassign load from status: ${currentStatus}. Must be ASSIGNED.`)
            }

            result = {
                nextStatus: LOAD_STATUS.UNASSIGNED,
                updates: {
                    driverId: null,
                    vehicleId: null,
                    status: LOAD_STATUS.UNASSIGNED,
                },
                eventType: EVENT_TYPE.LOAD_UNASSIGNED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.UNASSIGNED,
                    previousDriverId: load.driverId ?? null,
                    previousVehicleId: load.vehicleId ?? null,
                },
            }
            break
        }

        case 'CANCEL': {
            if (
                currentStatus !== LOAD_STATUS.UNASSIGNED &&
                currentStatus !== LOAD_STATUS.DRAFT &&
                currentStatus !== LOAD_STATUS.ASSIGNED
            ) {
                throw new Error(
                    `Cannot cancel load from status: ${currentStatus}. Must be UNASSIGNED, DRAFT, or ASSIGNED.`
                )
            }

            result = {
                nextStatus: LOAD_STATUS.CANCELLED,
                updates: {
                    status: LOAD_STATUS.CANCELLED,
                },
                eventType: EVENT_TYPE.LOAD_CANCELLED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.CANCELLED,
                    reason: reason || 'No reason provided',
                },
            }
            break
        }

        case 'REACTIVATE': {
            if (currentStatus !== LOAD_STATUS.CANCELLED) {
                throw new Error(`Cannot reactivate load from status: ${currentStatus}. Must be CANCELLED.`)
            }

            result = {
                nextStatus: LOAD_STATUS.DRAFT,
                updates: {
                    status: LOAD_STATUS.DRAFT,
                },
                eventType: EVENT_TYPE.LOAD_REACTIVATED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.DRAFT,
                },
            }
            break
        }

        default: {
            throw new Error(`Unknown dispatcher action: ${action}`)
        }
    }

    // Validate result in dev mode
    devValidate(DispatcherTransitionResultSchema, result, 'computeDispatcherTransition result')

    return result
}

/**
 * Validates that the actor has permission to perform dispatcher actions.
 * Currently checks for dispatcher or owner role via claims.
 */
export function assertDispatcherActionAllowed(claimsRole: string | string[] | undefined): void {
    if (!claimsRole) {
        throw new Error('User has no role assigned')
    }

    const roles = Array.isArray(claimsRole) ? claimsRole : [claimsRole]
    const allowedRoles = ['dispatcher', 'owner', 'admin']

    const hasPermission = roles.some((role) => allowedRoles.includes(role))
    if (!hasPermission) {
        throw new Error(`Forbidden: user role "${roles.join(', ')}" cannot perform dispatcher actions`)
    }
}
