// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Form Component (`login-form.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI and logic for the login screen. It's a self-contained
 * component responsible for:
 * 1.  Displaying input fields for email and password.
 * 2.  Handling user input and validating it against a schema.
 * 3.  Calling the Firebase authentication service on submission.
 * 4.  On success, fetching the user's role from Firestore and redirecting them
 *     to the appropriate dashboard (student or teacher).
 * 5.  Handling authentication errors and displaying user-friendly notifications.
 * 6.  Providing a link to the registration page.
 *
 * C-like Analogy:
 * Think of this as a self-contained module (`login_ui.c`) that handles the entire
 * login screen. It uses a library (`react-hook-form`) to manage the form state,
 * simplifying validation and data handling, much like using a GUI library in a
 * C application to avoid manual input management. It's responsible for a sequence
 * of operations: get input, validate, call auth service, fetch user data, and redirect.
 */
'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile } from '@/types';

/**
 * @typedef {z.infer<typeof formSchema>} FormData
 * @description A TypeScript type generated from the Zod schema for form data.
 *
 * C-like Analogy: `typedef struct { char email[...]; char password[...]; } FormData;`
 */
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'), // Just checks that it's not empty.
});
type FormData = z.infer<typeof formSchema>;

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
   * Handles the form submission event after validation passes. It orchestrates the
   * entire login sequence: authenticating with Firebase, fetching user profile data,
   * storing session info, and redirecting the user.
   *
   * @param {FormData} data - A struct-like object containing the user's email and password.
   */
  const handleLoginSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
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
          throw new Error('User profile not found. Please contact support.');
        }
      }
    } catch (error: any) {
      console.error('Firebase sign-in failed:', error);
      let description = 'An unexpected error occurred. Please try again.';

      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (
          errorCode === 'auth/user-not-found' ||
          errorCode === 'auth/wrong-password' ||
          errorCode === 'auth/invalid-credential'
        ) {
          description = 'Invalid email or password. Please try again.';
        }
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
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
          Welcome back to Lyra
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLoginSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Login <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </Form>
        <div className='mt-6 text-center text-sm'>
          <p className='text-muted-foreground'>Don't have an account?</p>
          <Link href='/register'>
            <Button variant='link' className='text-primary'>
              Create one here
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
