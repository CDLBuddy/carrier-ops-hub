// carrier-ops-hub/apps/web/src/features/loads/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadsRepo, type LoadData } from '@/services/repos/loads.repo';
import { queryKeys } from '@/data/queryKeys';
import { useAuth } from '@/app/providers/AuthContext';

export function useLoads() {
    const { claims } = useAuth();
    const fleetId = claims.fleetId;

    return useQuery({
        queryKey: queryKeys.loads.byFleet(fleetId || ''),
        queryFn: () => loadsRepo.listByFleet({ fleetId: fleetId || '' }),
        enabled: !!fleetId,
    });
}

export function useCreateLoad() {
    const { claims } = useAuth();
    const queryClient = useQueryClient();
    const fleetId = claims.fleetId;

    return useMutation({
        mutationFn: (load: Partial<LoadData>) =>
            loadsRepo.createLoad({ fleetId: fleetId || '', load }),
        onSuccess: () => {
            if (fleetId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.loads.byFleet(fleetId) });
            }
        },
    });
}
