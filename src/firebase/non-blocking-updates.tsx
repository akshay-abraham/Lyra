/**
 * @fileoverview Non-Blocking Firestore Writes (`non-blocking-updates.tsx`)
 *
 * C-like Analogy:
 * This file provides helper functions for writing data to the Firestore database
 * in a "non-blocking" or "fire-and-forget" manner.
 *
 * Similar to the non-blocking login functions, these functions start a database
 * write operation (like creating, updating, or deleting a document) and then
 * return immediately, without waiting for the database to confirm that the
 * write was successful.
 *
 * This is useful for UI interactions where you want the app to feel instantaneous.
 * For example, when a user sends a chat message, we can call `addDocumentNonBlocking`.
 * The message appears in the UI instantly, even though it might take a few hundred
 * milliseconds for it to actually be saved to the database. This is called
* "optimistic UI".
 *
 * What about errors?
 * Each of these functions includes a `.catch()` block. This is the modern
 * JavaScript way of handling errors for asynchronous operations. If the database
 * write fails in the background (for example, due to a security rule violation),
 * the code inside the `.catch()` block is executed.
 *
 * Inside the `.catch()` block, we:
 * 1. Create a `FirestorePermissionError` (our custom error object from `errors.ts`).
 * 2. Use our global `errorEmitter` to broadcast this error to the rest of the application.
 *
 * This ensures that even though we're not waiting for the result, we still have a
 * robust way to handle failures when they occur.
 */
'use client';

import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * C-like Explanation: `void setDocumentNonBlocking(DocRef* docRef, void* data, SetOptions options)`
 *
 * Initiates a `setDoc` operation (create or overwrite a document).
 * This function is non-blocking. It returns immediately.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  // `setDoc` returns a "Promise", which represents a future result.
  // We attach an error handler to this Promise using `.catch()`.
  setDoc(docRef, data, options).catch(error => {
    // If an error occurs in the background, this code runs.
    // We create our detailed error object.
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // 'set' can be a create or update.
        requestResourceData: data,
      });
    // And emit it globally.
    errorEmitter.emit('permission-error', permissionError);
  });
  // Execution continues immediately after the setDoc call is initiated.
}


/**
 * C-like Explanation: `Promise<DocRef*> addDocumentNonBlocking(ColRef* colRef, void* data)`
 *
 * Initiates an `addDoc` operation (create a new document with an auto-generated ID).
 * This function is non-blocking.
 * The `addDoc` function itself returns a Promise that will eventually resolve with a
 * reference to the newly created document.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      // The error handling is the same as above.
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  // Return the promise. The caller could optionally wait for it, but the typical
  // use case in this app is "fire-and-forget".
  return promise;
}


/**
 * C-like Explanation: `void updateDocumentNonBlocking(DocRef* docRef, void* data)`
 *
 * Initiates an `updateDoc` operation (update fields in an existing document).
 * This function is non-blocking.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * C-like Explanation: `void deleteDocumentNonBlocking(DocRef* docRef)`
 *
 * Initiates a `deleteDoc` operation.
 * This function is non-blocking.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
