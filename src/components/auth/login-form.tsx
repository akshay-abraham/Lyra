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
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile } from '@/types';

// Zod schema defines the structure and validation rules for the form data.
// It's like a C `struct` with attached validation logic.
// `typedef struct { char email[...]; char password[...]; } LoginFormStruct;`
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'), // Just checks that it's not empty.
});

// A TypeScript type generated from the Zod schema.
type FormData = z.infer<typeof formSchema>;

// An array of strings for the cycling description text in the header.
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
 * This is the main function for the login UI.
 *
 * Internal State (Global Variables for this function):
 *   - `isSubmitting`: A boolean flag to show a loading spinner on the button.
 *   - `descriptionIndex`: An integer to track which description string is currently shown.
 */
export function LoginForm() {
  // `useState` hook to manage simple state variables.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionIndex, setDescriptionIndex] = useState(0);

  // Get necessary services and utilities from custom hooks.
  const { auth, firestore } = useFirebase();
  const router = useRouter(); // For programmatic navigation.
  const { toast } = useToast(); // For showing pop-up notifications.

  // Initialize the form management with `react-hook-form`.
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema), // Link our validation schema.
    defaultValues: {
      // Set initial values for the form fields.
      email: '',
      password: '',
    },
  });

  // This `useEffect` hook sets up an interval timer to cycle through descriptions.
  useEffect(() => {
    // C-like pseudocode:
    // void onComponentMount() {
    //   // Set up a timer to call a function every 3000 milliseconds.
    //   timer_id = setInterval(() => {
    //     // Increment the index, and wrap around if it exceeds the array length.
    //     descriptionIndex = (descriptionIndex + 1) % array_length;
    //     // Update the component's state with the new index, causing a re-render.
    //     setDescriptionIndex(descriptionIndex);
    //   }, 3000);
    //
    //   // Return a "cleanup" function. This runs when the component is removed.
    //   return () => {
    //     // Stop the timer to prevent memory leaks.
    //     clearInterval(timer_id);
    //   };
    // }
    const interval = setInterval(() => {
      setDescriptionIndex(
        (prevIndex) => (prevIndex + 1) % cyclingDescriptions.length,
      );
    }, 3000); // Change text every 3 seconds.

    // Cleanup function to clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []); // The empty `[]` means this effect runs only once when the component mounts.

  /**
   * Handles the form submission event after validation passes.
   *
   * @param {FormData} data - A struct-like object (`FormData`) containing the user's email and password.
   *
   * C-like Analogy: This function is the callback that gets executed when the
   * user clicks the "Login" button and the form data is valid. It orchestrates
   * the entire login sequence.
   */
  const handleLoginSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Call the Firebase SDK function to sign in. This is an asynchronous network call.
      // `await` pauses the function here until Firebase responds with success or failure.
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;

      if (user) {
        // --- Login Successful ---
        // Fetch the user's profile from our Firestore 'users' collection to get their role.
        const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          // Store user's essential info in the browser's session storage for quick access
          // on other pages, avoiding repeated database reads for authorization checks.
          sessionStorage.setItem(
            'lyra-user-info',
            JSON.stringify({
              name: userData.name,
              role: userData.role,
              class: userData.class, // Store class for students
            }),
          );

          toast({
            title: 'Login Successful',
            description: `Welcome back, ${userData.name}!`,
          });

          // Redirect the user to the appropriate dashboard based on their role.
          if (userData.role === 'teacher') {
            router.push('/teacher');
          } else {
            router.push('/'); // Default to student chat page.
          }
        } else {
          // This is an edge case: the user exists in Firebase Auth but not in our Firestore db.
          // This could indicate an incomplete registration.
          throw new Error('User profile not found. Please contact support.');
        }
      }
    } catch (error) {
      // --- Login Failed ---
      console.error('Firebase sign-in failed:', error);
      let description = 'An unexpected error occurred. Please try again.';

      // Provide a more user-friendly error message for common authentication errors.
      if (error instanceof AuthError) {
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
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
      // This block runs whether the `try` or `catch` block was executed.
      setIsSubmitting(false); // Stop the loading spinner.
    }
  };

  // ========================== RETURN JSX (The View) ==========================
  // The rest of this file is JSX, which describes the component's visual structure.
  return (
    <Card className='w-full max-w-md shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up animate-colorful-border'>
      <CardHeader className='text-center'>
        <CardTitle
          className='font-headline text-3xl animate-fade-in-down gradient-text'
          style={{ animationDelay: '0.2s' }}
        >
          Welcome back to Lyra
        </CardTitle>
        {/*
          The `key={descriptionIndex}` is a React trick. When the key of a component changes,
          React destroys the old one and creates a new one from scratch. This allows our fade-in
          animation to re-trigger every time the description text changes.
        */}
        <CardDescription
          key={descriptionIndex}
          className='animate-fade-in-down transition-all duration-500'
          style={{ animationDelay: '0.3s' }}
        >
          {cyclingDescriptions[descriptionIndex]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/*
          The `<Form {...form}>` component is a "Provider". It makes the `form` object
          (which holds all the state and functions from `useForm`) available to all
          the nested `FormField` components via context.
        */}
        <Form {...form}>
          {/*
            The `onSubmit` attribute is wired to `form.handleSubmit`. This function from
            `react-hook-form` will first run our validation rules. If validation passes,
            it will then call our `handleLoginSubmit` function with the collected form data.
          */}
          <form
            onSubmit={form.handleSubmit(handleLoginSubmit)}
            className='space-y-6'
          >
            {/*
              Each `FormField` is a controller for a single input. It connects the UI
              to the form state, handling value changes and displaying validation error messages.
            */}
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
              {/* Conditional rendering: if `isSubmitting` is true, show the spinner icon. */}
              {isSubmitting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Login <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </Form>
        <div className='mt-6 text-center text-sm'>
          <p className='text-muted-foreground'>Don't have an account?</p>
          {/* `<Link>` is Next.js's component for client-side navigation. It's faster than a regular `<a>` tag. */}
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
