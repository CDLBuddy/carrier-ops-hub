// carrier-ops-hub/apps/web/src/lib/optimistic.ts

import type { QueryClient } from '@tanstack/react-query'

/**
 * Options for optimistic mutations
 */
export interface OptimisticMutationOptions<TData, TVariables> {
    queryKey: unknown[]
    queryClient: QueryClient
    mutationFn: (variables: TVariables) => Promise<TData>
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData
    onError?: (error: Error, variables: TVariables, context: { previousData: TData | undefined }) => void
    onSuccess?: (data: TData, variables: TVariables) => void
}

/**
 * Execute a mutation with optimistic updates.
 * Updates the cache immediately, then rolls back on error.
 * 
 * @example
 * await optimisticMutation({
 *   queryKey: queryKeys.loads.detail(fleetId, loadId),
 *   queryClient,
 *   mutationFn: () => loadsRepo.applyDriverAction(...),
 *   updateFn: (oldLoad, variables) => ({
 *     ...oldLoad,
 *     status: 'AT_PICKUP',
 *     updatedAt: Date.now(),
 *   }),
 * })
 */
export async function optimisticMutation<TData, TVariables>({
    queryKey,
    queryClient,
    mutationFn,
    updateFn,
    onError,
    onSuccess,
}: OptimisticMutationOptions<TData, TVariables>) {
    return async (variables: TVariables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey })

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<TData>(queryKey)

        // Optimistically update to the new value
        queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables))

        try {
            // Perform the mutation
            const result = await mutationFn(variables)

            // Update with server response
            queryClient.setQueryData<TData>(queryKey, result)

            onSuccess?.(result, variables)

            return result
        } catch (error) {
            // On error, roll back to the previous value
            queryClient.setQueryData<TData>(queryKey, previousData)

            onError?.(error as Error, variables, { previousData })

            throw error
        }
    }
}

/**
 * Create an optimistic update function for a list query.
 * Adds an item to the list immediately, then updates with server response.
 * 
 * @example
 * const addLoadOptimistic = optimisticListAdd({
 *   queryKey: queryKeys.loads.byFleet(fleetId),
 *   queryClient,
 *   mutationFn: (load) => loadsRepo.createLoad(load),
 *   idFn: () => `temp-${Date.now()}`, // Temporary ID
 * })
 */
export function optimisticListAdd<TItem, TVariables>({
    queryKey,
    queryClient,
    mutationFn,
    idFn,
}: {
    queryKey: unknown[]
    queryClient: QueryClient
    mutationFn: (variables: TVariables) => Promise<TItem>
    idFn: (variables: TVariables) => string
}) {
    return async (variables: TVariables) => {
        await queryClient.cancelQueries({ queryKey })

        const previousData = queryClient.getQueryData<TItem[]>(queryKey)

        // Add optimistic item with temporary ID
        const tempId = idFn(variables)
        const optimisticItem = { ...variables, id: tempId } as unknown as TItem

        queryClient.setQueryData<TItem[]>(queryKey, (old = []) => [optimisticItem, ...old])

        try {
            const result = await mutationFn(variables)

            // Replace temporary item with real item
            queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
                old.map((item) =>
                    (item as { id: string }).id === tempId ? result : item
                )
            )

            return result
        } catch (error) {
            // On error, remove the optimistic item
            queryClient.setQueryData<TItem[]>(queryKey, previousData)
            throw error
        }
    }
}

/**
 * Create an optimistic update function for removing an item from a list.
 * Removes the item immediately, then restores on error.
 * 
 * @example
 * const deleteLoadOptimistic = optimisticListRemove({
 *   queryKey: queryKeys.loads.byFleet(fleetId),
 *   queryClient,
 *   mutationFn: (loadId) => loadsRepo.deleteLoad(loadId),
 *   idFn: (loadId) => loadId,
 * })
 */
export function optimisticListRemove<TItem, TVariables>({
    queryKey,
    queryClient,
    mutationFn,
    idFn,
}: {
    queryKey: unknown[]
    queryClient: QueryClient
    mutationFn: (variables: TVariables) => Promise<void>
    idFn: (variables: TVariables) => string
}) {
    return async (variables: TVariables) => {
        await queryClient.cancelQueries({ queryKey })

        const previousData = queryClient.getQueryData<TItem[]>(queryKey)
        const idToRemove = idFn(variables)

        // Remove item optimistically
        queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
            old.filter((item) => (item as { id: string }).id !== idToRemove)
        )

        try {
            await mutationFn(variables)
        } catch (error) {
            // On error, restore the item
            queryClient.setQueryData<TItem[]>(queryKey, previousData)
            throw error
        }
    }
}

/**
 * Utility to merge partial updates into cached data.
 * Useful for optimistically updating specific fields.
 * 
 * @example
 * queryClient.setQueryData(queryKey, (old) =>
 *   mergeOptimistic(old, { status: 'ASSIGNED', updatedAt: Date.now() })
 * )
 */
export function mergeOptimistic<T>(
    oldData: T | undefined,
    updates: Partial<T>
): T {
    if (!oldData) {
        return updates as T
    }
    return { ...oldData, ...updates }
}

/**
 * Utility to update a nested field optimistically.
 * Useful for updating arrays within objects.
 * 
 * @example
 * queryClient.setQueryData(queryKey, (old) =>
 *   updateNested(old, 'stops', (stops) =>
 *     stops.map((stop, i) =>
 *       i === stopIndex ? { ...stop, isCompleted: true } : stop
 *     )
 *   )
 * )
 */
export function updateNested<T, K extends keyof T>(
    data: T | undefined,
    key: K,
    updateFn: (value: T[K]) => T[K]
): T | undefined {
    if (!data) return undefined
    return {
        ...data,
        [key]: updateFn(data[key]),
    }
}
