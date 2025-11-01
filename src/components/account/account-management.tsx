// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Account Management Component (`account-management.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the UI and logic for the "Account Management" page.
 * It is responsible for:
 * 1.  Displaying a form with the user's current profile information (name, email, class, etc.).
 * 2.  Handling user input to change this information.
 * 3.  Validating the input to ensure it's correct (e.g., email has a valid format).
 * 4.  Submitting the updated data to Firebase Auth and Firestore.
 * 5.  Providing security actions like deleting chat history.
 *
 * C-like Analogy:
 * Think of this as a dedicated C module (`account_ui.c`) that handles a complex
 * settings screen. It uses a powerful library (`react-hook-form`) to manage the
 * form's state, validation, and submission, much like using a pre-built GUI library
 * in C (like GTK or Qt) to avoid writing all the complex input and state management
 * from scratch. It handles fetching current data, validating new data, and writing
 * it back to the database.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, User, ShieldAlert, Bug } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import {
  doc,
  updateDoc,
  writeBatch,
  collection,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { MultiSelect, type GroupedOption } from '../ui/multi-select';
import {
  allClasses,
  getSubjectsForClasses,
  type ClassData,
} from '@/lib/subjects-data';
import type { UserProfile, School } from '@/types';
import { COLLECTIONS } from '@/lib/constants';
import { Combobox } from '../ui/combobox';

// `zod` is used to define the "schema" or structure of our form data.
// It's like defining a `struct` in C and also providing validation rules for each member.
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  school: z.string().min(1, 'Please select a school'),
  // Student-specific field
  class: z.string().optional(),
  // Teacher-specific fields
  classesTaught: z.array(z.string()).optional(),
  subjectsTaught: z.array(z.string()).optional(),
});

