// carrier-ops-hub/apps/web/src/services/repos/repoUtils.ts

import type { DocumentSnapshot } from 'firebase/firestore'
import type { ZodSchema } from 'zod'

/**
 * Extract document data with ID, ensuring doc ID always wins over stored id field
 * Throws if snapshot has no data (non-existent document)
 */
export function withDocId<T>(snap: DocumentSnapshot): T & { id: string } {
    const data = snap.data()
    if (!data) {
        throw new Error(`Snapshot ${snap.id} has no data - document may not exist`)
    }
    return { ...data, id: snap.id } as T & { id: string }
}

/**
 * Assert that the document belongs to the expected fleet
 */
export function assertFleetMatch({
    expectedFleetId,
    actualFleetId,
    entity,
    id,
}: {
    expectedFleetId: string
    actualFleetId: string
    entity: string
    id: string
}): void {
    if (actualFleetId !== expectedFleetId) {
        throw new Error(
            `Unauthorized access to ${entity} ${id}: expected fleet ${expectedFleetId}, got ${actualFleetId}`
        )
    }
}

/**
 * Validate data with Zod schema in development (non-blocking)
 */
export function devValidate<T>(schema: ZodSchema<T>, value: unknown, context: string): void {
    if (import.meta.env.DEV) {
        const result = schema.safeParse(value)
        if (!result.success) {
            console.error(`[${context}] Validation failed:`, result.error.format())
        }
    }
}
