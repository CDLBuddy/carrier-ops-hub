<!-- carrier-ops-hub/firebase/emulators/README.md -->

# Firebase Emulators

This directory contains resources for local Firebase development using emulators.

## Setup

1. Install Firebase CLI globally: `npm install -g firebase-tools`
2. Start emulators: `firebase emulators:start --import=./emulator-data --export-on-exit`

## Emulator Ports

- **Firestore**: localhost:8080
- **Auth**: localhost:9099
- **Storage**: localhost:9199
- **Emulator UI**: localhost:4000

## Seed Data

The `seed/` directory contains scripts to populate the emulators with test data.

Run seed script: `pnpm --filter functions tsx firebase/emulators/seed/seed.ts`

## Export/Import Data

- **Export**: Data is auto-exported on exit (see firebase.json)
- **Import**: Specify `--import=./firebase/emulator-data` when starting emulators
- **Manual export**: Run `firebase/scripts/export-emulator-data.sh`

## Connecting from Web App

Set `VITE_USE_FIREBASE_EMULATORS=true` in your `.env.local` file.
