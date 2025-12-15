// carrier-ops-hub/apps/web/src/features/loads/lifecycle.ts

import { LOAD_STATUS, EVENT_TYPE, type Stop } from '@coh/shared'
import type { LoadData } from './hooks'

export type DriverLoadAction = 'ARRIVE_PICKUP' | 'DEPART_PICKUP' | 'ARRIVE_DELIVERY' | 'MARK_DELIVERED'

export interface TransitionResult {
    nextStatus: string
    stopUpdates: Array<{ index: number; actualTime: number; isCompleted: boolean; updatedAt: number }>
    eventType: string
    eventPayload: {
        previousStatus: string
        newStatus: string
        stopId?: string
        actualTime?: number
        stopType?: string
    }
}

/**
 * Compute the next state for a driver action
 * Enforces business rules for status transitions and stop completion
 */
export function computeDriverTransition(
    load: LoadData,
    action: DriverLoadAction,
    now: number
): TransitionResult {
    const currentStatus = load.status
    const stops = load.stops || []

    switch (action) {
        case 'ARRIVE_PICKUP': {
            if (currentStatus !== LOAD_STATUS.ASSIGNED) {
                throw new Error(`Cannot arrive at pickup from status: ${currentStatus}`)
            }
            return {
                nextStatus: LOAD_STATUS.AT_PICKUP,
                stopUpdates: [],
                eventType: EVENT_TYPE.STATUS_CHANGED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.AT_PICKUP,
                },
            }
        }

        case 'DEPART_PICKUP': {
            if (currentStatus !== LOAD_STATUS.AT_PICKUP) {
                throw new Error(`Cannot depart pickup from status: ${currentStatus}`)
            }
            // Find first PICKUP stop
            const pickupIndex = stops.findIndex((s: Stop) => s.type === 'PICKUP')
            if (pickupIndex === -1) {
                throw new Error('No pickup stop found')
            }
            const pickupStop = stops[pickupIndex] as Stop

            return {
                nextStatus: LOAD_STATUS.IN_TRANSIT,
                stopUpdates: [
                    {
                        index: pickupIndex,
                        actualTime: now,
                        isCompleted: true,
                        updatedAt: now,
                    },
                ],
                eventType: EVENT_TYPE.STOP_COMPLETED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.IN_TRANSIT,
                    stopId: pickupStop.id || `stop-${pickupIndex}`,
                    stopType: 'PICKUP',
                    actualTime: now,
                },
            }
        }

        case 'ARRIVE_DELIVERY': {
            if (currentStatus !== LOAD_STATUS.IN_TRANSIT) {
                throw new Error(`Cannot arrive at delivery from status: ${currentStatus}`)
            }
            return {
                nextStatus: LOAD_STATUS.AT_DELIVERY,
                stopUpdates: [],
                eventType: EVENT_TYPE.STATUS_CHANGED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.AT_DELIVERY,
                },
            }
        }

        case 'MARK_DELIVERED': {
            if (currentStatus !== LOAD_STATUS.AT_DELIVERY) {
                throw new Error(`Cannot mark delivered from status: ${currentStatus}`)
            }
            // Find first DELIVERY stop
            const deliveryIndex = stops.findIndex((s: Stop) => s.type === 'DELIVERY')
            if (deliveryIndex === -1) {
                throw new Error('No delivery stop found')
            }
            const deliveryStop = stops[deliveryIndex] as Stop

            return {
                nextStatus: LOAD_STATUS.DELIVERED,
                stopUpdates: [
                    {
                        index: deliveryIndex,
                        actualTime: now,
                        isCompleted: true,
                        updatedAt: now,
                    },
                ],
                eventType: EVENT_TYPE.STOP_COMPLETED,
                eventPayload: {
                    previousStatus: currentStatus,
                    newStatus: LOAD_STATUS.DELIVERED,
                    stopId: deliveryStop.id || `stop-${deliveryIndex}`,
                    stopType: 'DELIVERY',
                    actualTime: now,
                },
            }
        }

        default:
            throw new Error(`Unknown driver action: ${action}`)
    }
}

/**
 * Assert that the driver is allowed to perform actions on this load
 */
export function assertDriverActionAllowed(load: LoadData, claimsDriverId: string | undefined): void {
    if (!claimsDriverId) {
        throw new Error('Driver ID not found in claims')
    }
    if (load.driverId !== claimsDriverId) {
        throw new Error(`Forbidden: load ${load.id} is not assigned to driver ${claimsDriverId}`)
    }
}
