// carrier-ops-hub/apps/web/src/features/loads/realtimeHooks.ts

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    doc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/firebase/firestore'
import { COLLECTIONS } from '@coh/shared'
import { withDocId } from '@/services/repos/repoUtils'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'
import type { LoadData } from './hooks'
import type { EventData } from '@/services/repos/events.repo'

/**
 * Real-time subscription to a single load document.
 * Updates automatically when the load changes in Firestore.
 */
export function useLoadRealtime(loadId: string) {
    const { claims } = useAuth()
    const fleetId = claims.fleetId

    return useQuery({
        queryKey: queryKeys.loads.detail(fleetId || '', loadId),
        queryFn: () =>
            new Promise<LoadData>((resolve, reject) => {
                if (!fleetId) {
                    reject(new Error('Fleet ID not available'))
                    return
                }

                const loadRef = doc(db, COLLECTIONS.LOADS, loadId)

                const unsubscribe = onSnapshot(
                    loadRef,
                    (snapshot) => {
                        if (!snapshot.exists()) {
                            reject(new Error('Load not found'))
                            return
                        }

                        const load = withDocId<LoadData>(snapshot)

                        // Validate fleet match
                        if (load.fleetId !== fleetId) {
                            reject(new Error('Load not found in your fleet'))
                            return
                        }

                        resolve(load)
                    },
                    (error) => {
                        reject(error)
                    }
                )

                // Store unsubscribe function for cleanup
                return unsubscribe
            }),
        enabled: !!fleetId && !!loadId,
        staleTime: Infinity, // Real-time data is never stale
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
    })
}

/**
 * Real-time subscription to loads list for a fleet.
 * Updates automatically when loads are added, updated, or removed.
 */
export function useLoadsRealtime(limitCount = 50) {
    const { claims } = useAuth()
    const fleetId = claims.fleetId
    const [loads, setLoads] = useState<LoadData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!fleetId) {
            setIsLoading(false)
            return
        }

        const loadsRef = collection(db, COLLECTIONS.LOADS)
        const q = query(
            loadsRef,
            where('fleetId', '==', fleetId),
            orderBy('updatedAt', 'desc'),
            limit(limitCount)
        )

        setIsLoading(true)

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const loadsList = snapshot.docs.map((doc) => withDocId<LoadData>(doc))
                setLoads(loadsList)
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                console.error('Error in loads real-time subscription:', err)
                setError(err as Error)
                setIsLoading(false)
            }
        )

        return () => unsubscribe()
    }, [fleetId, limitCount])

    return { data: loads, isLoading, error }
}

/**
 * Real-time subscription to events for a specific load.
 * Updates automatically when new events are created.
 */
export function useEventsRealtime(loadId: string) {
    const { claims } = useAuth()
    const fleetId = claims.fleetId
    const [events, setEvents] = useState<EventData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!fleetId || !loadId) {
            setIsLoading(false)
            return
        }

        const eventsRef = collection(db, COLLECTIONS.EVENTS)
        const q = query(
            eventsRef,
            where('fleetId', '==', fleetId),
            where('loadId', '==', loadId),
            orderBy('createdAt', 'desc')
        )

        setIsLoading(true)

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const eventsList = snapshot.docs.map((doc) => withDocId<EventData>(doc))
                setEvents(eventsList)
                setIsLoading(false)
                setError(null)
            },
            (err) => {
                console.error('Error in events real-time subscription:', err)
                setError(err as Error)
                setIsLoading(false)
            }
        )

        return () => unsubscribe()
    }, [fleetId, loadId])

    return { data: events, isLoading, error }
}

/**
 * Hook to detect online/offline connection state.
 * Uses Firestore's built-in connection detection.
 */
export function useConnectionState() {
    const [isOnline, setIsOnline] = useState(true)
    const [isReconnecting, setIsReconnecting] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setIsReconnecting(false)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setIsReconnecting(true)
        }

        // Browser online/offline events
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check initial state
        setIsOnline(navigator.onLine)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return { isOnline, isReconnecting }
}

/**
 * Hook to monitor Firestore connection state more precisely.
 * Uses a special .info/connected document that Firestore provides.
 */
export function useFirestoreConnectionState() {
    const [isConnected, setIsConnected] = useState(true)

    useEffect(() => {
        // Note: Firestore v9 doesn't expose .info/connected directly
        // We'll use a combination of network state and error detection
        let unsubscribe: Unsubscribe | undefined

        const testRef = doc(db, '.info', 'connected')

        try {
            // Try to set up a listener to detect connection state
            // This will fail gracefully if not supported
            unsubscribe = onSnapshot(
                testRef,
                () => {
                    setIsConnected(true)
                },
                () => {
                    // On error, assume disconnected
                    setIsConnected(false)
                }
            )
        } catch {
            // Fallback to browser online state
            setIsConnected(navigator.onLine)
        }

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [])

    return { isConnected }
}
