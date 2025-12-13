<!-- carrier-ops-hub/README.md -->

# Carrier Ops Hub

A modern TMS (Transportation Management System) for small trucking carriers.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TanStack Router + TanStack Query
- **Backend:** Firebase (Firestore, Functions, Auth, Storage)
- **Monorepo:** pnpm workspaces + Turbo
- **Validation:** Zod
- **Styling:** TBD (Tailwind or similar)

## Project Structure

```
carrier-ops-hub/
├── apps/
│   ├── web/           # React web app
│   └── functions/     # Firebase Cloud Functions
├── packages/
│   └── shared/        # Shared domain logic, schemas, types
├── firebase/          # Firebase config, rules, migrations
└── docs/              # Documentation
```

## Next Phases

### Phase 2: Connect External Services
- [ ] Connect GitHub repository
- [ ] Set up Vercel deployment
- [ ] Configure Firebase project
- [ ] Set up Working Copy remote sync (iOS)

### Phase 3: Install Dependencies & Configure Tooling
- [ ] Run `pnpm install` to install all dependencies
- [ ] Configure ESLint and Prettier
- [ ] Set up Turbo pipeline
- [ ] Clean up JSON comment headers
- [ ] Test Firebase emulator setup
- [ ] Generate TanStack Router routes

## Development

(Instructions will be added in Phase 3)

## License

Proprietary
