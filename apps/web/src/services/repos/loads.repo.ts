// carrier-ops-hub/apps/web/src/services/repos/loads.repo.ts

// Load repository - boundary between app and Firebase

export const loadsRepo = {
  async getAll() {
    // TODO: Fetch loads from Firestore
    return [];
  },

  async getById(id: string) {
    // TODO: Fetch single load
    throw new Error('Not implemented');
  },

  async create(data: unknown) {
    // TODO: Create load
    throw new Error('Not implemented');
  },

  async update(id: string, data: unknown) {
    // TODO: Update load
    throw new Error('Not implemented');
  },

  async delete(id: string) {
    // TODO: Delete load
    throw new Error('Not implemented');
  },
};
