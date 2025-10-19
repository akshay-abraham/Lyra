/**
 * @fileoverview `useCollection` Real-time Firestore Hook (`use-collection.tsx`)
 *
 * C-like Analogy:
 * This file defines a "React Hook" called `useCollection`. A hook is a reusable
 * function that lets you "hook into" React features. This specific hook is like
 * creating a subscription to a database query.
 *
 * Imagine in C you want to display a list of items from a database. You would:
 * 1. Write a function `fetch_items()` that connects to the DB and gets the data.
 * 2. Store the result in a local variable, `Item* items = fetch_items()`.
 * 3. Render the items.
 *
 * But what if the data changes in the database? You would need to manually re-run
 * `fetch_items()` and update your UI.
 *
 * The `useCollection` hook automates this. It uses Firebase's `onSnapshot` listener,
 * which is like setting up a persistent connection to the database.
 *
 * PSEUDOCODE of how it works internally:
 *
 * function useCollection(query):
 *   // 1. Setup state variables (like local variables in a function).
 *   //    These hold the current data, loading status, and any errors.
 *   state.data = NULL;
 *   state.isLoading = true;
 *   state.error = NULL;
 *
 *   // 2. Use a special React hook `useEffect` that runs when `query` changes.
 *   //    This is like registering a callback.
 *   useEffect(() => {
 *     // When the component mounts or the query changes:
 *     // a. Start the subscription. `onSnapshot` is the key Firebase function.
 *     database_subscription = onSnapshot(query,
 *       // b. SUCCESS CALLBACK: This function is called immediately, and then
 *       //    again *every time* the data on the server changes.
 *       (snapshot) => {
 *         // Convert the database results into an array of structs.
 *         state.data = parse_snapshot(snapshot);
 *         state.isLoading = false; // We have data, so we are no longer loading.
 *         state.error = NULL;
 *         // React automatically re-renders the UI with the new data.
 *       },
 *       // c. ERROR CALLBACK: This function is called if the subscription fails
 *       //    (e.g., due to a security rule permission error).
 *       (error) => {
 *         // Create our detailed, custom error object.
 *         state.error = create_custom_permission_error(error);
 *         state.data = NULL;
 *         state.isLoading = false;
 *         // Use our global event emitter to notify other parts of the app.
 *         emit_error_event(state.error);
 *       }
 *     );
 *
 *     // d. CLEANUP: Return a function to be called when the component is removed.
 *     //    This is like calling `free()` or `close_subscription()`.
 *     return () => unsubscribe(database_subscription);
 *
 *   }, [query]); // The dependency array: re-run this whole process if `query` changes.
 *
 *   // 3. Return the current state.
 *   return state;
 *
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type. In C, this would be like taking a struct `T` and adding a new
 * `char* id` member to it. */
export type WithId<T> = T & { id: string };

/**
 * C-like Analogy: `typedef struct { ... } UseCollectionResult;`
 * This defines the shape of the object that our `useCollection` hook will return.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // A pointer to an array of structs, or NULL.
  isLoading: boolean;       // `true` if we're waiting for the first response.
  error: FirestoreError | Error | null; // A pointer to an error object, or NULL.
}

/*
 * C-like Analogy: This is for accessing an "internal" or "private" member of the
 * Firebase Query object. In C, you might cast a `void*` to a specific struct type
 * to access its internal fields. This interface does something similar, giving us
 * typed access to `_query.path` which is not part of the public API but is needed
 * to create detailed error messages.
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 *
 * @param {Query | null} memoizedTargetRefOrQuery - A memoized Firestore Query.
 *   Memoization is CRITICAL. It means the query object itself doesn't get re-created
 *   on every render unless its dependencies change. If it's not memoized, this hook
 *   would enter an infinite loop of subscribing and unsubscribing.
 * @returns {UseCollectionResult<T>} An object with the data, loading state, and error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  // Define types for our state variables.
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  // `useState` declares a state variable. It's like a local variable in a C
  // function, but its value persists across re-renders.
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // `useEffect` contains the "side effect" logic – in this case, interacting with the database.
  useEffect(() => {
    // If the query is null (e.g., waiting for user to log in), do nothing.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // This is the core of the hook. `onSnapshot` creates the real-time subscription.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      // 1. Success Callback
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        // Loop through the documents in the result snapshot.
        for (const doc of snapshot.docs) {
          // Create a new object with the document's data and add its ID.
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        // Update our state with the new data. React will re-render the UI.
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      // 2. Error Callback
      (error: FirestoreError) => {
        // If we get an error (like a permission error)...
        // First, figure out the path of the query that failed.
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

        // Create our custom, detailed error object.
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        // Update the state to reflect the error.
        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Emit a global event so other parts of the app can react to this error.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // The `useEffect` hook can return a "cleanup function". This function is called
    // when the component is removed from the screen or when the hook re-runs.
    // Here, we return the `unsubscribe` function provided by `onSnapshot` to
    // close the database connection and prevent memory leaks. It's like `fclose()` or `free()`.
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Dependency array: only re-run the effect if the query object changes.

  // A safety check to enforce memoization of the query, preventing infinite loops.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('useCollection query was not properly memoized using useMemoFirebase. This will cause infinite loops.');
  }

  // Return the current state to the component that called the hook.
  return { data, isLoading, error };
}
