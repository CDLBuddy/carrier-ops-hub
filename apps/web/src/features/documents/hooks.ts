// carrier-ops-hub/apps/web/src/features/documents/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  documentsRepo,
  type UploadDocumentParams,
  type DocumentData,
} from '@/services/repos/documents.repo'
import { queryKeys } from '@/data/queryKeys'
import { useAuth } from '@/app/providers/AuthContext'

export type { DocumentData, UploadDocumentParams }

export function useDocuments(loadId: string) {
  const { claims } = useAuth()
  const fleetId = claims.fleetId

  return useQuery({
    queryKey: queryKeys.documents.byLoad(fleetId || '', loadId),
    queryFn: () => documentsRepo.listForLoad({ fleetId: fleetId || '', loadId }),
    enabled: !!fleetId && !!loadId,
  })
}

export function useUploadDocument(loadId: string) {
  const { user, claims } = useAuth()
  const queryClient = useQueryClient()
  const fleetId = claims.fleetId

  return useMutation({
    mutationFn: (params: Omit<UploadDocumentParams, 'fleetId' | 'loadId' | 'actorUid'>) =>
      documentsRepo.upload({
        fleetId: fleetId || '',
        loadId,
        actorUid: user?.uid || '',
        ...params,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byLoad(fleetId || '', loadId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.byLoad(fleetId || '', loadId) })
    },
  })
}
