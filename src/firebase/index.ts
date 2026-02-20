// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Main Firebase Entry Point (`index.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file acts as the central "public interface" for all Firebase-related
 * functionality in the application. It serves two main purposes:
 *
 * 1.  **Initialization:** It defines the primary `initializeFirebase()` function, which
 *     is responsible for setting up the connection to the Firebase backend. This
 *     function is designed to be idempotent (safe to call multiple times) and
 *     integrates with Firebase Hosting's automatic configuration.
 *
 * 2.  **Barrel Exporting:** It re-exports all the key functions, hooks, and types
 *     from the other files in this `firebase/` directory. This allows other parts of
 *     the application to import everything they need from a single, consistent location
 *     (e.g., `import { useUser, useCollection } from '@/firebase';`), rather than
 *     having to know the internal file structure.
 *
 * C-like Analogy:
 * This file is like the main `firebase.h` header file for your project. It includes
 * all the other necessary headers (`auth.h`, `firestore.h`, etc.) and provides
 * the main `firebase_init()` function. Any other C file that needs to use Firebase
 * functionality would just need to `#include "firebase.h"`.
 */
'use client';

import { firebaseConfig, getMissingFirebaseEnvVars } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes the Firebase app and returns SDK handles.
 * This function is idempotent; it checks if an app is already initialized before
 * creating a new one. It supports both automatic configuration via Firebase Hosting
 * and fallback manual configuration for local development.
 *
 * @returns {{ firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore }} An object containing the initialized Firebase services.
 *
 * C-like Explanation: `FirebaseServices* initializeFirebase()`
 *
 * This function is the primary entry point for setting up Firebase.
 *
 * It uses a check, `getApps().length`, to see if a Firebase app has already been
 * initialized. This is like checking if a global `g_firebase_initialized` flag is true.
 *
 * **IMPORTANT: Firebase App Hosting Integration**
 * The `try...catch` block is special. Firebase App Hosting can automatically provide
 * Firebase configuration via environment variables on the server. The `initializeApp()`
 * function (when called with no arguments) is designed to detect and use these variables.
 * - `try`: We first attempt to initialize using this automatic method. This is the
 *   preferred way for production environments.
 * - `catch`: If that fails (which is normal in a local development environment), we
 *   fall back to using the hard-coded `firebaseConfig` object from `config.ts`.
 */
// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // `getApps().length` checks if any Firebase app instance already exists.
  // C-like: `if (g_app_count == 0)`
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with it to provide the environment variables needed to populate the
    // FirebaseOptions in production. It is critical that we attempt this first.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables (for production).
      firebaseApp = initializeApp();
    } catch (e) {
      // This `catch` block will typically run during local development.
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development.
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e,
        );
      }

      const missingVars = getMissingFirebaseEnvVars();
      if (missingVars.length > 0) {
        throw new Error(
          `Firebase initialization failed. Missing environment variables: ${missingVars.join(', ')}. ` +
            'Add these in your hosting provider and .env.local.',
        );
      }

      // Initialize using the hard-coded config from `config.ts`.
      firebaseApp = initializeApp(firebaseConfig);
    }

    // Once the app is initialized, get the handles to the other services (Auth, Firestore).
    return getSdks(firebaseApp);
  }

  // If already initialized, just get the existing app instance and return the service handles.
  return getSdks(getApp());
}

/**
 * A helper function that takes an initialized `FirebaseApp` object and returns
 * handles to the various services like Authentication and Firestore.
 *
 * @param {FirebaseApp} firebaseApp - An initialized Firebase App object.
 * @returns An object containing handles to the Auth and Firestore services.
 *
 * C-like Explanation: `FirebaseServices* getSdks(FirebaseApp* firebaseApp)`
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

// This section uses `export * from ...` to re-export everything from the other
// files in this directory. This creates a clean public API for the `firebase` module.
// It's like having a master `firebase.h` that itself includes `auth.h`, `firestore.h`,
// `errors.h`, etc.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
