// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Global Error Boundary (`error.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a custom, application-wide error boundary using the special
 * Next.js `error.tsx` convention. This component will automatically catch and
 * handle any unhandled runtime errors that occur within the `app` directory,
 * replacing a crashed page with a user-friendly and informative error screen.
 *
 * This implementation is designed to be both helpful for debugging and engaging
 * for the user, turning a negative experience into a constructive one.
 */
'use client'; // Error components must be Client Components.

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/lib/site-config';
import { Bomb, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

/**
 * The main component for displaying errors.
 *
 * @param {object} props - Props automatically provided by Next.js.
 * @param {Error & { digest?: string }} props.error - The error object that was thrown.
 * @param {() => void} props.reset - A function that attempts to re-render the component tree.
 * @returns {JSX.Element} The rendered error page UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error to the console for debugging purposes.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-background p-4'>
      <Card className='w-full max-w-2xl bg-destructive/5 border-destructive/20 text-center animate-scale-in'>
        <CardHeader>
          <div className='mx-auto bg-destructive/10 p-4 rounded-full w-fit'>
            <Bomb className='h-12 w-12 text-destructive' />
          </div>
          <CardTitle className='font-headline text-3xl text-destructive mt-4'>
            Houston, We Have a Glitch!
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <p className='text-muted-foreground'>
            Something went unexpectedly wrong. But don't worry, every bug we
            find is a star we can fix in our constellation.
          </p>

          {/* Display the actual error message for context */}
          <div className='text-left bg-destructive/10 p-3 rounded-md border border-destructive/20'>
            <p className='font-mono text-sm text-destructive break-words'>
              <strong>Error Message:</strong> {error.message}
            </p>
          </div>

          <p className='text-foreground font-medium'>
            You've discovered a rare cosmic anomaly! Reporting this makes a
            <strong className='gradient-text'> very, very large contribution </strong>
            to Lyra's stability.
          </p>

          {/* Call to action */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button
              onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
              }
              variant='outline'
              className='border-primary/50 text-primary hover:bg-primary/10 hover:text-primary'
            >
              <RefreshCw className='mr-2' />
              Try Again
            </Button>
            <Button asChild>
              <Link
                href={siteConfig.developer.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                Contact the Developer 🚀
              </Link>
            </Button>
          </div>
          <p className='text-xs text-muted-foreground pt-4'>
            Please send a screenshot or a description of what you were doing.
            Every bit of information helps!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
