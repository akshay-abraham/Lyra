// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Main Firebase Entry Point (`index.ts`)
 *
 * C-like Analogy:
 * This file is like the main `firebase.h` header file for your project.
 * Its purpose is to:
 * 1.  Define the main initialization function, `initializeFirebase()`, which is
 *     responsible for setting up the connection to the Firebase backend.
 * 2.  Export all the key functions, hooks, and types from the other files in this
 *     `firebase/` directory, so that other parts of the application can import
 *     them from a single, consistent location (e.g., `import { useUser } from '@/firebase';`).
 *
 * This acts as a "public interface" for the Firebase module, hiding the internal
 * file structure from the rest of the application.
 */
'use client'

import { firebaseConfig } from '@/firebase/config'
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * C-like Explanation: `FirebaseServices* initializeFirebase()`
 *
 * This function is the primary entry point for setting up Firebase. It's designed
 * to be "idempotent", meaning you can call it multiple times, but it will only
 * perform the actual initialization once.
 *
 * It uses a check, `getApps().length`, to see if a Firebase app has already been
 * initialized. This is like checking if a global `g_firebase_initialized` flag is true.
 *
 * IMPORTANT: Firebase App Hosting Integration
 * The `try...catch` block is special. Firebase App Hosting can automatically provide
 * Firebase configuration via environment variables on the server. The `initializeApp()`
 * function (when called with no arguments) is designed to detect and use these variables.
 * - `try`: We first attempt to initialize using this automatic method. This is the
 *   preferred way for production environments.
 * - `catch`: If that fails (which is normal in a local development environment), we
 *   fall back to using the hard-coded `firebaseConfig` object from `config.ts`.
 *
 * @returns A struct-like object containing the initialized Firebase services.
 */
// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // `getApps().length` checks if any Firebase app instance already exists.
  // C-like: `if (g_app_count == 0)`
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp
    try {
      // Attempt to initialize via Firebase App Hosting environment variables. This is for production.
      firebaseApp = initializeApp()
    } catch (e) {
      // This `catch` block will typically run during local development.
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development.
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e,
        )
      }
      // Initialize using the hard-coded config from `config.ts`.
      firebaseApp = initializeApp(firebaseConfig)
    }

    // Once the app is initialized, get the handles to the other services (Auth, Firestore).
    return getSdks(firebaseApp)
  }

  // If already initialized, just get the existing app instance and return the service handles.
  return getSdks(getApp())
}

/**
 * C-like Explanation: `FirebaseServices* getSdks(FirebaseApp* firebaseApp)`
 *
 * A helper function that takes an initialized `FirebaseApp` object and returns
 * handles to the various services like Authentication and Firestore.
 *
 * @param firebaseApp An initialized Firebase App object.
 * @returns An object containing handles to the Auth and Firestore services.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  }
}

// This section uses `export * from ...` to re-export everything from the other
// files in this directory. This makes them accessible to the rest of the app
// through a single import path, e.g., `import { useUser } from '@/firebase';`.
// It's like having a master `include "firebase.h"` that itself includes
// `auth.h`, `firestore.h`, `errors.h`, etc.
export * from './provider'
export * from './client-provider'
export * from './firestore/use-collection'
export * from './firestore/use-doc'
export * from './non-blocking-updates'
export * from './non-blocking-login'
export * from './errors'
export * from './error-emitter'
