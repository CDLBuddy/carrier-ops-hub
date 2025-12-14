// carrier-ops-hub/apps/functions/src/triggers/onEventCreated.ts

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { updateDispatcherQueues } from '../domain/readModels';
import { logger } from '../shared/logger';

export const onEventCreated = onDocumentCreated(
    'events/{eventId}',
    async (event) => {
        const eventData = event.data?.data();
        logger.info('Event created', { eventId: event.params.eventId, event: eventData });

        // TODO: Implement event-driven logic
        // - Update read models
        // - Send notifications
        // - Trigger alerts

        if (eventData && 'loadId' in eventData && eventData.loadId) {
            await updateDispatcherQueues(eventData.loadId);
        }
    });
