// carrier-ops-hub/apps/web/src/services/repos/events.repo.ts

// Event repository

export const eventsRepo = {
    async getByLoadId(_loadId: string) {
        // TODO: Fetch events for a load
        return [];
    },

    async create(_data: unknown) {
        // TODO: Create event
        throw new Error('Not implemented');
    },
};
