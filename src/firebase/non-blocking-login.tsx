// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Non-Blocking Firebase Authentication (`non-blocking-login.tsx`)
 *
 * C-like Analogy:
 * This file provides helper functions for initiating Firebase authentication
 * operations (like sign-in or sign-up) in a "non-blocking" way.
 *
 * In traditional C programming, a function like `connect_to_server()` would often
 * "block" — the program would pause and wait until the connection is established
 * before moving to the next line of code.
 *
 * In modern user interfaces, blocking is undesirable because it freezes the UI.
 * These functions here are "non-blocking" or "asynchronous". When you call one,
 * it starts the authentication process in the background and returns *immediately*.
 * The program doesn't wait for the result.
 *
 * How does it get the result?
 * The Firebase Auth service uses a global listener (the `onAuthStateChanged` listener
 * set up in `provider.tsx`). When the background authentication process completes
 * (either successfully or with an error), Firebase notifies this listener. The
 * listener then updates the application's global state, and the UI reacts accordingly.
 *
 * So, the flow is:
 * 1. UI calls `initiateEmailSignIn(auth, email, pass)`.
 * 2. This function immediately returns. The UI can show a loading spinner.
 * 3. In the background, Firebase talks to its servers.
 * 4. A few moments later, Firebase finishes and triggers the global `onAuthStateChanged` listener.
 * 5. The listener receives the new user object (or an error).
 * 6. The listener updates the app's state, which causes the UI to re-render, showing
 *    the user's logged-in dashboard or an error message.
 *
 * CRITICAL: The comments in the code emphasize that you should NOT use `await` with
 * these functions if you want this non-blocking behavior. `await` would turn them
 * back into blocking functions.
 */
'use client';
import {
  Auth, // Import Auth type for type hinting.
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * C-like Explanation: `void initiateAnonymousSignIn(Auth* authInstance)`
 *
 * Initiates anonymous sign-in. This is a non-blocking call.
 * The function will return immediately, and the result will be handled by the
 * `onAuthStateChanged` listener elsewhere.
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use `await`.
  signInAnonymously(authInstance);
  // Code execution continues immediately.
}

/**
 * C-like Explanation: `void initiateEmailSignUp(Auth* authInstance, char* email, char* password)`
 *
 * Initiates email/password sign-up. This is a non-blocking call.
 */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use `await`.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Code execution continues immediately.
}

/**
 * C-like Explanation: `void initiateEmailSignIn(Auth* authInstance, char* email, char* password)`
 *
 * Initiates email/password sign-in. This is a non-blocking call.
 */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use `await`.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code execution continues immediately.
}
