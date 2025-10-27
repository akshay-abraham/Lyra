// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Global Firebase Error Listener (`FirebaseErrorListener.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines an "invisible" component that acts as a global error handler,
 * specifically for Firebase permission errors. It subscribes to a custom global
 * event and, when it catches an error, throws it in a way that Next.js can
 * intercept to display a helpful development overlay.
 *
 * C-like Analogy:
 * Think of this component as a global "interrupt service routine" (ISR) for a specific
 * type of error. In a C program, you might register a callback function to handle
 * a particular hardware interrupt. This component does the same for a software event.
 *
 * How it works:
 * 1.  It subscribes to a global event named 'permission-error', which is emitted by
 *     our custom `errorEmitter` (defined in `src/firebase/error-emitter.ts`).
 * 2.  It doesn't render any visible UI itself; it's a purely functional component.
 * 3.  When it "hears" a 'permission-error' event, it takes the `FirestorePermissionError`
 *     object it receives and immediately `throw`s it.
 * 4.  In a Next.js development environment, throwing an error from a Client Component
 *     in this way is caught by Next.js's built-in "Error Boundary". This is what
 *     displays the detailed error overlay on the screen, showing the error message,
 *     the structured request data, and the component call stack.
 *
 * This component is crucial for our debugging strategy. It bridges the gap between a
 * failed, non-blocking Firestore operation (which happens quietly in the background)
 * and a visible, actionable error message for the developer, making it much easier
 * to debug Firestore Security Rules.
 */
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by the nearest Next.js error boundary.
 *
 * @returns {null} This component renders nothing.
 *
 * C-like Explanation: `function FirebaseErrorListener() -> returns NULL`
 *
 * This function defines the component.
 *
 * Internal State (Global Variables for this function):
 *   - `error`: A pointer to a `FirestorePermissionError` object, or NULL. `useState`
 *     is used so that when we set this variable, the component re-renders, allowing
 *     us to throw the error in the render cycle.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useEffect`: This is like registering a callback to run when the component
 *     is first created (mounted). Here, it's used to set up the subscription to our
 *     global error event emitter. It also returns a "cleanup function" that acts
 *     like a destructor to unsubscribe and prevent memory leaks.
 */
export function FirebaseErrorListener() {
  // `useState` creates a state variable. `error` holds the value, `setError` is the function to change it.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  // `useEffect` runs side effects. Subscribing to an external event is a side effect.
  useEffect(() => {
    // C-like pseudocode:
    //
    // void onComponentMount() {
    //   // Define the function that will be called when an error occurs.
    //   void handleErrorCallback(FirestorePermissionError* err) {
    //     // Update our state variable to hold the error.
    //     // This will cause the component to re-render.
    //     setError(err);
    //   }
    //
    //   // Register our `handleErrorCallback` function to listen for 'permission-error' events.
    //   errorEmitter.register('permission-error', handleErrorCallback);
    //
    //   // Return a cleanup function. This is like a destructor.
    //   // It runs when the component is removed from the screen.
    //   return () => {
    //     // Unregister the callback to prevent memory leaks.
    //     errorEmitter.unregister('permission-error', handleErrorCallback);
    //   };
    // }

    const handleError = (error: FirestorePermissionError) => {
      // Set the error in state to trigger a re-render.
      setError(error);
    };

    // Subscribe to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on component unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []); // The empty `[]` means this effect runs only once when the component is first mounted.

  // This is the second part of the logic. After `setError` is called, the component
  // re-renders. On this new render, the `error` variable is no longer null.
  if (error) {
    // If an error exists in our state, we throw it.
    // In development, this triggers the Next.js error overlay.
    // In production, this would be caught by the nearest `error.tsx` Error Boundary.
    throw error;
  }

  // This component renders nothing to the screen. It's invisible.
  return null;
}
