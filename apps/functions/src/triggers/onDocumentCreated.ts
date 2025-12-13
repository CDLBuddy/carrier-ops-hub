// carrier-ops-hub/apps/functions/src/triggers/onDocumentCreated.ts

import * as functions from 'firebase-functions';
import { logger } from '../shared/logger';

export const onDocumentCreated = functions.firestore
  .document('documents/{documentId}')
  .onCreate(async (snapshot, context) => {
    const document = snapshot.data();
    logger.info('Document created', { documentId: context.params.documentId, document });

    // TODO: Implement document processing
    // - OCR for text extraction
    // - Thumbnail generation
    // - Notification to relevant users
  });
