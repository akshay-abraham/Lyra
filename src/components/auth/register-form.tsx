// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Registration Form Component (`register-form.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI and logic for the user registration screen. It is one of the
 * most complex forms in the application, responsible for:
 * 1.  Displaying input fields for name, email, password, role, school, class, etc.
 * 2.  Conditionally showing/hiding fields based on the user's selected role (student vs. teacher).
 * 3.  Performing real-time password strength validation and providing visual feedback.
 * 4.  Validating all inputs against a complex set of rules using Zod, including custom
 *     cross-field validation (e.g., ensuring password and confirm password match).
 * 5.  Creating a new user account with Firebase Authentication.
 * 6.  Creating a corresponding user profile document in the Firestore database with the correct structure.
 * 7.  Handling success (redirecting) and error (showing notifications) scenarios.
 *
 * C-like Analogy:
 * This is a major module, like `register_ui.c`, handling a multi-step, complex data
 * entry form. It relies heavily on libraries (`react-hook-form` and `zod`) to manage
 * the form's complexity, abstracting away much of the manual state and validation logic.
 * It's a prime example of composing smaller UI components (`Input`, `Select`, `Card`)
 * into a larger, functional feature.
 */
'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { MultiSelect, type GroupedOption } from '@/components/ui/multi-select';
import {
  allClasses,
  getSubjectsForClasses,
  type ClassData,
} from '@/lib/subjects-data';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { calculatePasswordStrength } from '@/lib/utils';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile, UserRole, School } from '@/types';

// This Zod schema is more complex. It defines validation rules for all possible fields
// and uses `.refine()` for custom validation logic that depends on multiple fields.
const baseFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher']),
  school: z.string().min(1, 'Please select a school'),
  // Student fields
  class: z.string().optional(),
  // Teacher fields
  classesTaught: z.array(z.string()).optional(),
  subjectsTaught: z.array(z.string()).optional(),
});

const formSchema = baseFormSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'student') {
        return !!data.class;
      }
      return true;
    },
    { message: 'Please select a class', path: ['class'] },
  )
  .refine(
    (data) => {
      if (data.role === 'teacher') {
        return data.classesTaught && data.classesTaught.length > 0;
      }
      return true;
    },
    { message: 'Please select at least one class', path: ['classesTaught'] },
  )
  .refine(
    (data) => {
      if (data.role === 'teacher') {
        return data.subjectsTaught && data.subjectsTaught.length > 0;
      }
      return true;
    },
    { message: 'Please select at least one subject', path: ['subjectsTaught'] },
  );

// A modified schema for Google Sign-up, where passwords are not needed.
const googleFormSchema = baseFormSchema.omit({
  password: true,
  confirmPassword: true,
});

/**
 * The main component function for the registration form.
 *
 * @returns {JSX.Element} The JSX for the registration form.
 *
 * C-like Explanation: `function RegisterForm() -> returns JSX_Element`
 *
 * Internal State (Global Variables for this function):
 *   - `isSubmitting`: A boolean flag for the submit button's loading state.
 *   - `availableSubjects`: An array of strings, dynamically populated based on the classes a teacher selects.
 *   - `passwordStrength`: An integer (0-100) representing the current password's strength.
 *   - `strengthColor`: A string for the color of the password strength bar.
 *   - `showPassword`, `showConfirmPassword`: Booleans to toggle password visibility.
 */
