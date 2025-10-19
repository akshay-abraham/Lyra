// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview `useDoc` Real-time Firestore Hook (`use-doc.tsx`)
 *
 * C-like Analogy:
 * This file is very similar to `use-collection.tsx`, but it's designed to subscribe
 * to a *single document* instead of a collection (a list of documents).
 *
 * It's the difference between `SELECT * FROM users` (`useCollection`) and
 * `SELECT * FROM users WHERE id = 'user123' LIMIT 1` (`useDoc`).
 *
 * Like `useCollection`, it sets up a real-time listener using Firebase's `onSnapshot`.
 * Whenever the specific document it's watching is updated, created, or deleted,
 * the hook automatically receives the new data, updates its state, and causes the
 * UI to re-render with the latest information.
 *
 * This is extremely useful for things like displaying a user's profile, where you
 * want the information on the screen to update instantly if the user changes their name
 * in another browser tab.
 *
 * The internal logic is almost identical to `useCollection`, but it handles a single
 * `DocumentSnapshot` instead of a `QuerySnapshot`.
 */
'use client';

import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type. In C, this would be like taking a struct `T` and adding a new
 * `char* id` member to it. */
type WithId<T> = T & { id: string };

/**
 * C-like Analogy: `typedef struct { ... } UseDocResult;`
 * This defines the shape of the object that our `useDoc` hook will return.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // A pointer to a single struct, or NULL.
  isLoading: boolean;       // `true` if we're waiting for the first response.
  error: FirestoreError | Error | null; // A pointer to an error object, or NULL.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 *
 * @param {DocumentReference | null} memoizedDocRef - A memoized Firestore DocumentReference.
 *   Memoization is CRITICAL to prevent infinite loops, just like in `useCollection`.
 * @returns {UseDocResult<T>} An object with the document data, loading state, and error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  // Define a type for our state variable. It can be a single struct or null.
  type StateDataType = WithId<T> | null;

  // State variables to hold the document data, loading status, and error.
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // The `useEffect` hook for managing the subscription side effect.
  useEffect(() => {
    // If the document reference is null, we can't fetch anything. Reset state and exit.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Start loading.
    setIsLoading(true);
    setError(null);

    // `onSnapshot` creates the real-time listener on the single document.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      // 1. Success Callback
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // Check if the document actually exists in the database.
        if (snapshot.exists()) {
          // If it exists, combine its data with its ID and update the state.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // If the document doesn't exist (or was deleted), set data to null.
          setData(null);
        }
        setError(null); // Clear any previous errors on a successful read.
        setIsLoading(false);
      },
      // 2. Error Callback
      (error: FirestoreError) => {
        // If the listener fails (e.g., permission denied)...
        // Create our custom, detailed error object.
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        // Update state to reflect the error.
        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Emit the global error event.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Return the cleanup function to be called when the component unmounts.
    // This closes the database connection.
    return () => unsubscribe();
  }, [memoizedDocRef]); // Dependency array: re-run if the document reference changes.

  return { data, isLoading, error };
}
