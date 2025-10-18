
'use client';

import { useState } from 'react';
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
import { Loader2, Trash2, User, KeyRound, ShieldAlert } from 'lucide-react';
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { updateProfile, sendPasswordResetEmail, updateEmail } from 'firebase/auth';
import { doc, updateDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
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

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

export function AccountManagement() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
    },
    values: {
        name: user?.displayName || '',
        email: user?.email || '',
    }
  });

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsSaving(true);
    try {
        // Update Firebase Auth Profile
        if (values.name !== user.displayName) {
            await updateProfile(user, { displayName: values.name });
        }
        if (values.email !== user.email) {
            await updateEmail(user, values.email);
            // You might need to handle re-authentication here if the action is sensitive
        }

        // Update Firestore Profile
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            name: values.name,
            email: values.email,
        });

        // Update session storage
        const storedInfo = sessionStorage.getItem('lyra-user-info');
        if (storedInfo) {
            const userInfo = JSON.parse(storedInfo);
            userInfo.name = values.name;
            sessionStorage.setItem('lyra-user-info', JSON.stringify(userInfo));
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

    const batch = writeBatch(firestore);
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    batch.commit().then(() => {
        toast({
            title: 'Chat History Deleted',
            description: 'Your chat sessions have been cleared.',
        });
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/chatSessions`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsDeletingChat(false);
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-headline font-bold">Account Management</h1>
            <p className="text-muted-foreground">Manage your profile, security settings, and data.</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl"><User /> Profile Information</CardTitle>
                <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="your.email@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Changing your email requires re-verification.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSaving || isUserLoading}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl"><KeyRound /> Password & Security</CardTitle>
                <CardDescription>Change your password.</CardDescription>
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
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all of your chat history.
                                </AlertDialogDescription>
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
                            <Button variant="destructive" >
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Feature Not Implemented</AlertDialogTitle>
                                <AlertDialogDescription>
                                   Account deletion is a critical feature that will be implemented soon. For now, please contact support for account removal.
                                </AlertDialogDescription>
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
