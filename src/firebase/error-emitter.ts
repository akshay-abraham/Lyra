// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Global Error Emitter (`error-emitter.ts`)
 *
 * C-like Analogy:
 * This file implements a classic "Publisher-Subscriber" (or "Observer") pattern.
 * It creates a global event handling system.
 *
 * Imagine in C you want to notify different parts of your program when a specific
 * error happens, without them being directly coupled. You could create a system with
 * function pointers:
 *
 * // 1. A struct to hold a list of callbacks (function pointers).
 * typedef struct {
 *   void (*callbacks[10])(PermissionError* error);
 *   int count;
 * } ErrorListener;
 *
 * ErrorListener g_permission_error_listener;
 *
 * // 2. A function to register a new callback.
 * void registerPermissionErrorCallback(void (*callback)(PermissionError* error)) {
 *   g_permission_error_listener.callbacks[g_permission_error_listener.count++] = callback;
 * }
 *
 * // 3. A function to trigger (emit) the event.
 * void emitPermissionError(PermissionError* error) {
 *   for (int i = 0; i < g_permission_error_listener.count; i++) {
 *     // Call every registered function.
 *     g_permission_error_listener.callbacks[i](error);
 *   }
 * }
 *
 * This TypeScript file creates a generic and type-safe version of that exact system.
 *
 * - `createEventEmitter()`: A factory function that builds the event system.
 * - `on(eventName, callback)`: Equivalent to `registerPermissionErrorCallback`. It adds a callback to a list for a specific event.
 * - `off(eventName, callback)`: Unregisters a callback.
 * - `emit(eventName, data)`: Equivalent to `emitPermissionError`. It triggers all registered callbacks for an event, passing them the data.
 *
 * The `errorEmitter` instance is a "singleton" — a single, global instance used by the entire application.
 */
'use client'
import { FirestorePermissionError } from '@/firebase/errors'

/**
 * C-like Analogy: `typedef enum` or a set of `#define` constants.
 *
 * This interface defines all the possible events that can be emitted.
 * It maps the event name (as a string) to the type of data that will be sent
 * with that event. This provides type safety, ensuring you can't accidentally
 * send the wrong kind of data for an event.
 *
 * Here, we only have one event: 'permission-error', which sends a `FirestorePermissionError` object.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError
}

// C-like Analogy: `typedef void (*Callback)(T data);`
// This is a generic type for a callback function that takes one argument of type T.
type Callback<T> = (data: T) => void

/**
 * A strongly-typed pub/sub event emitter.
 * It uses a generic type T that extends a record of event names to payload types.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // The `events` object is like a hash map or dictionary.
  // The keys are event names (e.g., "permission-error").
  // The values are arrays of callback functions (`Callback<T[K]>[]`).
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {}

  return {
    /**
     * Subscribe to an event. (Register a callback)
     * @param eventName The name of the event (e.g., 'permission-error').
     * @param callback The function to call when the event is emitted.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      // If no one is listening to this event yet, create an empty array.
      if (!events[eventName]) {
        events[eventName] = []
      }
      // Add the new callback to the array for this event.
      events[eventName]?.push(callback)
    },

    /**
     * Unsubscribe from an event. (Remove a callback)
     * @param eventName The name of the event.
     * @param callback The specific callback function to remove.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return // Nothing to remove.
      }
      // Filter the array, keeping only the callbacks that are NOT the one we want to remove.
      events[eventName] = events[eventName]?.filter((cb) => cb !== callback)
    },

    /**
     * Publish an event to all subscribers. (Trigger all callbacks)
     * @param eventName The name of the event to emit.
     * @param data The data payload that corresponds to the event's type.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return // No one is listening.
      }
      // Loop through all registered callbacks for this event and call each one with the data.
      events[eventName]?.forEach((callback) => callback(data))
    },
  }
}

// Create and export a singleton instance of the emitter, typed with our AppEvents interface.
// This `errorEmitter` is the global object that other parts of the app will import and use.
export const errorEmitter = createEventEmitter<AppEvents>()
