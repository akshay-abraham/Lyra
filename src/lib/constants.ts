// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Application-wide Constants (`constants.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a centralized repository for hard-coded constant values that are
 * used throughout the application. This practice is crucial for maintainability and
 * reducing "magic strings" (hard-coded strings scattered in the code).
 *
 * By defining constants here, we can:
 * - Avoid typos by using autocomplete in the IDE.
 * - Easily update a value in one place and have it propagate everywhere.
 * - Understand the data model of the application at a glance.
 *
 * C-like Analogy:
 * This file is the direct equivalent of a `constants.h` header file.
 *
 * ```c
 * #ifndef CONSTANTS_H
 * #define CONSTANTS_H
 *
 * // Firestore Collection Names
 * #define COLLECTION_USERS "users"
 * #define COLLECTION_CHAT_SESSIONS "chatSessions"
 *
 * // Firestore Field Names
 * #define FIELD_ROLE "role"
 * #define FIELD_USER_ID "userId"
 *
 * #endif // CONSTANTS_H
 * ```
 */

/**
 * A frozen object containing the names of all Firestore collections.
 * Using `as const` makes the object and its properties read-only.
 * `Object.freeze` provides runtime immutability.
 * @readonly
 */
export const COLLECTIONS = Object.freeze({
  USERS: 'users',
  CHAT_SESSIONS: 'chatSessions',
  MESSAGES: 'messages',
  TEACHER_SETTINGS: 'teacherSettings',
});

/**
* A frozen object containing the names of common Firestore document fields.
* This helps prevent typos when writing queries or updating documents.
 * @readonly
 */
export const FIELDS = Object.freeze({
  ROLE: 'role',
  USER_ID: 'userId',
  SCHOOL: 'school',
  CLASSES_TAUGHT: 'classesTaught',
  START_TIME: 'startTime',
});
