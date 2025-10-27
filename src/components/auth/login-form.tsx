// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Form Component (`login-form.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI and logic for the login screen. It has been simplified
 * to support Google Sign-In as the only authentication method.
 *
 * It is responsible for:
 * 1.  Displaying a "Sign in with Google" button.
 * 2.  Calling the Firebase authentication service on submission.
 * 3.  On success, fetching the user's role from Firestore and redirecting them
 *     to the appropriate dashboard (student or teacher).
 * 4.  If the user is new, it redirects them to the registration page to complete their profile.
 * 5.  Handling authentication errors and displaying user-friendly notifications.
 *
 * C-like Analogy:
 * Think of this as a self-contained module (`login_ui.c`) that handles the entire
 * login screen. It's responsible for a sequence of operations: wait for button click,
 * call auth service, fetch user data, and redirect.
 */
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile } from '@/types';

/**
 * An array of strings for the cycling description text in the header.
 * @const {string[]}
 */
const cyclingDescriptions = [
  'Step into a world of guided learning. Your AI Tutor awaits!',
  'The future of AI in education starts here.',
  'Customizable, ethical AI for your classroom.',
  'Empowering students, supporting teachers.',
];

/**
 * The main component function for the login form.
 *
 * @returns {JSX.Element} The JSX for the login form.
 *
 * C-like Analogy:
 * This is the main function for the login UI, managing its state and behavior.
 *
 * Internal State (Global Variables for this function):
 *   - `isSubmitting`: A boolean flag to show a loading spinner on the button.
 *   - `descriptionIndex`: An integer to track which description string is currently shown.
 */
export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionIndex, setDescriptionIndex] = useState(0);

  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  /**
   * This `useEffect` hook sets up an interval timer to cycle through the header descriptions.
   *
   * C-like Analogy:
   * This is like using `setInterval` in a C environment (if one existed) or setting
   * up a timer interrupt in an embedded system. It schedules a piece of code to run
   * repeatedly at a fixed interval. It also includes a "cleanup" function, which is
   * crucial for preventing memory leaks, similar to calling `free()` or `destroy_timer()`
   * when the component is no longer needed.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDescriptionIndex(
        (prevIndex) => (prevIndex + 1) % cyclingDescriptions.length,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handles the Google Sign-In process. It orchestrates the entire login/registration
   * sequence: authenticating with Firebase, checking for an existing profile, and
   * redirecting the user appropriately.
   */
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Existing user, log them in
        const userData = userDoc.data() as UserProfile;
        sessionStorage.setItem(
          'lyra-user-info',
          JSON.stringify({
            name: userData.name,
            role: userData.role,
            class: userData.class,
          }),
        );
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${userData.name}!`,
        });
        if (userData.role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
      } else {
        // New user, redirect to registration to complete profile
        sessionStorage.setItem(
          'lyra-google-pending-registration',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          }),
        );
        router.push('/register');
      }
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description:
          error.code === 'auth/popup-closed-by-user'
            ? 'The sign-in window was closed.'
            : 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up animate-colorful-border'>
      <CardHeader className='text-center'>
        <CardTitle
          className='font-headline text-3xl animate-fade-in-down gradient-text'
          style={{ animationDelay: '0.2s' }}
        >
          Welcome to Lyra
        </CardTitle>
        <CardDescription
          key={descriptionIndex}
          className='animate-fade-in-down transition-all duration-500'
          style={{ animationDelay: '0.3s' }}
        >
          {cyclingDescriptions[descriptionIndex]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant='outline'
          className='w-full h-12 text-base'
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          ) : (
            <svg
              className='mr-2 h-5 w-5'
              aria-hidden='true'
              focusable='false'
              data-prefix='fab'
              data-icon='google'
              role='img'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 488 512'
            >
              <path
                fill='currentColor'
                d='M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.5 174.4 57.9l-67.4 64.4C324.7 97.4 289.3 80 248 80c-81.9 0-148.6 66.7-148.6 148.6s66.7 148.6 148.6 148.6c95.6 0 131.3-64.4 135.2-97.4H248v-68.9h239.5c1.6 8.9 2.5 18.2 2.5 27.8z'
              ></path>
            </svg>
          )}
          Sign in with Google
        </Button>

        <p className='mt-6 text-center text-xs text-muted-foreground px-4'>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
}
