// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Non-Blocking Firebase Authentication (`non-blocking-login.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file provides helper functions for initiating Firebase authentication
 * operations (like sign-in or sign-up) in a "non-blocking" or "fire-and-forget" way.
 *
 * C-like Analogy:
 * In traditional C programming, a function like `connect_to_server()` would often
 * "block"—the program would pause and wait until the connection is established
 * before moving to the next line of code.
 *
 * In modern user interfaces, blocking is undesirable because it freezes the UI.
 * These functions here are "asynchronous" or non-blocking. When you call one,
 * it starts the authentication process in the background and returns *immediately*.
 * The program doesn't wait for the result.
 *
 * How does it get the result?
 * The Firebase Auth service uses a global listener (the `onAuthStateChanged` listener
 * set up in `provider.tsx`). When the background authentication process completes
 * (either successfully or with an error), Firebase notifies this listener. The
 * listener then updates the application's global state, and the UI reacts accordingly.
 *
 * The flow is:
 * 1. UI calls `initiateEmailSignIn(auth, email, pass)`.
 * 2. This function immediately returns. The UI can show a loading spinner.
 * 3. In the background, Firebase talks to its servers.
 * 4. A few moments later, Firebase finishes and triggers the global `onAuthStateChanged` listener.
 * 5. The listener receives the new user object (or an error).
 * 6. The listener updates the app's state, which causes the UI to re-render, showing
 *    the user's logged-in dashboard or an error message.
 *
 * CRITICAL: The comments in the code emphasize that you should NOT use `await` with
 * these functions if you want this non-blocking behavior. Using `await` would turn them
 * back into blocking functions, defeating their purpose in this context.
 */
'use client';
import {
  Auth, // Import Auth type for type hinting.
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Initiates an anonymous sign-in process.
 * This is a non-blocking call. The result will be handled by the global `onAuthStateChanged` listener.
 * @param {Auth} authInstance - The Firebase Auth instance.
 *
 * C-like Explanation: `void initiate_anonymous_sign_in(Auth* auth_instance)`
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use `await`.
  signInAnonymously(authInstance);
  // Code execution continues immediately.
}

/**
 * Initiates an email/password sign-up process.
 * This is a non-blocking call.
 * @param {Auth} authInstance - The Firebase Auth instance.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 *
 * C-like Explanation: `void initiate_email_sign_up(Auth* auth_instance, char* email, char* password)`
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
 * Initiates an email/password sign-in process.
 * This is a non-blocking call.
 * @param {Auth} authInstance - The Firebase Auth instance.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 *
 * C-like Explanation: `void initiate_email_sign_in(Auth* auth_instance, char* email, char* password)`
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
