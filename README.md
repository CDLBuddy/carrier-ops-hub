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

### Phase 2: Connect External Services ✅

**Completed:**

- ✅ GitHub repository: [https://github.com/CDLBuddy/carrier-ops-hub](https://github.com/CDLBuddy/carrier-ops-hub)
- ✅ Firebase project ID: `carrier-ops-hub` (aliased as `dev` in `.firebaserc`)
- ✅ Vercel project: `carrier-ops-hub`
  - Root directory: `apps/web`
  - Environment variables: All `VITE_*` variables added to production
  - **Important:** Vite requires the `VITE_` prefix for client-side env vars
- ✅ Working Copy: Remote connection ready for iOS development

**Firebase Emulators:**

- Auth: `http://localhost:9099`
- Firestore: `localhost:8080`
- Storage: `localhost:9199`
- UI: `http://localhost:4000`

Set `VITE_USE_FIREBASE_EMULATORS=true` in `apps/web/.env.local` to use emulators in development.

### Phase 3: Run It Locally ✅

**Prerequisites:**

- Node.js 18+ (modern LTS recommended)
- pnpm 9+ installed
- Java JDK 11+ (required for Firebase emulators)

**Vercel Configuration (Important for Monorepo):**
In Vercel Project Settings, enable:

- ✅ "Include source files outside of the Root Directory"

Without this, Vercel builds will fail when `apps/web` imports `@coh/shared`.

**Setup Steps:**

1. **Install dependencies:**

```bash
pnpm install
```

2. **Create local environment file:**

```bash
# Create apps/web/.env.local
cp .env.example apps/web/.env.local
```

Then edit `apps/web/.env.local` and fill in your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=carrier-ops-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carrier-ops-hub
VITE_FIREBASE_STORAGE_BUCKET=carrier-ops-hub.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_FIREBASE_EMULATORS=false  # Set to true for local emulators
```

**Note:** All `VITE_*` variables are exposed to the client bundle. Do not put secrets here.

3. **Run the development server:**

```bash
# From repository root
pnpm dev
# Or explicitly:
pnpm --filter web dev
```

4. **Optional - Run Firebase Emulators:**

```bash
pnpm dev:emulators
```

The emulators will start on:

- Auth: http://localhost:9099
- Firestore: localhost:8080
- Storage: localhost:9199
- Functions: localhost:5001
- Emulator UI: http://localhost:4000

**Common Issues:**

- **Vercel builds fail:** Enable "Include source files outside of the Root Directory" in Vercel settings
- **Emulators won't start:** Make sure Java JDK 11+ is installed
- **Routes not generating:** Check that `routesDirectory` in `vite.config.ts` matches your folder structure

### Phase 4: First Usable Vertical Slice ✅

**Goal:** End-to-end flow from auth → bootstrap → dispatch dashboard with ability to create/view loads.

**What's Working:**

1. **Authentication Flow:**
   - Visit http://localhost:3000/ → redirects to `/auth/sign-in`
   - Sign up or sign in with email/password
   - Firebase Auth manages user sessions
   - Custom claims: `{ fleetId, roles[], driverId? }`

2. **Bootstrap Flow (Emulator/Dev Only):**
   - After sign-in, if no `fleetId` → redirects to `/auth/bootstrap`
   - Create a fleet by providing:
     - Fleet name
     - Your role(s): Owner, Dispatcher, Fleet Manager, Maintenance Manager, Billing, Driver
   - Calls `bootstrapFleet` Cloud Function which:
     - Creates fleet document in `/fleets`
     - Creates user document in `/users/{uid}`
     - If "Driver" role selected: creates driver document and sets `driverId` claim
     - Sets custom claims on user token
   - After bootstrap, redirects to role-based landing page

3. **Dispatch Dashboard (`/dispatch/dashboard`):**
   - Guards: requires authentication + dispatcher or owner role
   - Features:
     - View all loads for your fleet
     - Create new load with customer name and reference number
     - Automatically creates 2 placeholder stops (PICKUP, DELIVERY)
     - Loads list shows: load number, status, customer name, last updated time
   - Uses TanStack Query for data fetching and mutations

4. **Driver Home (`/driver/home`):**
   - Guards: requires authentication + driver role
   - Shows "No load assigned" empty state
   - Future: will show current load assignment

5. **My Day (`/my-day`):**
   - Guards: requires authentication
   - Shows quick links based on user roles:
     - Dispatcher/Owner → Dispatch Dashboard
     - Billing/Owner → Billing Dashboard
     - Driver → Driver Home
   - Dev mode: displays current user email, fleetId, roles, driverId

**How to Test:**

1. **Start dev server and emulators:**

```bash
# Terminal 1: Start emulators
pnpm dev:emulators

# Terminal 2: Start web app
pnpm dev
```

2. **Make sure emulator mode is enabled:**
   Edit `apps/web/.env.local`:

```env
VITE_USE_FIREBASE_EMULATORS=true
```

3. **Sign up and bootstrap:**

- Visit http://localhost:3000/
- Click "Need an account? Sign up"
- Enter email/password and click "Sign Up"
- You'll be redirected to `/auth/bootstrap`
- Enter a fleet name (e.g., "Acme Trucking")
- Select roles (e.g., Owner + Dispatcher)
- Click "Create Fleet"
- You'll be redirected to `/dispatch/dashboard` (or `/my-day` depending on roles)

4. **Create your first load:**

- On the Dispatch Dashboard, click "Create Load"
- Enter customer name and reference number
- Click "Create"
- Load appears in the list below

**Security:**

- Firestore rules enforce tenant isolation via `fleetId`
- Users can only read/write data within their fleet
- All collections check: `resource.data.fleetId == request.auth.token.fleetId`
- Bootstrap function only works in emulator mode (production will use different onboarding)

**Next Steps:**

- Add load details page with stops management
- Implement driver assignment
- Add real-time updates for load status
- Implement billing features

## Development

**Available Scripts:**

- `pnpm dev` - Start web dev server
- `pnpm dev:web` - Start web dev server (explicit)
- `pnpm dev:emulators` - Start Firebase emulators
- `pnpm build` - Build all packages
- `pnpm typecheck` - Type check all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

**Project Conventions:**

- Firestore repo pattern: All database access goes through `services/repos/`
- TanStack Query hooks: Feature-based hooks in `features/{domain}/hooks.ts`
- Guards: Route guards in `app/routing/guards/` for auth and role checks
- Router context: Auth context passed to router for use in `beforeLoad`

## License

Proprietary
