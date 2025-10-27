// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Main Firebase Context Provider (`provider.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file implements the core of Firebase integration with React using the "Context" API.
 * A Context Provider is a special component that makes data available to all other
 * components nested inside it, without having to pass that data down through every
 * layer of components as function arguments (a problem known as "prop drilling").
 *
 * This `<FirebaseProvider>` does two main things:
 *
 * 1.  **Holds State:** It receives the initialized Firebase service handles (app, auth, firestore)
 *     as props and holds them.
 *
 * 2.  **Manages Authentication State:** This is its most critical role. It uses the
 *     `onAuthStateChanged` listener from the Firebase Auth SDK. This is a callback
 *     function that Firebase calls *automatically* whenever a user logs in, logs out,
 *     or when the app first loads and their session is restored. It stores this user
 *     status (and loading state) in its own internal state.
 *
 * 3.  **Provides Data:** It puts all this information (the service handles and the user's
 *     auth status) into the "Context". This makes the data available to any other
 *     component in the app that wants to use it, via the custom hooks also defined
 *     in this file (`useFirebase`, `useUser`, `useAuth`, etc.).
 *
 * C-like Analogy:
 * Think of this as creating and managing a global `g_app_state` struct.
 * ```c
 * struct AppState {
 *   FirebaseServices* services;
 *   User* current_user;
 *   bool is_loading_user;
 * };
 *
 * AppState g_app_state;
 *
 * void on_auth_state_changed_callback(User* user) {
 *   // This callback is registered with the auth library.
 *   g_app_state.current_user = user;
 *   g_app_state.is_loading_user = false;
 *   // In React, this would trigger a re-render of the UI.
 * }
 * ```
 * The provider makes `g_app_state` accessible to the rest of the application in a structured way.
 */
'use client';

import React, {
  DependencyList,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * The props for the main provider component.
 * @interface FirebaseProviderProps
 */
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * The structure for holding the user's authentication state.
 * @interface UserAuthState
 */
interface UserAuthState {
  user: User | null; // Pointer to the User object, or NULL.
  isUserLoading: boolean; // True while we're waiting for the first auth check.
  userError: Error | null; // Any error from the auth listener.
}

/**
 * The main struct that defines all the data our Context will provide.
 * @interface FirebaseContextState
 */
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

/**
 * The return type of our `useFirebase()` hook.
 * @interface FirebaseServicesAndUser
 */
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * The return type of our `useUser()` hook, focused only on auth state.
 * @interface UserHookResult
 */
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// `createContext` is the React function that creates the actual context object.
// It's like declaring the global pointer: `FirebaseContextState* g_firebase_context = NULL;`
export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined,
);

/**
 * The main provider component. It manages and provides Firebase services and authentication state to its children.
 * @param {FirebaseProviderProps} props - The props for the component.
 * @returns {JSX.Element} The provider component wrapping its children.
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
    isUserLoading: true, // Start in a loading state until the first auth check completes.
    userError: null,
  });

  // `useEffect` is for side effects. Subscribing to an external service like Firebase Auth is a side effect.
  useEffect(() => {
    if (!auth) {
      setUserAuthState({
        user: null,
        isUserLoading: false,
        userError: new Error('Auth service not provided.'),
      });
      return;
    }

    // Reset state when the auth instance changes (this is rare but good practice).
    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    // This is the core of auth management. `onAuthStateChanged` registers a callback.
    // Firebase will call this function whenever the user's login state changes.
    const unsubscribe = onAuthStateChanged(
      auth,
      // 1. Success Callback: Called on initial load, login, and logout.
      (firebaseUser) => {
        // We received an update from Firebase. `firebaseUser` is either a User object or null.
        // Update our state. React will then re-render any components that use this state.
        setUserAuthState({
          user: firebaseUser,
          isUserLoading: false,
          userError: null,
        });
      },
      // 2. Error Callback: Called if the listener itself fails.
      (error) => {
        console.error('FirebaseProvider: onAuthStateChanged error:', error);
        setUserAuthState({
          user: null,
          isUserLoading: false,
          userError: error,
        });
      },
    );

    // Return the `unsubscribe` function. React will call this when the component is removed
    // from the screen, which cleans up the listener and prevents memory leaks. It's like `free()`.
    return () => unsubscribe();
  }, [auth]); // Dependency array: Re-run this effect only if the `auth` object itself changes.

  // `useMemo` is an optimization. It ensures the `contextValue` object is only
  // recreated when its contents actually change. This prevents unnecessary re-renders in child components.
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
  // Any component rendered as `{children}` can now access `contextValue` via a `useContext` hook.
  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* This component listens for globally emitted errors and throws them for the dev overlay. */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * A custom hook that provides easy access to the data stored in our `FirebaseContext`.
 * @returns {FirebaseServicesAndUser} The full set of Firebase services and user data.
 * @throws {Error} If used outside of a `FirebaseProvider`.
 *
 * C-like Explanation: `FirebaseServicesAndUser* useFirebase()`
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  // `useContext` is the React hook that reads the value from the nearest Provider in the component tree.
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (
    !context.areServicesAvailable ||
    !context.firebaseApp ||
    !context.firestore ||
    !context.auth
  ) {
    throw new Error(
      'Firebase core services not available. Check FirebaseProvider props.',
    );
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/**
 * A convenience hook to access just the Firebase Auth instance.
 * @returns {Auth} The Firebase Auth instance.
 */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/**
 * A convenience hook to access just the Firestore instance.
 * @returns {Firestore} The Firestore instance.
 */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/**
 * A convenience hook to access just the Firebase App instance.
 * @returns {FirebaseApp} The Firebase App instance.
 */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// A helper type for the memoization hook below. It "tags" an object.
type MemoFirebase<T> = T & { __memo?: boolean };

/**
 * A specialized version of React's `useMemo` hook, designed to enforce best practices
 * for Firestore queries. It memoizes the value and "tags" it with a `__memo = true` property.
 * The `useCollection` hook checks for this tag to warn developers if they forget to memoize their queries.
 * @template T
 * @param {() => T} factory - The function that creates the value to be memoized (e.g., a Firestore query).
 * @param {DependencyList} deps - The dependency array for the `useMemo` hook.
 * @returns {T | MemoFirebase<T>} The memoized value.
 */
export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList,
): T | MemoFirebase<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) return memoized;

  // Add our special tag to the memoized object.
  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}

/**
 * A custom hook for components that *only* care about the user's authentication status.
 * @returns {UserHookResult} An object with just the user's auth state.
 *
 * C-like Explanation: `UserHookResult* useUser()`
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook.
  return { user, isUserLoading, userError };
};
