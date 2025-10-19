/**
 * @fileoverview Global Firebase Error Listener (`FirebaseErrorListener.tsx`)
 *
 * C-like Analogy:
 * This file defines an "invisible" component that acts like a global error handler
 * or an interrupt service routine (ISR) specifically for Firebase permission errors.
 * In a C program, you might set a global flag or call a specific function when a
 * critical error occurs. This component does something similar in a structured way.
 *
 * How it works:
 * 1.  It subscribes to a global event named 'permission-error' which is emitted by
 *     our custom `errorEmitter` (defined in `src/firebase/error-emitter.ts`).
 * 2.  It doesn't render any visible UI. It's a purely functional component.
 * 3.  When it "hears" a 'permission-error' event, it takes the error object it
 *     receives and immediately `throw`s it.
 * 4.  In Next.js, throwing an error from a component in this way will be caught by
 *     Next.js's built-in error handling mechanism (the "Error Boundary"). This is
 *     what displays the nice error overlay on the screen during development,
 *     showing the error details and call stack.
 *
 * This component is crucial for our debugging strategy. It bridges the gap between a
 * failed, non-blocking Firestore operation (which happens quietly in the background)
 * and a visible, actionable error message for the developer.
 */
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 *
 * C-like Explanation: `function FirebaseErrorListener() -> returns NULL`
 *
 * This function defines the component.
 *
 * Internal State (Global Variables for this function):
 *   - `error`: A pointer to a `FirestorePermissionError` object, or NULL. `useState`
 *     is used so that when we set this variable, the component re-renders.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useEffect`: This is like registering a callback to run when the component
 *     is first created. Here, it's used to set up the subscription to our global
 *     error event emitter.
 */
export function FirebaseErrorListener() {
  // `useState` creates a state variable. `error` holds the value, `setError` is the function to change it.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  // `useEffect` runs side effects. Subscribing to an event is a side effect.
  useEffect(() => {
    // C-like pseudocode:
    // void onComponentMount() {
    //   // Define the function that will be called when an error occurs.
    //   void handleError(FirestorePermissionError* err) {
    //     // Update our state variable to hold the error.
    //     // This will cause the component to re-render.
    //     setError(err);
    //   }
    //
    //   // Register our `handleError` function to listen for 'permission-error' events.
    //   errorEmitter.register('permission-error', handleError);
    //
    //   // Return a cleanup function. This is like a destructor.
    //   // It runs when the component is removed from the screen.
    //   return () => {
    //     // Unregister the callback to prevent memory leaks.
    //     errorEmitter.unregister('permission-error', handleError);
    //   };
    // }

    const handleError = (error: FirestorePermissionError) => {
      // Set error in state to trigger a re-render.
      setError(error);
    };

    // Subscribe to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []); // The empty `[]` means this effect runs only once, like `onComponentMount`.

  // This is the second part of the logic. After `setError` is called, the component
  // re-renders. On this new render, the `error` variable is no longer null.
  if (error) {
    // If an error exists in our state, we throw it.
    // This triggers the Next.js error boundary.
    throw error;
  }

  // This component renders nothing to the screen. It's invisible.
  return null;
}
