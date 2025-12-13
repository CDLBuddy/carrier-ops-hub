// carrier-ops-hub/apps/web/src/firebase/converters/event.ts

import type { FirestoreDataConverter, DocumentData } from 'firebase/firestore';

interface Event {
  id: string;
  // TODO: Add event fields
}

export const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore(event: Event): DocumentData {
    return { ...event };
  },
  
  fromFirestore(snapshot, options): Event {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as Event;
  },
};
