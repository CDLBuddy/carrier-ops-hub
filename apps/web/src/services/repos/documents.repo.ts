// carrier-ops-hub/apps/web/src/services/repos/documents.repo.ts

// Document repository

export const documentsRepo = {
    async getByLoadId(_loadId: string) {
        // TODO: Fetch documents for a load
        return [];
    },

    async upload(_file: File, _loadId: string, _fleetId: string) {
        // TODO: Upload document to Storage
        // Path format: fleets/{fleetId}/loads/{loadId}/docs/{docId}-{filename}
        throw new Error('Not implemented');
    },

    async delete(_documentId: string) {
        // TODO: Delete document
        throw new Error('Not implemented');
    },
};
