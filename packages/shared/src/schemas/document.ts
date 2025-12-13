// carrier-ops-hub/packages/shared/src/schemas/document.ts

// TODO: Replace with Zod schemas in Phase 3

export const DocumentSchema = {
  id: 'string',
  loadId: 'string',
  type: 'string',
  fileName: 'string',
  fileUrl: 'string',
  uploadedBy: 'string',
  createdAt: 'date',
};

export type Document = {
  id: string;
  loadId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: Date;
};
