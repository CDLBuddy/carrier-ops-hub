// carrier-ops-hub/apps/web/src/types/index.ts

// App-specific types (not shared with backend)

export interface UIState {
    isLoading: boolean;
    error: string | null;
}

export type ViewMode = 'list' | 'grid' | 'map';

export type Theme = 'light' | 'dark' | 'system';
