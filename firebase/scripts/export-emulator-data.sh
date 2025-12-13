#!/bin/bash
# carrier-ops-hub/firebase/scripts/export-emulator-data.sh

# Export current emulator data for seeding
# Usage: ./firebase/scripts/export-emulator-data.sh

set -e

EXPORT_DIR="./firebase/emulator-data"

echo "📦 Exporting emulator data to $EXPORT_DIR..."

firebase emulators:export "$EXPORT_DIR" --force

echo "✅ Export complete!"
echo "Data saved to: $EXPORT_DIR"
