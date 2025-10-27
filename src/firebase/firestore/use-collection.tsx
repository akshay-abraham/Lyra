// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview `useCollection` Real-time Firestore Hook (`use-collection.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a custom React Hook, `useCollection`, which simplifies the process
 * of subscribing to a Firestore collection or query in real-time. It handles the
 * complexities of setting up, managing, and tearing down a real-time listener.
 *
 * C-like Analogy:
 * This hook is like creating a subscription to a database query that automatically
 * updates your UI. Imagine in C you want to display a list of items from a database.
 * You would:
 * 1. Write a function `fetch_items()` to connect to the DB and get the data.
 * 2. Store the result in a local variable, `Item* items = fetch_items()`.
 * 3. Render the items.
 *
 * But what if the data changes? You would need to manually re-run `fetch_items()`
 * and update your UI. The `useCollection` hook automates this using Firebase's
 * `onSnapshot` listener, which is like setting up a persistent connection that
 * notifies your app of any changes.
 *
 * PSEUDOCODE of how it works internally:
 * ```c
 * UseCollectionResult* useCollection(Query* query) {
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
 *       // b. SUCCESS CALLBACK: This is called immediately, and then
 *       //    again *every time* the data on the server changes.
 *       (snapshot) => {
 *         // Convert the database results into an array of structs.
 *         state.data = parse_snapshot(snapshot);
 *         state.isLoading = false;
 *         state.error = NULL;
 *         // React automatically re-renders the UI with the new data.
 *       },
 *       // c. ERROR CALLBACK: This is called if the subscription fails
 *       //    (e.g., due to a security rule permission error).
 *       (error) => {
 *         state.error = create_custom_permission_error(error);
 *         state.data = NULL;
 *         state.isLoading = false;
 *         emit_error_event(state.error); // Notify other parts of the app.
 *       }
 *     );
 *
 *     // d. CLEANUP: Return a function to be called when the component is removed.
 *     //    This is like calling `free()` or `close_subscription()`.
 *     return () => unsubscribe(database_subscription);
 *
 *   }, [query]); // The dependency array: re-run if `query` changes.
 *
 *   // 3. Return the current state.
 *   return state;
 * }
 * ```
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
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A utility type that takes a generic type `T` and adds an `id` property.
 * C-like Analogy: `typedef struct { T; char* id; } WithId<T>;`
 * @template T - The base type.
 */
export type WithId<T> = T & { id: string };

/**
 * The shape of the object returned by the `useCollection` hook.
 * C-like Analogy: `typedef struct { ... } UseCollectionResult;`
 * @interface UseCollectionResult
 * @template T - The type of the documents in the collection.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * The shape of the object returned by the `useDoc` hook.
 * @interface UseDocResult
 * @template T - The type of the document.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * An internal type to access a private member of the Firebase Query object.
 * This is needed to get the query's path for detailed error messages.
 * C-like Analogy: Casting a `void*` to a specific struct type to access its
 * internal fields that aren't part of the public API.
 * @interface InternalQuery
 */
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

/**
 * A custom React hook to subscribe to a Firestore collection or query in real-time.
 *
 * @template T - The expected type of the documents in the collection.
 * @param {Query | CollectionReference | null | undefined} memoizedTargetRefOrQuery - A **memoized** Firestore Query or CollectionReference.
 *   **CRITICAL**: This argument MUST be memoized using `useMemo` or `useMemoFirebase`.
 *   If a new query object is created on every render, this hook will enter an infinite
 *   loop of subscribing and unsubscribing, leading to high costs and poor performance.
 * @returns {UseCollectionResult<T>} An object containing the data array, loading state, and error.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & {
        __memo?: boolean;
      })
    | null
    | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      },
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    console.warn(
      'useCollection query was not properly memoized using useMemoFirebase. This can cause infinite loops.',
    );
  }

  return { data, isLoading, error };
}

/**
 * A custom React hook to subscribe to a single Firestore document in real-time.
 *
 * @template T - The expected type of the document.
 * @param {DocumentReference | null | undefined} memoizedDocRef - A **memoized** Firestore DocumentReference.
 *   Like `useCollection`, memoization is critical to prevent infinite loops.
 * @returns {UseDocResult<T>} An object with the document data, loading state, and error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null); // Document does not exist or was deleted.
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      },
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
