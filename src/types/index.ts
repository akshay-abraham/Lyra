// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Centralized Type Definitions (`index.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a single source of truth for all common TypeScript types,
 * interfaces, and enums used across the application. Centralizing type definitions
 * is a crucial practice for creating maintainable, scalable, and type-safe code.
 *
 * Benefits:
 * - **Consistency:** Ensures that a `UserProfile` or `Message` means the same
 *   thing everywhere in the app.
 * - **Maintainability:** If a data structure changes (e.g., adding a new field to
 *   `UserProfile`), it only needs to be updated in this one file.
 * - **Readability:** Provides a quick reference for understanding the application's
 *   data model.
 *
 * C-like Analogy:
 * This file is the equivalent of a master `types.h` header file in a C project.
 *
 * ```c
 * #ifndef TYPES_H
 * #define TYPES_H
 *
 * // Define user roles with an enum for type safety.
 * typedef enum {
 *   ROLE_STUDENT,
 *   ROLE_TEACHER
 * } UserRole;
 *
 * // Define the structure for a user profile.
 * typedef struct {
 *   char* uid;
 *   char* name;
 *   char* email;
 *   UserRole role;
 *   // ... other fields
 * } UserProfile;
 *
 * // Define the structure for a chat message.
 * typedef struct {
 *   char* id;
 *   char* role; // "user" or "assistant"
 *   char* content;
 * } Message;
 *
 * #endif // TYPES_H
 * ```
 */

import { FieldValue } from 'firebase/firestore';

/**
 * Defines the possible roles a user can have in the application.
 * @enum {string}
 */
export type UserRole = 'student' | 'teacher';

/**
 * Defines the school a user can belong to.
 * @enum {string}
 */
export type School = 'Girideepam Bethany Central School';

/**
 * Represents the structure of a user's profile document in Firestore.
 * @interface UserProfile
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  school: School;
  createdAt: FieldValue;
  // Student-specific fields
  class?: string;
  // Teacher-specific fields
  classesTaught?: string[];
  subjectsTaught?: string[];
}

/**
 * Defines the possible roles in a chat conversation.
 * @enum {string}
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Represents a single message within a chat session.
 * @interface Message
 */
export interface Message {
  id?: string; // Optional because it's assigned by Firestore
  role: MessageRole;
  content: string;
  createdAt?: FieldValue; // Optional for client-side representation
}

/**
 * Represents a chat session document in Firestore.
 * @interface ChatSession
 */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  subject: string;
  model?: string;
  startTime: FieldValue;
}

/**
 * Represents a teacher's custom AI settings document in Firestore.
 * @interface TeacherSettings
 */
export interface TeacherSettings {
  teacherId: string;
  subject: string;
  systemPrompt: string;
  exampleAnswers: string[];
}
