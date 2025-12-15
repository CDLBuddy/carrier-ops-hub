// carrier-ops-hub/apps/web/src/lib/errorMessages.ts

/**
 * Maps error codes and types to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
    if (!error) {
        return 'An unexpected error occurred'
    }

    // Handle Error objects
    if (error instanceof Error) {
        // Network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return 'Network error. Please check your connection and try again.'
        }

        // Permission errors
        if (error.message.includes('Forbidden') || error.message.includes('Permission denied')) {
            return 'You do not have permission to perform this action.'
        }

        // Validation errors
        if (error.message.includes('Invalid') || error.message.includes('Validation failed')) {
            return `Validation error: ${error.message}`
        }

        // Not found errors
        if (error.message.includes('not found')) {
            return error.message
        }

        // Status transition errors
        if (error.message.includes('Cannot')) {
            return error.message
        }

        // Generic error with message
        return error.message || 'An unexpected error occurred'
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error
    }

    // Handle Firestore errors
    if (typeof error === 'object' && error !== null) {
        const err = error as { code?: string; message?: string }

        if (err.code) {
            switch (err.code) {
                case 'permission-denied':
                    return 'You do not have permission to perform this action.'
                case 'not-found':
                    return 'The requested resource was not found.'
                case 'unavailable':
                    return 'Service temporarily unavailable. Please try again.'
                case 'unauthenticated':
                    return 'You must be logged in to perform this action.'
                case 'deadline-exceeded':
                    return 'Request timed out. Please try again.'
                default:
                    return err.message || 'An unexpected error occurred'
            }
        }

        if (err.message) {
            return err.message
        }
    }

    return 'An unexpected error occurred'
}

/**
 * Get user-friendly action name for driver actions
 */
export function getDriverActionName(action: string): string {
    switch (action) {
        case 'ARRIVE_PICKUP':
            return 'arrive at pickup'
        case 'DEPART_PICKUP':
            return 'depart pickup'
        case 'ARRIVE_DELIVERY':
            return 'arrive at delivery'
        case 'MARK_DELIVERED':
            return 'mark delivered'
        default:
            return action.toLowerCase().replace(/_/g, ' ')
    }
}

/**
 * Get user-friendly action name for dispatcher actions
 */
export function getDispatcherActionName(action: string): string {
    switch (action) {
        case 'ASSIGN':
            return 'assign load'
        case 'REASSIGN':
            return 'reassign load'
        case 'UNASSIGN':
            return 'unassign load'
        case 'CANCEL':
            return 'cancel load'
        case 'REACTIVATE':
            return 'reactivate load'
        default:
            return action.toLowerCase().replace(/_/g, ' ')
    }
}
