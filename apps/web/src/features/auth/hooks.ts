// carrier-ops-hub/apps/web/src/features/auth/hooks.ts

export function useAuth() {
  // TODO: Implement auth hook
  return {
    user: null,
    isLoading: false,
    signIn: async () => {},
    signOut: async () => {},
  }
}

export function useCurrentUser() {
  // TODO: Return current user with profile data
  return null
}
