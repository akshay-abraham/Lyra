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
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { ShieldAlert, Copy } from 'lucide-react';
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
      <AlertDialogContent className='max-w-3xl'>
        <AlertDialogHeader>
          <div className='flex items-center gap-4'>
            <div className='p-3 rounded-full bg-destructive/10 w-fit'>
              <ShieldAlert className='h-10 w-10 text-destructive' />
            </div>
            <div>
              <AlertDialogTitle className='font-headline text-2xl text-destructive'>
                Security Rule Blocked a Request!
              </AlertDialogTitle>
              <AlertDialogDescription>
                Don't worry, this is a good thing! It means your security rules
                are working. Here’s the request that was denied.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='mt-4 bg-destructive/5 p-4 rounded-lg border border-destructive/20 max-h-[50vh] overflow-y-auto'>
          <pre className='text-xs text-destructive-foreground whitespace-pre-wrap break-all'>
            <code>{JSON.stringify(error.request, null, 2)}</code>
          </pre>
        </div>

        <p className='text-sm text-muted-foreground mt-4'>
          Compare this request object to your Firestore rules (`firestore.rules`)
          to see why access was denied. This is a{' '}
          <strong className='gradient-text'>very, very large contribution</strong>{' '}
          to Lyra's security!
        </p>

        <AlertDialogFooter className='mt-6'>
          <Button
            variant='outline'
            className='border-primary/50 text-primary hover:bg-primary/10 hover:text-primary'
            onClick={handleCopy}
          >
            <Copy className='mr-2' />
            Copy Request Details
          </Button>
          <AlertDialogCancel onClick={onClose} asChild>
            <Button>Got it, thanks!</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
