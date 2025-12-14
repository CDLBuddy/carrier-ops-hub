// carrier-ops-hub/apps/functions/src/shared/logger.ts

// Centralized logging utility

export const logger = {
    info: (message: string, data?: unknown) => {
        console.log(`[INFO] ${message}`, data || '');
    },

    error: (message: string, error?: unknown) => {
        console.error(`[ERROR] ${message}`, error || '');
    },

    warn: (message: string, data?: unknown) => {
        console.warn(`[WARN] ${message}`, data || '');
    },

    debug: (message: string, data?: unknown) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    },
};
