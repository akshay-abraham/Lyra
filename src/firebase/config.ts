// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Firebase Configuration (`config.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a configuration store for connecting to a specific Firebase
 * project. It reads its values from environment variables, which is a security best
 * practice to avoid hard-coding sensitive credentials in the source code.
 *
 * To use this, you must create a `.env.local` file in the root of your project
 * and populate it with the values from your Firebase project console.
 *
 * Example `.env.local` file:
 * NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
 * NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abcdef123
 */

/**
 * The Firebase configuration object for your web app.
 *
 * These details are read from environment variables, which should be defined
 * in a `.env.local` file for local development.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const requiredFirebaseEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

export function getMissingFirebaseEnvVars() {
  return requiredFirebaseEnvVars.filter((key) => !process.env[key]);
}
