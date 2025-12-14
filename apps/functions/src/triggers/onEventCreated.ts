// carrier-ops-hub/apps/functions/src/triggers/onEventCreated.ts

import * as functions from 'firebase-functions';
import { updateDispatcherQueues } from '../domain/readModels';
import { logger } from '../shared/logger';

export const onEventCreated = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snapshot, context) => {
        const event = snapshot.data();
        logger.info('Event created', { eventId: context.params.eventId, event });

        // TODO: Implement event-driven logic
        // - Update read models
        // - Send notifications
        // - Trigger alerts

        if (event.loadId) {
            await updateDispatcherQueues(event.loadId);
        }
    });
