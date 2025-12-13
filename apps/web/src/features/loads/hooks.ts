// carrier-ops-hub/apps/web/src/features/loads/hooks.ts

export function useLoads() {
  // TODO: Implement loads query hook
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useLoad(id: string) {
  // TODO: Implement single load query hook
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreateLoad() {
  // TODO: Implement load creation mutation
  return {
    mutate: async () => {},
    isPending: false,
  };
}
