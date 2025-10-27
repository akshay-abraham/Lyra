// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Custom Firebase Permission Error (`errors.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a custom error type, `FirestorePermissionError`. This class is
 * designed to enrich the generic "permission denied" error from Firestore with
 * detailed, actionable context about the failed request.
 *
 * C-like Analogy:
 * When a standard library function in C fails, it often just returns `NULL` or sets a
 * global `errno` variable. This gives you a general idea of what went wrong (e.g.,
 * "file not found"), but not much context.
 *
 * This custom error class is like creating a much more detailed `struct` for errors.
 * Instead of just an error code, it captures a wealth of information about the
 * *failed request itself*:
 *
 * 1.  **Who made the request?** (`request.auth`) - Information about the logged-in user.
 * 2.  **What were they trying to do?** (`request.method`) - e.g., 'get', 'list', 'create'.
 * 3.  **Where were they trying to do it?** (`request.path`) - The exact database path.
 * 4.  **What data were they trying to send?** (`request.resource.data`) - The data for a 'create' or 'update'.
 *
 * This information is structured to perfectly mirror the `request` object that is available
 * when writing Firestore Security Rules. By creating an error that looks just like a
 * security rule request, we can provide a highly detailed error message that is
 * extremely useful for debugging those rules.
 */
'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * @typedef {object} SecurityRuleContext
 * @description Holds the basic information about the failed Firestore operation.
 * C-like Analogy: `typedef struct { ... } SecurityRuleContext;`
 * @property {string} path - The database path (e.g., "users/user123/chats").
 * @property {'get' | 'list' | 'create' | 'update' | 'delete' | 'write'} operation - The type of operation that failed.
 * @property {any} [requestResourceData] - The data being sent with the request (for writes).
 */
type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

// C-like Analogy: These are nested structs defining the shape of the `request.auth` object.
interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string; // The user's unique ID (UID).
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

/**
 * The main struct for the simulated request, mirroring the `request` object in security rules.
 * @interface SecurityRuleRequest
 */
interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null; // Info about the authenticated user.
  method: string; // The operation being performed.
  path: string; // The full path to the document/collection.
  resource?: {
    // The data included with the request for writes.
    data: any;
  };
}

/**
 * Transforms a Firebase `User` object from the client SDK into a `FirebaseAuthObject`
 * that mirrors the structure of `request.auth` available inside security rules.
 * This allows us to create a realistic simulation of the request context for debugging.
 *
 * @param {User | null} currentUser - The currently authenticated Firebase user.
 * @returns {FirebaseAuthObject | null} An object that mirrors `request.auth`, or `null`.
 *
 * C-like Explanation: `FirebaseAuthObject* build_auth_object_from_user(User* currentUser)`
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  // Manually construct the token object piece by piece from the user object.
  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce(
        (acc, p) => {
          if (p.providerId) {
            acc[p.providerId] = [p.uid];
          }
          return acc;
        },
        {} as Record<string, string[]>,
      ),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object. It combines the operation context
 * (path, method) with the user's authentication info.
 *
 * @param {SecurityRuleContext} context - The context of the failed Firestore operation.
 * @returns {SecurityRuleRequest} A structured request object for debugging.
 *
 * C-like Explanation: `SecurityRuleRequest* build_request_object(SecurityRuleContext* context)`
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user. This may fail if Firebase isn't initialized yet.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // This will catch errors if the Firebase app is not yet initialized. In this case,
    // we'll proceed without auth information, which is still useful for debugging.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData
      ? { data: context.requestResourceData }
      : undefined,
  };
}

/**
 * Formats the final error message string. It includes a human-readable
 * message and then a pretty-printed JSON string of the entire request object.
 *
 * @param {SecurityRuleRequest} requestObject - The simulated request object.
 * @returns {string} A string containing the full error message for display.
 *
 * C-like Explanation: `char* build_error_message(SecurityRuleRequest* requestObject)`
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed to be consumed for debugging security rules.
 * It extends the built-in `Error` class to include rich, structured data.
 *
 * C-like Analogy:
 * In C++, this would be `class FirestorePermissionError : public std::exception`.
 * In C, you might achieve something similar by having a function that returns a
 * struct containing both an error message string and the structured request data.
 */
export class FirestorePermissionError extends Error {
  /**
   * The structured request object that caused the error.
   * C-like: `public readonly request` is like a public member variable of a struct.
   * @type {SecurityRuleRequest}
   */
  public readonly request: SecurityRuleRequest;

  /**
   * The constructor for the custom error.
   * @param {SecurityRuleContext} context - The context of the failed operation.
   */
  constructor(context: SecurityRuleContext) {
    // 1. Build the detailed request object from the context.
    const requestObject = buildRequestObject(context);
    // 2. Build the formatted error message string.
    const errorMessage = buildErrorMessage(requestObject);
    // 3. Call the parent `Error` class's constructor with the message. `super()` is like `Error_constructor(errorMessage)`.
    super(errorMessage);
    // 4. Set the name of the error for easier identification.
    this.name = 'FirebaseError';
    // 5. Store the structured request object as a public property of this error instance.
    this.request = requestObject;
  }
}
