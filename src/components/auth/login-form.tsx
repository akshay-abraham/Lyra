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
import { GoogleLogo } from './google-logo';

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
 */
export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

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
    <Card
      className='w-full max-w-sm border-0 bg-white/10 text-white backdrop-blur-md animate-fade-in-up'
      style={{ animationDelay: '0.4s' }}
    >
      <CardHeader className='text-center'>
        <CardTitle className='font-headline text-2xl'>Get Started</CardTitle>
        <CardDescription className='text-gray-300'>
          Sign in with your Google account to begin your learning journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant='outline'
          className='w-full h-12 text-base bg-white/90 text-black hover:bg-white transition-all duration-300 transform hover:scale-105'
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-6 w-6 animate-spin' />
          ) : (
            <GoogleLogo className='mr-3 h-6 w-6' />
          )}
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
