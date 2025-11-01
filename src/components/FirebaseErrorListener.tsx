// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Global Firebase Error Listener (`FirebaseErrorListener.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines an "invisible" component that acts as a global error handler,
 * specifically for Firebase permission errors. It subscribes to a custom global
 * event and, when it catches an error, displays it in a custom, developer-friendly
 * dialog instead of letting it crash the app or show a generic overlay.
 *
 * How it works:
 * 1.  It subscribes to a global event named 'permission-error'.
 * 2.  It doesn't render any visible UI itself by default.
 * 3.  When it "hears" a 'permission-error' event, it captures the error object in its
 *     state, which triggers a re-render.
 * 4.  On re-render, it passes the error object to the `FirestoreErrorDialog`,
 *     which displays the detailed, friendly modal.
 *
 * This component is crucial for our debugging strategy, transforming silent,
 * background permission errors into visible, actionable feedback for the developer.
 */
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FirestoreErrorDialog } from '@/components/dev/FirestoreErrorDialog';

/**
 * An invisible component that listens for globally emitted 'permission-error' events
 * and displays them in a custom dialog.
 *
 * @returns {JSX.Element} The rendered dialog component when an error is present.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Set the error in state to trigger a re-render and show the dialog.
      setError(error);
    };

    // Subscribe to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on component unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  const handleClose = () => {
    setError(null);
  };

  // The component itself just renders the dialog, which is only visible when `error` is not null.
  return <FirestoreErrorDialog error={error} onClose={handleClose} />;
}
