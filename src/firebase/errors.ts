// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Custom Firebase Permission Error (`errors.ts`)
 *
 * C-like Analogy:
 * This file defines a custom error type, `FirestorePermissionError`, which is like
 * creating a custom `struct` in C to hold detailed error information.
 *
 * When a standard library function in C fails, it often just returns `NULL` or sets a
 * global `errno` variable. This gives you a general idea of what went wrong (e.g., "file not found"),
 * but not much context.
 *
 * This custom error class is designed to solve that problem for Firestore permission errors.
 * Instead of just getting a generic "permission denied" message, `FirestorePermissionError`
 * captures a wealth of context about the *failed request itself*:
 *
 * 1.  **Who made the request?** (`request.auth`) - Information about the logged-in user.
 * 2.  **What were they trying to do?** (`request.method`) - e.g., 'get', 'list', 'create'.
 * 3.  **Where were they trying to do it?** (`request.path`) - The exact database path.
 * 4.  **What data were they trying to send?** (`request.resource.data`) - The new data for a 'create' or 'update'.
 *
 * This information is structured to perfectly match the `request` object that is available
 * when you write Firestore Security Rules. By creating an error that mirrors this structure,
 * we can provide a highly detailed error message that is extremely useful for debugging
 * those security rules.
 */
'use client';
import { getAuth, type User } from 'firebase/auth';

// C-like Analogy: `typedef struct { ... } SecurityRuleContext;`
// This struct holds the basic information about the failed Firestore operation.
type SecurityRuleContext = {
  path: string; // The database path (e.g., "users/user123/chats").
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any; // The data being sent with the request (for writes).
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

// C-like Analogy: The main struct for the simulated request.
interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null; // Info about the authenticated user.
  method: string;                  // The operation being performed.
  path: string;                    // The full path to the document/collection.
  resource?: {                     // The data included with the request.
    data: any;
  };
}

/**
 * C-like Explanation: `FirebaseAuthObject* buildAuthObject(User* currentUser)`
 *
 * This function takes a Firebase `User` object (from the client-side SDK) and
 * transforms it into a `FirebaseAuthObject`. The structure of `FirebaseAuthObject`
 * is designed to mimic the `request.auth` object available inside security rules.
 * This allows us to create a realistic simulation of the request context.
 *
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors `request.auth` in security rules, or `null`.
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
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
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
 * C-like Explanation: `SecurityRuleRequest buildRequestObject(SecurityRuleContext* context)`
 *
 * This function builds the complete, simulated request object. It combines the
 * operation context (path, method) with the user's authentication info.
 * It safely tries to get the current authenticated user.
 *
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object for debugging.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // This will catch errors if the Firebase app is not yet initialized.
    // In this case, we'll proceed without auth information, which is still useful.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * C-like Explanation: `char* buildErrorMessage(SecurityRuleRequest* requestObject)`
 *
 * This function formats the final error message string. It includes a human-readable
 * message and then a pretty-printed JSON string of the entire request object.
 *
 * @param requestObject The simulated request object.
 * @returns A string containing the full error message for display.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed to be consumed by an LLM for debugging.
 * In C++, this would be like `class FirestorePermissionError : public std::exception`.
 * In C, you might achieve something similar by having a function that returns a
 * struct containing both an error message string and the structured request data.
 */
export class FirestorePermissionError extends Error {
  // `public readonly request` is like a public member variable of a struct.
  public readonly request: SecurityRuleRequest;

  // The constructor, like `new_firestore_permission_error(context)`.
  constructor(context: SecurityRuleContext) {
    // 1. Build the detailed request object from the context.
    const requestObject = buildRequestObject(context);
    // 2. Build the formatted error message string.
    const errorMessage = buildErrorMessage(requestObject);
    // 3. Call the parent `Error` class's constructor with the message. `super()` is like `Error.new(errorMessage)`.
    super(errorMessage);
    // 4. Set the name of the error for identification.
    this.name = 'FirebaseError';
    // 5. Store the structured request object as a public property of this error instance.
    this.request = requestObject;
  }
}
