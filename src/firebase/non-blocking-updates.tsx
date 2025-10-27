// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Non-Blocking Firestore Write Operations (`non-blocking-updates.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file provides helper functions for writing data to the Firestore database
 * in a "non-blocking" or "fire-and-forget" manner. These functions are designed
 * to improve UI responsiveness by not waiting for the database to confirm a write.
 *
 * C-like Analogy:
 * In traditional blocking I/O, a function like `write_to_disk()` would pause the
 * program until the data is fully written. These functions are asynchronous, like
 * using a separate thread for I/O. When you call `addDocumentNonBlocking`, it's
 * like spawning a new thread to handle the database write and then immediately
 * continuing with the main program's execution.
 *
 * This is useful for "optimistic UI" updates. For example, when a user sends a chat
 * message, we can call `addDocumentNonBlocking`. The message appears in the UI
 * instantly, even though it might take a few hundred milliseconds for it to actually
 * be saved to the database.
 *
 * **Error Handling:**
 * What about errors? Each of these functions includes a `.catch()` block. This is the
 * modern JavaScript way of handling errors for asynchronous operations. If the database
 * write fails in the background (e.g., due to a security rule violation), the code
 * inside the `.catch()` block is executed. Inside this block, we:
 * 1. Create a detailed `FirestorePermissionError` (from `errors.ts`).
 * 2. Use our global `errorEmitter` to broadcast this error to the rest of the application,
 *    where it can be caught and displayed to the developer.
 *
 * This ensures that even though we're not waiting for the result, we still have a
 * robust way to handle and debug failures when they occur.
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
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates a `setDoc` operation (creates or overwrites a document) without blocking.
 *
 * @param {DocumentReference} docRef - A reference to the document to set.
 * @param {any} data - The data to write to the document.
 * @param {SetOptions} options - Options for the set operation (e.g., `{ merge: true }`).
 *
 * C-like Explanation: `void set_document_non_blocking(DocRef* doc_ref, void* data, SetOptions options)`
 */
export function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
  options: SetOptions,
) {
  // `setDoc` returns a "Promise", which represents a future result.
  // We attach an error handler to this Promise using `.catch()`.
  setDoc(docRef, data, options).catch((error) => {
    // If an error occurs in the background, this code runs.
    // We create our detailed, structured error object.
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'write', // 'set' can be a create or update, 'write' is a safe general term.
      requestResourceData: data,
    });
    // And emit it globally for our error listener to catch.
    errorEmitter.emit('permission-error', permissionError);
  });
  // Execution continues immediately after the setDoc call is initiated.
}

/**
 * Initiates an `addDoc` operation (creates a new document with an auto-generated ID) without blocking.
 *
 * @param {CollectionReference} colRef - A reference to the collection to add the document to.
 * @param {any} data - The data for the new document.
 * @returns {Promise<DocumentReference>} A Promise that resolves with a reference to the newly created document.
 *
 * C-like Explanation: `DocRef* add_document_non_blocking(ColRef* col_ref, void* data)`
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data).catch((error) => {
    // The error handling pattern is the same as above.
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      }),
    );
  });
  // Return the promise. The caller could optionally `await` it, but the typical
  // use case in this app is "fire-and-forget".
  return promise;
}

/**
 * Initiates an `updateDoc` operation (updates fields in an existing document) without blocking.
 *
 * @param {DocumentReference} docRef - A reference to the document to update.
 * @param {any} data - An object containing the fields and values to update.
 *
 * C-like Explanation: `void update_document_non_blocking(DocRef* doc_ref, void* data)`
 */
export function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
) {
  updateDoc(docRef, data).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      }),
    );
  });
}

/**
 * Initiates a `deleteDoc` operation without blocking.
 *
 * @param {DocumentReference} docRef - A reference to the document to delete.
 *
 * C-like Explanation: `void delete_document_non_blocking(DocRef* doc_ref)`
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      }),
    );
  });
}
