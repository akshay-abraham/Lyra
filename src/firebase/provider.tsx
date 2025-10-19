// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Main Firebase Context Provider (`provider.tsx`)
 *
 * C-like Analogy:
 * This file implements a core concept in React called "Context". A Context Provider
 * is a special component that makes data available to all other components nested
 * inside it, without having to pass that data down through every layer of components
 * as function arguments.
 *
 * Imagine in C you have a global struct, `g_firebase_services`, that holds your
 * database connection and user information. Any function in your program can
* access this global variable. React Context provides a safer, more structured
 * way to achieve the same result.
 *
 * This `<FirebaseProvider>` does two main things:
 *
 * 1.  **Holds State:** It holds the handles to the Firebase services (app, auth, firestore)
 *     that it receives as props.
 *
 * 2.  **Manages Authentication State:** This is the most critical part. It uses the
 *     `onAuthStateChanged` listener from the Firebase Auth SDK. This is a callback
 *     function that Firebase calls *automatically* whenever a user logs in, logs out,
 *     or when the app first loads and their session is restored.
 *     - When the listener gets a `user` object, it means someone is logged in.
 *     - When it gets `null`, it means the user is logged out.
 *     - It stores this user status (and loading state) in its own internal state.
 *
 * 3.  **Provides Data:** It puts all this information (the service handles and the
 *     user's auth status) into the "Context", making it available to any other
 *     component in the app that wants to use it via the `useFirebase()` or `useUser()` hooks.
 */
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

// C-like Analogy: `typedef struct { ... } FirebaseProviderProps;`
// The inputs to our main provider component.
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// C-like Analogy: `typedef struct { ... } UserAuthState;`
// A struct to hold the user's authentication status.
interface UserAuthState {
  user: User | null;      // Pointer to the User object, or NULL.
  isUserLoading: boolean; // True while we're waiting for the first auth check.
  userError: Error | null;  // Any error from the auth listener.
}

// C-like Analogy: `typedef struct { ... } FirebaseContextState;`
// The main struct that defines all the data our Context will provide.
export interface FirebaseContextState {
  areServicesAvailable: boolean; // A flag to check if Firebase was initialized correctly.
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  // User authentication state is nested here.
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// C-like Analogy: `typedef struct { ... } FirebaseServicesAndUser;`
// The return type of our `useFirebase()` hook.
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// C-like Analogy: `typedef struct { ... } UserHookResult;`
// The return type of our `useUser()` hook, focused only on auth state.
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// `createContext` is the React function that creates the actual context object.
// It's like declaring the global pointer: `FirebaseContextState* g_firebase_context = NULL;`
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * The provider component itself. It manages and provides Firebase services and auth state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // `useState` creates a state variable for the component.
  // This is where we'll store the results from the `onAuthStateChanged` listener.
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start in a loading state.
    userError: null,
  });

  // `useEffect` is for side effects. Subscribing to an external service like Firebase Auth is a side effect.
  useEffect(() => {
    // If there's no `auth` service, we can't do anything.
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    // Reset state when the auth instance changes (this is rare but good practice).
    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    // This is the core of auth management. `onAuthStateChanged` registers a callback.
    // Firebase will call this function whenever the user's login state changes.
    const unsubscribe = onAuthStateChanged(
      auth,
      // 1. Success Callback
      (firebaseUser) => {
        // We received an update from Firebase. `firebaseUser` is either a User object or null.
        // Update our state. React will then re-render any components that use this state.
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      // 2. Error Callback
      (error) => {
        // If the listener itself fails.
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    // Return the `unsubscribe` function. React will call this when the component is removed,
    // which cleans up the listener and prevents memory leaks. It's like `free()`.
    return () => unsubscribe();
  }, [auth]); // Dependency array: Re-run this effect only if the `auth` object itself changes.

  // `useMemo` is an optimization. It ensures the `contextValue` object is only
  // recreated when its contents actually change. This prevents unnecessary re-renders
  // in child components.
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    // This is the big struct of data that we will make available to the whole app.
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]); // Dependencies for the memoization.

  // Render the actual React Context Provider.
  // Any component rendered as `{children}` can now access `contextValue`.
  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* This component listens for globally emitted errors */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * C-like Explanation: `FirebaseServicesAndUser* useFirebase()`
 *
 * This is a "custom hook". It's a simple function that provides easy access
 * to the data stored in our `FirebaseContext`.
 *
 * Any component can call `useFirebase()` to get the current Firebase services and user state.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  // `useContext` is the React hook that reads the value from the nearest Provider.
  const context = useContext(FirebaseContext);

  // Error handling: if used outside a provider, `context` will be undefined.
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  // Return the full set of services and user data.
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access just the Firebase Auth instance. A convenient shortcut. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access just the Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access just the Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// A helper type for the memoization hook below.
type MemoFirebase <T> = T & {__memo?: boolean};

/**
 * C-like Explanation: `void* useMemoFirebase(callback_fn, dependencies)`
 *
 * This is a specialized version of React's `useMemo` hook. Its purpose is to
 * help prevent infinite loops when using our `useCollection` and `useDoc` hooks.
 *
 * Those hooks require a "memoized" query object. This function creates a memoized
 * value and then "tags" it with a `__memo = true` property. The `useCollection` hook
 * checks for this tag to ensure that developers have correctly memoized their queries.
 * It's a developer-facing safety check.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);

  if(typeof memoized !== 'object' || memoized === null) return memoized;
  // Add our special tag to the memoized object.
  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}

/**
 * C-like Explanation: `UserHookResult* useUser()`
 *
 * Another custom hook. This one is a shortcut for components that *only* care
 * about the user's authentication status and don't need the full `firestore` or `firebaseApp` handles.
 * It calls the main `useFirebase` hook and returns just a subset of the data.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook.
  return { user, isUserLoading, userError };
};
