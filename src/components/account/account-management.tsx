/**
 * @fileoverview Account Management Component (`account-management.tsx`)
 *
 * C-like Analogy:
 * This file defines the UI and logic for the "Account Management" page.
 * Think of it as a dedicated C module (`account_ui.c`) that is responsible for:
 * 1.  Displaying a form with the user's current profile information (name, email, class, etc.).
 * 2.  Handling user input to change this information.
 * 3.  Validating the input to make sure it's correct (e.g., email has a valid format).
 * 4.  Submitting the updated data to the database (Firebase Auth and Firestore).
 * 5.  Providing options for security actions like resetting a password or deleting data.
 *
 * It uses a powerful library called `react-hook-form` to manage the form's state,
 * validation, and submission. This is like using a pre-built GUI library in C to
 * handle all the complexities of form management instead of writing it all from scratch.
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
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, User, KeyRound, ShieldAlert, BookOpen } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { updateProfile, sendPasswordResetEmail, updateEmail } from 'firebase/auth';
import { doc, updateDoc, writeBatch, collection, getDocs, getDoc } from 'firebase/firestore';
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
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MultiSelect, type GroupedOption } from '../ui/multi-select';
import { allSubjects, allClasses, getSubjectsForClasses, type ClassData, getSubjectsByStream } from '@/lib/subjects-data';

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

// A type definition derived from the schema, like `typedef struct ProfileFormDataType {...}`
type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * C-like Explanation: `function AccountManagement() -> returns JSX_Element`
 *
 * This is the main component function for the account management UI.
 *
 * Internal State (Global Variables for this function):
 *   - `isSaving`, `isDeletingChat`, `isResetting`: Boolean flags to show loading spinners.
 *   - `userInfo`: A struct-like object to hold the user's full profile from Firestore.
 *   - `availableSubjects`: An array of strings for the subjects a teacher can select.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useUser`, `useFirebase`: Get access to auth status and database services.
 *   - `useToast`: Get a function to show pop-up notifications.
 *   - `useForm`: The main hook from `react-hook-form` to manage the entire form.
 *   - `useEffect`: Used to fetch the user's full profile when the component first loads
 *     and to react to changes (like when a teacher changes the classes they teach).
 */
