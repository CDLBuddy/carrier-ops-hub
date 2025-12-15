// carrier-ops-hub/apps/web/src/lib/validation.ts

import { z } from 'zod'

/**
 * Validation error with user-friendly message
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly fieldErrors?: Record<string, string[]>
    ) {
        super(message)
        this.name = 'ValidationError'
    }
}

/**
 * Formats Zod validation errors into user-friendly messages
 */
function formatZodError(error: z.ZodError): { message: string; fieldErrors: Record<string, string[]> } {
    const fieldErrors: Record<string, string[]> = {}

    for (const issue of error.issues) {
        const path = issue.path.join('.')
        const message = issue.message

        if (!fieldErrors[path]) {
            fieldErrors[path] = []
        }
        fieldErrors[path].push(message)
    }

    const errorCount = error.issues.length
    const message = `Validation failed with ${errorCount} error${errorCount === 1 ? '' : 's'}`

    return { message, fieldErrors }
}

/**
 * Validates input data before processing or writing to database.
 * Throws ValidationError on failure.
 * 
 * @example
 * validateInput(AssignmentDataSchema, assignmentData)
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
    const result = schema.safeParse(data)

    if (!result.success) {
        const { message, fieldErrors } = formatZodError(result.error)
        const contextMsg = context ? ` (${context})` : ''
        throw new ValidationError(`${message}${contextMsg}`, fieldErrors)
    }

    return result.data
}

/**
 * Validates output data read from database before returning to caller.
 * Throws ValidationError on failure.
 * 
 * @example
 * validateOutput(LoadSchema, loadData)
 */
export function validateOutput<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
    const result = schema.safeParse(data)

    if (!result.success) {
        const { message, fieldErrors } = formatZodError(result.error)
        const contextMsg = context ? ` (${context})` : ''
        console.error(`Output validation failed${contextMsg}:`, fieldErrors)
        throw new ValidationError(`${message}${contextMsg}`, fieldErrors)
    }

    return result.data
}

/**
 * Validates data in development mode only. Logs warnings to console but does not throw.
 * Use for internal consistency checks that shouldn't block production.
 * 
 * @example
 * devValidate(TransitionResultSchema, transition)
 */
export function devValidate<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T | null {
    if (import.meta.env.MODE !== 'development') {
        return data as T
    }

    const result = schema.safeParse(data)

    if (!result.success) {
        const { message, fieldErrors } = formatZodError(result.error)
        const contextMsg = context ? ` (${context})` : ''
        console.warn(`[DEV] Validation warning${contextMsg}:`, message)
        console.warn('[DEV] Field errors:', fieldErrors)
        console.warn('[DEV] Data:', data)
        return null
    }

    return result.data
}

/**
 * Validates partial data (useful for updates where not all fields are required).
 * Throws ValidationError on failure.
 * 
 * @example
 * validatePartial(LoadSchema, { status: 'ASSIGNED' })
 */
export function validatePartial<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    data: unknown,
    context?: string
): Partial<z.infer<z.ZodObject<T>>> {
    const partialSchema = schema.partial()
    return validateInput(partialSchema, data, context)
}
