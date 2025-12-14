// carrier-ops-hub/apps/web/src/services/repos/documents.repo.ts

// Document repository

export const documentsRepo = {
    async getByLoadId(loadId: string) {
        // TODO: Fetch documents for a load
        return [];
    },

    async upload(file: File, loadId: string) {
        // TODO: Upload document to Storage
        throw new Error('Not implemented');
    },

    async delete(documentId: string) {
        // TODO: Delete document
        throw new Error('Not implemented');
    },
};
