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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { GoogleLogo } from './google-logo';

/**
 * The main component function for the login form.
 *
 * @returns {JSX.Element} The JSX for the login form.
 *
 * @description
 * This component's main job is to display the Google Sign-In button and handle the
 * authentication flow when the button is clicked. It uses `useState` to manage a
 * loading state (`isSubmitting`) to provide visual feedback to the user.
 *
 * C-like Analogy:
 * This is the main function for the login UI, managing its state and behavior.
 *
 * Internal State (Global Variables for this function):
 *   - `isSubmitting`: A boolean flag to show a loading spinner on the button.
 */
export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles the Google Sign-In process.
   *
   * @description
   * This function orchestrates the entire login/registration sequence: authenticating
   * with Firebase, checking for an existing profile, and redirecting the user appropriately.
   * It's an `async` function, allowing it to use `await` to handle the asynchronous
   * nature of network requests to Firebase.
   */
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      // 1. `signInWithPopup` opens the Google login window. We `await` its result.
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Look for an existing user profile document in Firestore using the user's unique ID.
      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // 3a. If the document exists, the user is returning.
        const userData = userDoc.data() as UserProfile;
        // Store essential info in `sessionStorage` for quick access on other pages.
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
        // Redirect to the correct dashboard based on their role.
        if (userData.role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/chat');
        }
      } else {
        // 3b. If no document exists, this is a new user.
        // Store their Google account info in `sessionStorage` and redirect to the registration page.
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
      // 4. Handle any errors during the process.
      console.error('Google sign-in failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: 'Sign-In Canceled',
          description: 'You can sign in with Google at any time.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: 'Could not sign in with Google. Please try again.',
        });
      }
    } finally {
      // 5. Always stop the loading spinner, whether success or failure.
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className='w-full max-w-sm animate-fade-in-up'
      style={{ animationDelay: '0.4s' }}
    >
      <div className='flex flex-col items-center space-y-4'>
        <h2 className='text-2xl font-headline font-semibold text-foreground'>
          Get Started with Lyra
        </h2>
        <Button
          variant='outline'
          className='w-full h-14 text-lg bg-white/95 text-black hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/20'
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-6 w-6 animate-spin' />
          ) : (
            <GoogleLogo className='mr-3 h-7 w-7' />
          )}
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
