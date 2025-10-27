// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Registration Form Component (`register-form.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI and logic for the user registration screen. It is designed
 * to work exclusively with the Google Sign-In flow. After a new user authenticates with
 * Google for the first time, they are redirected here to complete their profile.
 *
 * Core Responsibilities:
 * 1.  Displaying input fields for name, role, school, class, etc.
 * 2.  The email field is pre-filled and disabled, as it comes from their Google account.
 * 3.  Conditionally showing/hiding fields based on the user's selected role (student vs. teacher).
 * 4.  Validating all inputs against a set of rules using Zod.
 * 5.  Creating the corresponding user profile document in the Firestore database.
 * 6.  Handling success (redirecting) and error (showing notifications) scenarios.
 *
 * C-like Analogy:
 * This is a module (`register_ui.c`) for a data entry form. It relies on libraries
 * (`react-hook-form` and `zod`) to manage the form's complexity, abstracting away
 * much of the manual state and validation logic. Its sole purpose is to gather
 * additional user details after their identity has already been verified by Google.
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
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { MultiSelect, type GroupedOption } from '@/components/ui/multi-select';
import {
  allClasses,
  getSubjectsForClasses,
  type ClassData,
} from '@/lib/subjects-data';
import { COLLECTIONS } from '@/lib/constants';
import type { UserProfile, UserRole, School } from '@/types';

// The Zod schema defines validation rules for the profile completion form.
const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    role: z.enum(['student', 'teacher']),
    school: z.string().min(1, 'Please select a school'),
    // Student fields
    class: z.string().optional(),
    // Teacher fields
    classesTaught: z.array(z.string()).optional(),
    subjectsTaught: z.array(z.string()).optional(),
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
 *   - `googleSignUpData`: A struct-like object holding the pre-filled data from Google Sign-In.
 */
export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [googleSignUpData, setGoogleSignUpData] = useState<{
    uid: string;
    email: string;
    name: string;
  } | null>(null);

  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'student',
      school: 'Girideepam Bethany Central School',
      class: '',
      classesTaught: [],
      subjectsTaught: [],
    },
    mode: 'onChange', // Re-validate the form on every change for real-time feedback.
  });

  // This effect runs once on mount to check for pending Google registration data in sessionStorage.
  useEffect(() => {
    const pendingReg = sessionStorage.getItem('lyra-google-pending-registration');
    if (pendingReg) {
      const data = JSON.parse(pendingReg);
      setGoogleSignUpData(data);
      // Pre-fill the form with data from Google.
      form.reset({
        email: data.email,
        name: data.name || '',
        role: 'student',
        school: 'Girideepam Bethany Central School',
      });
    } else {
      // If there's no pending registration, the user shouldn't be here. Redirect to login.
      router.push('/login');
    }
  }, [form, router]);

  // `form.watch` lets us subscribe to changes in specific form fields.
  const selectedRole = form.watch('role');
  const selectedClasses = form.watch('classesTaught');

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
   * Handles the form submission for completing the profile after validation passes.
   *
   * @param {z.infer<typeof formSchema>} data - The validated form data.
   */
  const handleRegisterSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    if (!googleSignUpData || !auth.currentUser) {
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: 'Your session has expired. Please sign in again.',
      });
      router.push('/login');
      return;
    }

    try {
      const userId = googleSignUpData.uid;

      // 1. Prepare the user profile data for Firestore.
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

      // 2. Create the user profile document in the 'users' collection in Firestore.
      const userDocRef = doc(firestore, COLLECTIONS.USERS, userId);
      // `setDoc` creates or overwrites a document with the given data.
      await setDoc(userDocRef, userProfileData);

      // 3. Store user info in session storage for quick access in the current session.
      sessionStorage.setItem(
        'lyra-user-info',
        JSON.stringify(userProfileData),
      );
      // Clean up pending registration data
      sessionStorage.removeItem('lyra-google-pending-registration');

      toast({
        title: 'Registration Successful',
        description: `Welcome to Lyra, ${data.name}!`,
      });

      // 4. Redirect based on role.
      if (data.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      // Handle errors, e.g., if the email is already in use.
      console.error('Registration failed:', error);
      let description = 'An unexpected error occurred. Please try again.';
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
          Complete Your Profile
        </CardTitle>
        <CardDescription
          className='animate-fade-in-down'
          style={{ animationDelay: '0.3s' }}
        >
          You're almost there! Just a few more details and you'll be all set.
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
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </CardContent>
    </Card>
  );
}
