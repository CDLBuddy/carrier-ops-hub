// carrier-ops-hub/apps/functions/src/triggers/onDocumentCreated.ts

import { onDocumentCreated as onDocumentCreatedV2 } from 'firebase-functions/v2/firestore';
import { logger } from '../shared/logger';

export const onDocumentCreated = onDocumentCreatedV2(
    'documents/{documentId}',
    async (event) => {
        const document = event.data?.data();
        logger.info('Document created', { documentId: event.params.documentId, document });

        // TODO: Implement document processing
        // - OCR for text extraction
        // - Thumbnail generation
        // - Notification to relevant users
    });
