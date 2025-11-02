// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Firebase Configuration (`config.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a configuration store for connecting to a specific Firebase
 * project. It holds the essential credentials required by the Firebase SDK.
 *
 * C-like Analogy:
 * This file is the direct equivalent of a `config.h` header file or a `.properties`
 * file in a C/Java project. Its sole purpose is to store hard-coded configuration
 * values as constants.
 *
 * ```c
 * #ifndef CONFIG_H
 * #define CONFIG_H
 *
 * #define FIREBASE_API_KEY "AIzaSyD..."
 * #define FIREBASE_PROJECT_ID "my-firebase-project"
 * // etc.
 *
 * #endif // CONFIG_H
 * ```
 *
 * This TypeScript file achieves the same goal by exporting a constant object named
 * `firebaseConfig`. These values are provided by Firebase when you create a new
 * web app in your project console.
 *
 * This configuration is used by `initializeFirebase()` as a fallback if it cannot
 * find the automatic configuration provided by Firebase Hosting. This is a common
 * pattern for local development, where Hosting's environment variables aren't available.
 */

/**
 * The Firebase configuration object for your web app.
 *
 * These details are obtained from the Firebase console:
 * Project settings > General > Your apps > Web app > Firebase SDK snippet > Config.
 *
 * It is safe to expose these values in a client-side app. Firebase security is
 * handled by Firestore Security Rules, not by hiding these keys.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCAzNBsxoLOZEpDra6iGCYnOWzoip9xjOw",
  authDomain: "lyra-edu.firebaseapp.com",
  projectId: "lyra-edu",
  storageBucket: "lyra-edu.appspot.com",
  messagingSenderId: "363825260695",
  appId: "1:363825260695:web:4d137f5b2d97f6c05e61d2"
};
