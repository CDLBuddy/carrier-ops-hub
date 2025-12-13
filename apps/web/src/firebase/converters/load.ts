// carrier-ops-hub/apps/web/src/firebase/converters/load.ts

import type { FirestoreDataConverter, DocumentData } from 'firebase/firestore';

interface Load {
  id: string;
  // TODO: Add load fields
}

export const loadConverter: FirestoreDataConverter<Load> = {
  toFirestore(load: Load): DocumentData {
    // TODO: Convert Load to Firestore data
    return { ...load };
  },
  
  fromFirestore(snapshot, options): Load {
    const data = snapshot.data(options);
    // TODO: Convert Firestore data to Load
    return {
      id: snapshot.id,
      ...data,
    } as Load;
  },
};
