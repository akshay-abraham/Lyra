// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Firebase Configuration (`config.ts`)
 *
 * C-like Analogy:
 * This file is the direct equivalent of a `config.h` or a `.properties` file.
 * Its sole purpose is to store hard-coded configuration values needed to connect
 * to a specific Firebase project.
 *
 * In C, you might have:
 *
 * #ifndef CONFIG_H
 * #define CONFIG_H
 *
 * #define FIREBASE_API_KEY "AIzaSyD..."
 * #define FIREBASE_PROJECT_ID "studio-1148187791-ff9d6"
 * // etc.
 *
 * #endif // CONFIG_H
 *
 * This TypeScript file does the same thing. It exports a constant object named
 * `firebaseConfig` which holds all the necessary keys and identifiers. These
 * values are provided by Firebase when you create a new web app in your project.
 *
 * This configuration is used as a fallback by `initializeFirebase()` if it
 * cannot find the automatic configuration provided by Firebase Hosting. This
 * is very common during local development.
 */

// `export const` makes the `firebaseConfig` object available to be imported by other files.
// It's a read-only, global-like constant for the project.
export const firebaseConfig = {
  projectId: 'studio-1148187791-ff9d6',
  appId: '1:702313910835:web:3bbc0cbe1759c742b5c946',
  apiKey: 'AIzaSyD50qDi7kGoshCTRZHshqAp9n4cUvHyrGU',
  authDomain: 'studio-1148187791-ff9d6.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '702313910835',
}
