// carrier-ops-hub/packages/shared/src/types/index.ts

// Re-export types inferred from Zod schemas
export type {
    Timestamp,
    Address,
    Money,
} from '../schemas/common';

export type {
    User,
} from '../schemas/user';

export type {
    Driver,
} from '../schemas/driver';

export type {
    Vehicle,
} from '../schemas/vehicle';

export type {
    Load,
} from '../schemas/load';

export type {
    Stop,
} from '../schemas/stop';

export type {
    Document,
} from '../schemas/document';

export type {
    Expense,
} from '../schemas/expense';

export type {
    Event,
} from '../schemas/event';
