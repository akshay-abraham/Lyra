/**
 * @fileoverview Firebase Client-Side Provider (`client-provider.tsx`)
 *
 * C-like Analogy:
 * This file provides a critical "wrapper" component for the client-side (the browser).
 * In a C program, you might have an `init_database()` function that you must call
 * *only once* at the start of your `main()` function. If you call it multiple times,
 * you might get errors or create multiple connections.
 *
 * This component, `<FirebaseClientProvider>`, serves that exact purpose for Firebase.
 * Because of how modern web apps can re-render parts of the screen, we need a way to
 * ensure that the `initializeFirebase()` function is called only once when the app
 * first loads in the browser.
 *
 * It uses a React "hook" called `useMemo`. Think of `useMemo` as a way to say:
 * "Run this expensive function (like `initializeFirebase`) only once, and then
 * cache the result. For all future renders, just give me the cached result."
 *
 * This component then takes the initialized Firebase services (the app connection,
 * the auth service, etc.) and passes them into the `<FirebaseProvider>`, which makes
* them available to the rest of the application.
 */
'use client';

// Import necessary components from React and other Firebase files.
import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

// This defines the "props" (properties/arguments) for our component.
// It's like the function signature in C: `FirebaseClientProvider(props)`.
// Here, `props` is a struct with one member: `children`.
interface FirebaseClientProviderProps {
  children: ReactNode; // `ReactNode` is a generic type for any renderable element.
}

/**
 * C-like Explanation: `function FirebaseClientProvider(props) -> returns JSX_Element`
 *
 * @param {FirebaseClientProviderProps} props - A struct containing the `children` to render.
 * `children` represents all the components that will be nested inside this provider.
 *
 * PSEUDOCODE:
 *
 * global_firebase_services = NULL; // A global pointer to our services.
 *
 * function FirebaseClientProvider(props):
 *
 *   // The `useMemo` hook is like a cached initialization.
 *   if (global_firebase_services == NULL) {
 *     // If we haven't initialized yet...
 *     print("Initializing Firebase for the first time on the client...");
 *     global_firebase_services = initializeFirebase(); // ...call the init function.
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
 *
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` ensures that `initializeFirebase()` is called only ONCE per component lifecycle.
  // The empty dependency array `[]` at the end is the key; it tells React "never re-run this,
  // just keep the first result forever".
  const firebaseServices = useMemo(() => {
    // This function will only be executed on the client-side when the app first loads.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Render the main FirebaseProvider, passing the now-initialized services to it.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {/* All other components in the app will be rendered here, as `children`. */}
      {children}
    </FirebaseProvider>
  );
}