// A type definition derived from the schema, like `typedef struct ProfileFormData {...}`
type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * The main component for the account management UI.
 *
 * @returns {JSX.Element} The rendered account management form and settings.
 *
 * C-like Explanation: `function AccountManagement() -> returns JSX_Element`
 *
 * Internal State (Global Variables for this function):
 *   - `isSaving`, `isDeletingChat`: Boolean flags to show loading spinners on buttons.
 *   - `userInfo`: A struct-like object to hold the user's full profile from Firestore.
 *   - `availableSubjects`: An array of strings for the subjects a teacher can select, updated dynamically.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useUser`, `useFirebase`: Get access to auth status and database services.
 *   - `useToast`: Get a function to show pop-up notifications.
 *   - `useForm`: The main hook from `react-hook-form` to manage the entire form state, validation, and submission.
 *   - `useEffect`: Used to fetch the user's full profile when the component first loads
 *     and to react to changes (like when a teacher changes the classes they teach, which
 *     triggers a recalculation of available subjects).
 */
export function AccountManagement() {
  const { user } = useUser();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  // State variables for loading indicators.
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Initialize the form using the `useForm` hook from `react-hook-form`.
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema), // Use our Zod schema for live validation.
    defaultValues: {
      // Initial values before data is loaded from the database.
      name: '',
      email: '',
      school: 'Girideepam Bethany Central School',
      class: '',
      classesTaught: [],
      subjectsTaught: [],
    },
  });

  // `form.watch` allows us to subscribe to changes in a specific form field.
  const selectedClasses = form.watch('classesTaught');

  // This `useEffect` hook runs whenever `selectedClasses` changes.
  // Its job is to update the list of available subjects a teacher can select.
  useEffect(() => {
    if (
      userInfo?.role === 'teacher' &&
      selectedClasses &&
      selectedClasses.length > 0
    ) {
      // Get the corresponding subjects for the selected classes.
      const subjects = getSubjectsForClasses(selectedClasses);
      setAvailableSubjects(subjects.map((s) => s.name));
      // Reset the selected subjects if the classes they are based on have changed,
      // to prevent invalid selections.
      form.setValue('subjectsTaught', []);
    } else {
      // If no classes are selected, there are no subjects to choose from.
      setAvailableSubjects([]);
    }
  }, [selectedClasses, userInfo?.role, form]);

  /**
   * Fetches the complete user profile from Firestore and populates the form.
   * `useCallback` is an optimization. It "memoizes" the function, meaning it won't
   * be recreated on every render unless its dependencies (user, firestore, form) change.
   */
  const fetchUserInfo = useCallback(async () => {
    if (user && firestore) {
      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setUserInfo(data);
        // Once data is fetched, reset the form with these new default values.
        form.reset({
          name: data.name || user.displayName || '',
          email: data.email || user.email || '',
          school: data.school || 'Girideepam Bethany Central School',
          class: data.class || '',
          classesTaught: data.classesTaught || [],
          subjectsTaught: data.subjectsTaught || [],
        });
        // If the user is a teacher, pre-calculate the available subjects.
        if (data.role === 'teacher' && data.classesTaught) {
          const subjects = getSubjectsForClasses(data.classesTaught);
          setAvailableSubjects(subjects.map((s) => s.name));
        }
      }
    }
  }, [user, firestore, form]);

  // This `useEffect` calls `fetchUserInfo` once when the component is first mounted.
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // This effect will trigger the error when the state is set.
  useEffect(() => {
    if (shouldThrowError) {
      throw new Error('This is a test error triggered by the user.');
    }
  }, [shouldThrowError]);

  /**
   * The callback function that gets executed when the main profile form is submitted.
   * `react-hook-form` automatically handles collecting the data into the `values` object.
   *
   * @param {ProfileFormData} values - The validated data from the form.
   */
  async function onProfileSubmit(values: ProfileFormData) {
    if (!user || !userInfo) return;
    setIsSaving(true);
    try {
      // --- Update Firebase Authentication Profile ---
      // These are built-in Firebase functions to update the core auth user record.
      if (values.name !== user.displayName) {
        await updateProfile(user, { displayName: values.name });
      }
      if (values.email !== user.email) {
        // Note: This operation is sensitive and might require recent re-authentication.
        await updateEmail(user, values.email);
      }

      // --- Update Firestore Document Profile ---
      // This updates our custom user profile document in the `users` collection.
      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      const updateData: Partial<UserProfile> = {
        name: values.name,
        email: values.email,
        school: values.school as School,
      };
      if (userInfo.role === 'student') {
        updateData.class = values.class;
      } else if (userInfo.role === 'teacher') {
        updateData.classesTaught = values.classesTaught;
        updateData.subjectsTaught = values.subjectsTaught;
      }
      await updateDoc(userDocRef, updateData);

      // --- Update Local Session Storage ---
      // This keeps the locally cached user info in `sessionStorage` in sync.
      const storedInfo = sessionStorage.getItem('lyra-user-info');
      if (storedInfo) {
        const currentInfo = JSON.parse(storedInfo);
        const newInfo = { ...currentInfo, ...updateData };
        sessionStorage.setItem('lyra-user-info', JSON.stringify(newInfo));
        setUserInfo(newInfo); // Update local component state as well.
      }

      toast({
        title: 'Profile Updated',
        description: 'Your account information has been successfully updated.',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Deletes all documents in the user's `chatSessions` subcollection.
   * It uses a "batch write" for efficiency, which groups multiple delete operations
   * into a single request to the server, making it faster and more atomic.
   */
  async function handleDeleteChatHistory() {
    if (!user) return;
    setIsDeletingChat(true);

    const chatSessionsRef = collection(
      firestore,
      COLLECTIONS.USERS,
      user.uid,
      COLLECTIONS.CHAT_SESSIONS,
    );
    const snapshot = await getDocs(chatSessionsRef);

    if (snapshot.empty) {
      toast({ title: 'No chats to delete.' });
      setIsDeletingChat(false);
      return;
    }

    // Create a new batch operation.
    const batch = writeBatch(firestore);
    // For each document found, add a `delete` operation to the batch.
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit the batch - this sends all the delete operations to the server at once.
    await batch.commit();

    toast({
      title: 'Chat History Deleted',
      description: 'Your chat sessions have been cleared.',
    });

    setIsDeletingChat(false);
  }

  // Options for the UI dropdowns.
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

  const handleAddSchool = (schoolName: string) => {
    // In a real app, this would trigger an API call to a backend
    // to add the new school to a central database after verification.
    // For now, we will just show a toast.
    toast({
      title: 'Feature Not Implemented',
      description: `In a real app, '${schoolName}' would be sent for verification. For now, it's just used in your profile.`,
    });
    form.setValue('school', schoolName);
  };
  
  // ========================== RETURN JSX (The View) ==========================
  // The rest of this file is the JSX code that describes what the component looks like.
  return (
    <div className='space-y-8 max-w-4xl mx-auto'>
      <div className='animate-fade-in-down'>
        <h1 className='text-3xl font-headline font-bold'>Account Management</h1>
        <p className='text-muted-foreground'>
          Manage your profile, security settings, and data.
        </p>
      </div>

      {/*
        The `<Form {...form}>` component is a "Provider" from `react-hook-form`.
        It's like making the `form` object (with all its state and functions) globally
        available to all the child components nested inside it, like `<FormField>`.
      */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onProfileSubmit)}
          className='space-y-8'
        >
          {/* Profile Information Card */}
          <Card className='bg-card/80 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 font-headline text-2xl'>
                <User /> Profile Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/*
                Each `<FormField>` is a controlled component from `react-hook-form`.
                It links a specific UI input (like `<Input>`) to a field in our form schema
                (e.g., "name"), automatically handling its value, changes, and validation errors.
              */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Your name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='your.email@example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='school'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>School</FormLabel>
                    <Combobox
                      options={schoolOptions.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Select or type school name...'
                      onNotFound={handleAddSchool}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Rendering: Only show this field if the user is a student. */}
              {userInfo?.role === 'student' && (
                <FormField
                  control={form.control}
                  name='class'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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

              {/* Conditional Rendering: Only show these fields if the user is a teacher. */}
              {userInfo?.role === 'teacher' && (
                <>
                  <FormField
                    control={form.control}
                    name='classesTaught'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classes Taught</FormLabel>
                        <MultiSelect
                          options={teacherClassOptions}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          isGrouped
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {availableSubjects.length > 0 && (
                    <FormField
                      control={form.control}
                      name='subjectsTaught'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subjects Taught</FormLabel>
                          <MultiSelect
                            options={availableSubjects.map((s) => ({
                              label: s,
                              value: s,
                            }))}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Button type='submit' disabled={isSaving || !form.formState.isDirty}>
            {isSaving ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Save Changes
          </Button>
        </form>
      </Form>

      {/* Danger Zone Card for destructive actions */}
      <Card className='border-destructive bg-destructive/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-headline text-2xl text-destructive'>
            <ShieldAlert /> Danger Zone
          </CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-md'>
            <div>
              <h4 className='font-semibold'>Delete Chat History</h4>
              <p className='text-sm text-muted-foreground'>
                This will permanently delete all your chat sessions.
              </p>
            </div>
            {/*
              An `<AlertDialog>` is a special type of modal that forces the user
              to make a choice before continuing. It's used for destructive actions
              to prevent accidental data loss.
            */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' disabled={isDeletingChat}>
                  {isDeletingChat ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='mr-2 h-4 w-4' />
                  )}
                  Delete Chats
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all of your chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChatHistory}
                    className='bg-destructive hover:bg-destructive/90'
                  >
                    Yes, delete my chats
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-md'>
            <div>
              <h4 className='font-semibold'>Delete Account</h4>
              <p className='text-sm text-muted-foreground'>
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Feature Not Implemented</AlertDialogTitle>
                  <AlertDialogDescription>
                    Account deletion is a critical feature that will be
                    implemented soon. For now, please contact support for
                    account removal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-md'>
            <div>
              <h4 className='font-semibold'>Trigger Test Error</h4>
              <p className='text-sm text-muted-foreground'>
                Intentionally cause an error to test the error boundary.
              </p>
            </div>
            <Button
              variant='destructive'
              onClick={() => setShouldThrowError(true)}
            >
              <Bug className='mr-2 h-4 w-4' />
              Trigger Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
