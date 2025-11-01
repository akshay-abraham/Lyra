// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview A custom, developer-friendly dialog for displaying Firestore permission errors.
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This component renders a modal dialog designed to make debugging Firestore Security Rules
 * much easier and more pleasant. It takes a `FirestorePermissionError` object and displays
 * the structured request data in a clear, formatted way, with a fun and helpful tone.
 */
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { Copy, ShieldAlert } from 'lucide-react';
import React from 'react';

interface FirestoreErrorDialogProps {
  error: FirestorePermissionError | null;
  onClose: () => void;
}

export function FirestoreErrorDialog({
  error,
  onClose,
}: FirestoreErrorDialogProps) {
  const { toast } = useToast();

  if (!error) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(error.request, null, 2));
    toast({
      title: 'Copied to Clipboard!',
      description: 'The request details are ready to be pasted.',
    });
  };

  return (
    <AlertDialog open={!!error} onOpenChange={onClose}>
      <AlertDialogContent className='max-w-3xl bg-destructive/5 border-destructive/20'>
        <AlertDialogHeader className='text-center'>
          <div className='mx-auto bg-destructive/10 p-4 rounded-full w-fit'>
            <ShieldAlert className='h-12 w-12 text-destructive' />
          </div>
          <AlertDialogTitle className='font-headline text-3xl text-destructive mt-4'>
            Security Rule Stop!
          </AlertDialogTitle>
          <AlertDialogDescription className='text-muted-foreground'>
            Excellent! Your security rules just did their job and blocked a
            request. This is a good thing! Below are the details.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='mt-4 bg-destructive/10 p-4 rounded-lg border border-destructive/20 max-h-[40vh] overflow-y-auto'>
          <pre className='text-xs text-destructive-foreground whitespace-pre-wrap break-all'>
            <code>{JSON.stringify(error.request, null, 2)}</code>
          </pre>
        </div>

        <p className='text-sm text-foreground font-medium text-center mt-4'>
          Debugging this makes a{' '}
          <strong className='gradient-text'> very, very large contribution </strong>{' '}
          to Lyra's security. Compare this request to `firestore.rules`.
        </p>

        <AlertDialogFooter className='mt-6 gap-2 sm:gap-0'>
          <Button
            variant='outline'
            className='border-primary/50 text-primary hover:bg-primary/10 hover:text-primary'
            onClick={handleCopy}
          >
            <Copy className='mr-2' />
            Copy Request
          </Button>
          <Button onClick={onClose}>Got it, I'm on it!</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
