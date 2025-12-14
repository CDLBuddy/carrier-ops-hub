// carrier-ops-hub/apps/web/src/lib/assert.ts

export function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

export function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${value}`);
}
