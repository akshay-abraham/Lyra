// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Firebase Client-Side Provider (`client-provider.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file provides a critical "wrapper" component that ensures Firebase is
 * initialized only *once* on the client-side (in the browser). This is essential
 * for preventing errors and unnecessary re-initializations that can occur in modern
 * web apps due to component re-rendering.
 *
 * C-like Analogy:
 * In a C program, you might have an `init_database()` function that you must call
 * *only once* at the start of your `main()` function. If you call it multiple times,
 * you might get errors or create multiple, wasteful connections. This component,
 * `<FirebaseClientProvider>`, serves that exact purpose for Firebase.
 *
 * It uses a React "hook" called `useMemo`. Think of `useMemo` as a way to say:
 * "Run this expensive function (like `initializeFirebase`) only once, and then
 * cache the result. For all future renders, just give me the cached result." This
 * pattern is a cornerstone of performant React applications.
 *
 * This component takes the initialized Firebase services (the app connection,
 * the auth service, etc.) and passes them into the main `<FirebaseProvider>`, which
 * in turn makes them available to the rest of the application via context.
 */
'use client';

// Import necessary components from React and other Firebase files.
import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

/**
 * The properties (arguments) for the `FirebaseClientProvider` component.
 * @typedef {object} FirebaseClientProviderProps
 * @property {ReactNode} children - The rest of the application components to be rendered inside this provider.
 */
interface FirebaseClientProviderProps {
  children: ReactNode; // `ReactNode` is a generic type for any renderable element in React.
}

/**
 * A client-side component that ensures Firebase is initialized only once.
 *
 * @param {FirebaseClientProviderProps} props - A props object containing the `children` to render.
 * @returns {JSX.Element} The main FirebaseProvider wrapping the application.
 *
 * C-like Explanation: `function FirebaseClientProvider(props) -> returns JSX_Element`
 *
 * PSEUDOCODE:
 * ```c
 * // A global pointer to our services, initialized to NULL.
 * global_firebase_services = NULL;
 *
 * function FirebaseClientProvider(props):
 *
 *   // The `useMemo` hook is like a cached initialization.
 *   if (global_firebase_services == NULL) {
 *     // If we haven't initialized yet...
 *     printf("Initializing Firebase for the first time on the client...");
 *     // ...call the init function and store the result.
 *     global_firebase_services = initializeFirebase();
 *   }
 *
 *   // Now, `global_firebase_services` holds our connection info.
 *   // We pass this info down to the main FirebaseProvider, which will make it
 *   // available to all its children (the rest of the app).
 *
 *   return (
 *     <FirebaseProvider services={global_firebase_services}>
 *       {props.children} // Render the rest of the application.
 *     </FirebaseProvider>
 *   );
 * ```
 */
export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  if (typeof window === 'undefined') {
    return (
      <FirebaseProvider firebaseApp={null} auth={null} firestore={null}>
        {children}
      </FirebaseProvider>
    );
  }

  // `useMemo` ensures that `initializeFirebase()` is called only ONCE per application lifecycle on the client.
  // The empty dependency array `[]` at the end is the key; it tells React "never re-run this function,
  // just keep the first result forever".
  const firebaseServices = useMemo(() => {
    // This function will only be executed on the client-side when the app first loads.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Render the main FirebaseProvider, passing the now-initialized services to it as props.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {/* All other components in the app will be rendered here as `children`. */}
      {children}
    </FirebaseProvider>
  );
}