export function AccountManagement() {
  const { user } = useUser();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  // State variables for loading indicators.
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Initialize the form using the `useForm` hook.
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema), // Use our Zod schema for validation.
    defaultValues: { // Initial values before data is loaded.
      name: '',
      email: '',
      school: 'Girideepam Bethany Central School',
      class: '',
      classesTaught: [],
      subjectsTaught: [],
    },
  });
  
  const selectedClasses = form.watch('classesTaught'); // Watch for changes to this specific field.

  // This `useEffect` hook runs when `selectedClasses` changes.
  // Its job is to update the list of available subjects for a teacher.
  useEffect(() => {
    if (userInfo?.role === 'teacher' && selectedClasses && selectedClasses.length > 0) {
      const subjects = getSubjectsForClasses(selectedClasses);
      setAvailableSubjects(subjects.map(s => s.name));
      // Reset the selected subjects if the classes they are based on have changed.
      form.setValue('subjectsTaught', []);
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedClasses, userInfo?.role, form]);


  // `useCallback` is an optimization. It "memoizes" the function, meaning it won't
  // be recreated on every render unless its dependencies change.
  // This function fetches the complete user profile from Firestore.
  const fetchUserInfo = useCallback(async () => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
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
        if(data.role === 'teacher' && data.classesTaught) {
             const subjects = getSubjectsForClasses(data.classesTaught);
             setAvailableSubjects(subjects.map(s => s.name));
        }
      }
    }
  }, [user, firestore, form]);

  // This `useEffect` calls `fetchUserInfo` once when the component is first mounted.
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  /**
   * C-like Explanation: `async function onProfileSubmit(values)`
   * This function is the callback that gets executed when the user clicks "Save Changes".
   * `react-hook-form` automatically handles collecting the data into the `values` struct.
   */
  async function onProfileSubmit(values: ProfileFormData) {
    if (!user) return;
    setIsSaving(true);
    try {
        // --- Update Firebase Authentication Profile ---
        // These are built-in Firebase functions to update the core auth user record.
        if (values.name !== user.displayName) {
            await updateProfile(user, { displayName: values.name });
        }
        if (values.email !== user.email) {
            await updateEmail(user, values.email); // Note: This might require re-authentication.
        }

        // --- Update Firestore Document Profile ---
        // This updates our custom user profile document in the database.
        const userDocRef = doc(firestore, 'users', user.uid);
        const updateData: any = {
            name: values.name,
            email: values.email,
            school: values.school,
        };
        if(userInfo.role === 'student') {
            updateData.class = values.class;
        } else if (userInfo.role === 'teacher') {
            updateData.classesTaught = values.classesTaught;
            updateData.subjectsTaught = values.subjectsTaught;
        }
        await updateDoc(userDocRef, updateData);

        // --- Update Local Session Storage ---
        // This keeps the locally cached user info in sync.
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
    } catch (error: any) {
        console.error("Profile update failed:", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An error occurred. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  }
  
  /**
   * C-like Explanation: `async function handlePasswordReset()`
   * This function sends a password reset email using Firebase's built-in functionality.
   */
  async function handlePasswordReset() {
    if (!user?.email) return;
    setIsResetting(true);
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: "Password Reset Email Sent",
            description: `A reset link has been sent to ${user.email}. Please check your inbox.`,
        });
    } catch(error: any) {
        console.error("Password reset failed:", error);
        toast({
            variant: "destructive",
            title: "Password Reset Failed",
            description: error.message || "An error occurred. Please try again.",
        });
    } finally {
        setIsResetting(false);
    }
  }

  /**
   * C-like Explanation: `async function handleDeleteChatHistory()`
   * This function deletes all documents in the user's `chatSessions` subcollection.
   * It uses a "batch write" for efficiency, which groups multiple delete operations
   * into a single request to the server.
   */
  async function handleDeleteChatHistory() {
    if (!user) return;
    setIsDeletingChat(true);

    const chatSessionsRef = collection(firestore, 'users', user.uid, 'chatSessions');
    const snapshot = await getDocs(chatSessionsRef);

    if (snapshot.empty) {
        toast({ title: 'No chats to delete.'});
        setIsDeletingChat(false);
        return;
    }
    
    // Create a new batch operation.
    const batch = writeBatch(firestore);
    // For each document found, add a `delete` operation to the batch.
    snapshot.forEach(doc => {
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
  const schoolOptions = ["Girideepam Bethany Central School"];
  const groupedClasses = allClasses.reduce((acc, currentClass) => {
    const grade = `Grade ${currentClass.grade}`;
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(currentClass);
    return acc;
  }, {} as Record<string, ClassData[]>);
  const teacherClassOptions: GroupedOption[] = Object.entries(groupedClasses).map(([grade, classes]) => ({
      label: grade,
      options: classes.map(c => ({ label: c.name, value: c.name }))
  }));

  // ========================== RETURN JSX (The View) ==========================
  // The rest of this file is the JSX code that describes what the component looks like.
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-headline font-bold">Account Management</h1>
            <p className="text-muted-foreground">Manage your profile, security settings, and data.</p>
        </div>
        
        {/*
          The `<Form {...form}>` component is a "Provider" from `react-hook-form`.
          It's like making the `form` object (with all its state and functions) globally
          available to all the child components nested inside it.
        */}
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-8">
                {/* Profile Information Card */}
                <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl"><User /> Profile Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/*
                          Each `<FormField>` is a controlled component from `react-hook-form`.
                          It links a specific UI input (like `<Input>`) to a field in our form schema
                          (e.g., "name"), automatically handling its value, changes, and validation errors.
                        */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                                <FormDescription>Changing your email might require re-verification.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="school" render={({ field }) => (
                            <FormItem>
                                <FormLabel>School</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>{schoolOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Conditional Rendering: Only show this field if the user is a student. */}
                        {userInfo?.role === 'student' && (
                            <FormField control={form.control} name="class" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.entries(groupedClasses).map(([grade, classes]) => (
                                                <SelectGroup key={grade}>
                                                    <FormLabel className='px-2 text-xs'>{grade}</FormLabel>
                                                    {classes.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        {/* Conditional Rendering: Only show these fields if the user is a teacher. */}
                        {userInfo?.role === 'teacher' && (
                            <>
                                <FormField control={form.control} name="classesTaught" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Classes Taught</FormLabel>
                                        <MultiSelect options={teacherClassOptions} onValueChange={field.onChange} defaultValue={field.value} isGrouped />
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {availableSubjects.length > 0 && (
                                    <FormField control={form.control} name="subjectsTaught" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subjects Taught</FormLabel>
                                            <MultiSelect options={availableSubjects.map(s => ({ label: s, value: s }))} onValueChange={field.onChange} defaultValue={field.value} />
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                </Button>
            </form>
        </Form>

        {/* Security Settings Card */}
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl"><KeyRound /> Password & Security</CardTitle>
                <CardDescription>Manage your security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Send a password reset link to your email.</p>
                    <Button variant="outline" onClick={handlePasswordReset} disabled={isResetting}>
                         {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset Password
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {/* Danger Zone Card */}
        <Card className="border-destructive bg-destructive/5">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl text-destructive"><ShieldAlert /> Danger Zone</CardTitle>
                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-md">
                    <div>
                        <h4 className="font-semibold">Delete Chat History</h4>
                        <p className="text-sm text-muted-foreground">This will permanently delete all your chat sessions.</p>
                    </div>
                    {/*
                      An `<AlertDialog>` is a special type of modal that forces the user
                      to make a choice before continuing. It's used for destructive actions.
                    */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeletingChat}>
                                {isDeletingChat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Chats
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete all of your chat history.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteChatHistory} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete my chats
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-md">
                    <div>
                        <h4 className="font-semibold">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" >Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Feature Not Implemented</AlertDialogTitle>
                                <AlertDialogDescription>Account deletion is a critical feature that will be implemented soon. For now, please contact support for account removal.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
