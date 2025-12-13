#!/bin/bash
# carrier-ops-hub/firebase/scripts/deploy.sh

# Deploy Firebase configuration and functions
# Usage: ./firebase/scripts/deploy.sh [--functions-only|--rules-only]

set -e

echo "🚀 Deploying Firebase..."

if [ "$1" = "--functions-only" ]; then
  echo "Deploying functions only..."
  firebase deploy --only functions
elif [ "$1" = "--rules-only" ]; then
  echo "Deploying rules only..."
  firebase deploy --only firestore:rules,storage:rules
else
  echo "Deploying everything..."
  firebase deploy
fi

echo "✅ Deploy complete!"