export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthColor, setStrengthColor] = useState('bg-destructive');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
  const [googleSignUpData, setGoogleSignUpData] = useState<{
    uid: string;
    email: string;
    name: string;
  } | null>(null);

  const { auth, firestore } = useFirebase();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const currentSchema = isGoogleSignUp ? googleFormSchema : formSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      school: 'Girideepam Bethany Central School',
      class: '',
      classesTaught: [],
      subjectsTaught: [],
    },
    mode: 'onChange', // Re-validate the form on every change for real-time feedback.
  });

  useEffect(() => {
    const pendingReg = sessionStorage.getItem('lyra-google-pending-registration');
    if (pendingReg) {
      const data = JSON.parse(pendingReg);
      setIsGoogleSignUp(true);
      setGoogleSignUpData(data);
      form.reset({
        email: data.email,
        name: data.name || '',
        role: 'student',
        school: 'Girideepam Bethany Central School',
      });
    }
  }, [form]);

  // `form.watch` lets us subscribe to changes in specific form fields.
  const selectedRole = form.watch('role');
  const selectedClasses = form.watch('classesTaught');
  const password = form.watch('password');

  // This `useEffect` hook runs whenever the `password` value changes.
  // It calculates the strength and updates the state for the progress bar.
  useEffect(() => {
    const strength = calculatePasswordStrength(password || '');
    setPasswordStrength(strength);

    if (strength < 40) {
      setStrengthColor('bg-red-500');
    } else if (strength < 80) {
      setStrengthColor('bg-orange-500');
    } else {
      setStrengthColor('bg-green-500');
    }
  }, [password]); // Dependency array: only re-run when `password` changes.

  // This `useEffect` hook runs when `selectedClasses` or `selectedRole` changes.
  useEffect(() => {
    // If the user is a teacher and has selected classes...
    if (
      selectedRole === 'teacher' &&
      selectedClasses &&
      selectedClasses.length > 0
    ) {
      // ...get the corresponding subjects and update the `availableSubjects` state.
      const subjects = getSubjectsForClasses(selectedClasses);
      setAvailableSubjects(subjects.map((s) => s.name));
    } else {
      setAvailableSubjects([]);
    }
    // Also, reset the `subjectsTaught` field since the available options have changed.
    form.setValue('subjectsTaught', []);
  }, [selectedClasses, selectedRole, form]);

  /**
   * Handles the form submission for registration after validation passes.
   *
   * @param {z.infer<typeof formSchema>} data - The validated form data.
   */
  const handleRegisterSubmit = async (
    data: z.infer<typeof currentSchema>,
  ) => {
    setIsSubmitting(true);
    try {
      let userId: string;
      let userEmail: string | null;

      if (isGoogleSignUp && googleSignUpData) {
        // This is a Google sign-up completion
        userId = googleSignUpData.uid;
        userEmail = googleSignUpData.email;
        if (auth.currentUser && auth.currentUser.uid !== userId) {
          throw new Error(
            'Session mismatch. Please try signing in with Google again.',
          );
        }
      } else {
        // This is a standard email/password sign-up
        if (!('password' in data)) {
          throw new Error('Password is required for standard registration.');
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );
        userId = userCredential.user.uid;
        userEmail = userCredential.user.email;
      }

      // 2. Prepare the user profile data for Firestore.
      const userProfileData: Partial<UserProfile> = {
        uid: userId,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        school: data.school as School,
        createdAt: serverTimestamp(), // Use the database's timestamp for consistency.
      };

      // Add role-specific fields to the profile data object.
      if (data.role === 'student') {
        userProfileData.class = data.class;
      } else {
        userProfileData.classesTaught = data.classesTaught;
        userProfileData.subjectsTaught = data.subjectsTaught;
      }

      // 3. Create the user profile document in the 'users' collection in Firestore.
      const userDocRef = doc(firestore, COLLECTIONS.USERS, userId);
      // `setDoc` creates or overwrites a document with the given data.
      await setDoc(userDocRef, userProfileData);

      // 4. Store user info in session storage for quick access in the current session.
      sessionStorage.setItem(
        'lyra-user-info',
        JSON.stringify(userProfileData),
      );
      // Clean up pending registration data
      if (isGoogleSignUp) {
        sessionStorage.removeItem('lyra-google-pending-registration');
      }

      toast({
        title: 'Registration Successful',
        description: `Welcome to Lyra, ${data.name}!`,
      });

      // 5. Redirect based on role.
      if (data.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      // Handle errors, e.g., if the email is already in use.
      console.error('Registration failed:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description =
          'This email is already registered. Please try logging in.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare options for the various dropdowns in the form.
  const schoolOptions: School[] = ['Girideepam Bethany Central School'];
  const groupedClasses = allClasses.reduce(
    (acc, currentClass) => {
      const grade = `Grade ${currentClass.grade}`;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(currentClass);
      return acc;
    },
    {} as Record<string, ClassData[]>,
  );
  const teacherClassOptions: GroupedOption[] = Object.entries(
    groupedClasses,
  ).map(([grade, classes]) => ({
    label: grade,
    options: classes.map((c) => ({ label: c.name, value: c.name })),
  }));

  // ========================== RETURN JSX (The View) ==========================
  return (
    <Card className='w-full max-w-lg shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up'>
      <CardHeader className='text-center'>
        <CardTitle
          className='font-headline text-3xl animate-fade-in-down gradient-text'
          style={{ animationDelay: '0.2s' }}
        >
          {isGoogleSignUp
            ? 'Complete Your Profile'
            : 'Create Your Lyra Account'}
        </CardTitle>
        <CardDescription
          className='animate-fade-in-down'
          style={{ animationDelay: '0.3s' }}
        >
          {isGoogleSignUp
            ? "You're almost there! Just a few more details."
            : 'Join the future of AI-powered education.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleRegisterSubmit)}
            className='space-y-4'
          >
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Jane Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='email'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='e.g., jane.doe@school.edu'
                      {...field}
                      disabled={isGoogleSignUp}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isGoogleSignUp && (
              <>
                {/* Password Field with visibility toggle and strength meter */}
                <FormField
                  name='password'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute inset-y-0 right-0 flex items-center pr-3'
                          aria-label='Toggle password visibility'
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Eye className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                      </div>
                      {/* Only show the strength meter if the user has started typing. */}
                      {password && (
                        <div className='space-y-2 pt-1'>
                          <Progress
                            value={passwordStrength}
                            className='h-2'
                            indicatorClassName={cn(strengthColor)}
                          />
                          <FormDescription>
                            Password must be at least 8 characters and include
                            an uppercase letter, a lowercase letter, a number,
                            and a special character.
                          </FormDescription>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='confirmPassword'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute inset-y-0 right-0 flex items-center pr-3'
                          aria-label='Toggle confirm password visibility'
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Eye className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              name='school'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select your school' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schoolOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name='role'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a...</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select your role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='student'>Student</SelectItem>
                      <SelectItem value='teacher'>Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Rendering: Show fields based on the selected role. */}
            {selectedRole === 'student' && (
              <FormField
                name='class'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your class' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(groupedClasses).map(
                          ([grade, classes]) => (
                            <SelectGroup key={grade}>
                              <FormLabel className='px-2 text-xs'>
                                {grade}
                              </FormLabel>
                              {classes.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedRole === 'teacher' && (
              <>
                <FormField
                  name='classesTaught'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes Taught</FormLabel>
                      {/* This is a custom component for multi-selection. */}
                      <MultiSelect
                        options={teacherClassOptions}
                        onValueChange={field.onChange}
                        defaultValue={field.value || []}
                        placeholder='Select classes...'
                        isGrouped
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Only show the subjects dropdown if there are available subjects to choose from. */}
                {availableSubjects.length > 0 && (
                  <FormField
                    name='subjectsTaught'
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects Taught</FormLabel>
                        <MultiSelect
                          options={availableSubjects.map((s) => ({
                            label: s,
                            value: s,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value || []}
                          placeholder='Select subjects...'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Create Account <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </Form>
        {!isGoogleSignUp && (
          <>
            <div className='mt-6 text-center text-sm'>
              <p className='text-muted-foreground'>
                Already have an account?
              </p>
              <Link href='/login'>
                <Button variant='link' className='text-primary'>
                  Log in here
                </Button>
              </Link>
            </div>
            <div className='mt-4 text-center text-xs text-muted-foreground'>
              <p>
                By creating an account, you agree to our Terms and Conditions.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
