// carrier-ops-hub/apps/functions/src/config/env.ts

export const env = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'carrier-ops-hub',
  samsaraApiKey: process.env.SAMSARA_API_KEY || '',
  motiveApiKey: process.env.MOTIVE_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};
