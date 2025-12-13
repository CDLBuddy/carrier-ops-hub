<!-- carrier-ops-hub/packages/shared/src/types/README.md -->

# Types

This directory re-exports types from the schema definitions.

All domain types should be defined in the `schemas/` directory and exported here for convenient importing.

## Usage

```typescript
import type { Load, Driver, User } from '@carrier-ops-hub/shared';
```

## Why Separate Types?

- **Schemas**: Define structure and validation (using Zod)
- **Types**: TypeScript types inferred from schemas
- This approach ensures runtime validation and type safety are always in sync
