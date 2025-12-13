// carrier-ops-hub/apps/functions/src/index.ts

import * as triggers from './triggers';
import * as http from './http';
import * as jobs from './jobs';

// Export all functions
export const onEventCreated = triggers.onEventCreated;
export const onDocumentCreated = triggers.onDocumentCreated;

export const samsaraWebhook = http.samsaraWebhook;
export const motiveWebhook = http.motiveWebhook;

export const nightlyComplianceSweep = jobs.nightlyComplianceSweep;
