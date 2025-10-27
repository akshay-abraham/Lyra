// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Global Error Emitter (`error-emitter.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file implements a classic "Publisher-Subscriber" (or "Observer") pattern,
 * creating a simple, type-safe, global event handling system. This allows
 * different parts of the application to communicate without being directly coupled.
 * Specifically, it allows any component to "emit" a `permission-error` event, and
 * a central listener component (`FirebaseErrorListener`) can "subscribe" to this
 * event to handle it.
 *
 * C-like Analogy:
 * This system is like creating a generic event notification system using function pointers.
 *
 * ```c
 * // 1. Define a struct to hold a list of callbacks (function pointers).
 * typedef struct {
 *   void (*callbacks[10])(PermissionError* error);
 *   int count;
 * } ErrorListener;
 *
 * // 2. Create a global instance of this listener.
 * ErrorListener g_permission_error_listener;
 *
 * // 3. A function to register a new callback (subscribe).
 * void register_permission_error_callback(void (*callback)(PermissionError* error)) {
 *   g_permission_error_listener.callbacks[g_permission_error_listener.count++] = callback;
 * }
 *
 * // 4. A function to trigger the event (publish).
 * void emit_permission_error(PermissionError* error) {
 *   for (int i = 0; i < g_permission_error_listener.count; i++) {
 *     // Call every registered function with the error data.
 *     g_permission_error_listener.callbacks[i](error);
 *   }
 * }
 * ```
 * This TypeScript file creates a more generic and type-safe version of that exact system.
 * - `createEventEmitter()`: A factory function that builds the event system.
 * - `on(eventName, callback)`: Equivalent to `register_permission_error_callback`.
 * - `off(eventName, callback)`: Unregisters a callback.
 * - `emit(eventName, data)`: Equivalent to `emit_permission_error`.
 *
 * The `errorEmitter` instance is a "singleton" — a single, global instance used by the entire application.
 */
'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Defines all the possible events that can be emitted throughout the application.
 * It maps the event name (as a string) to the type of data that will be sent
 * with that event. This provides type safety, ensuring you can't accidentally
 * send the wrong kind of data for an event.
 *
 * C-like Analogy: `typedef enum` or a set of `#define` constants for event types.
 *
 * @interface AppEvents
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// C-like Analogy: `typedef void (*Callback)(T data);`
// This is a generic type for a callback function that takes one argument of type T.
type Callback<T> = (data: T) => void;

/**
 * Creates a strongly-typed pub/sub event emitter.
 * @returns An object with `on`, `off`, and `emit` methods.
 *
 * @template T - A record of event names to payload types.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // The `events` object is like a hash map or dictionary.
  // The keys are event names (e.g., "permission-error").
  // The values are arrays of callback functions (`Callback<T[K]>[]`).
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Subscribe to an event (i.e., register a callback).
     * @param {K} eventName - The name of the event (e.g., 'permission-error').
     * @param {Callback<T[K]>} callback - The function to call when the event is emitted.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      // If no one is listening to this event yet, create an empty array for its callbacks.
      if (!events[eventName]) {
        events[eventName] = [];
      }
      // Add the new callback to the array for this event.
      events[eventName]?.push(callback);
    },

    /**
     * Unsubscribe from an event (i.e., remove a callback).
     * @param {K} eventName - The name of the event.
     * @param {Callback<T[K]>} callback - The specific callback function to remove.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return; // Nothing to remove.
      }
      // Filter the array, keeping only the callbacks that are NOT the one we want to remove.
      events[eventName] = events[eventName]?.filter((cb) => cb !== callback);
    },

    /**
     * Publish an event to all subscribers (i.e., trigger all callbacks).
     * @param {K} eventName - The name of the event to emit.
     * @param {T[K]} data - The data payload that corresponds to the event's type.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return; // No one is listening.
      }
      // Loop through all registered callbacks for this event and call each one with the data.
      events[eventName]?.forEach((callback) => callback(data));
    },
  };
}

/**
 * The singleton instance of the emitter, typed with our `AppEvents` interface.
 * This `errorEmitter` is the global object that other parts of the app will
 * import and use to communicate permission errors.
 * @type {object}
 */
export const errorEmitter = createEventEmitter<AppEvents>();
