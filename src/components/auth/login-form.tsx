
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof formSchema>;

const cyclingDescriptions = [
    "Step into a world of guided learning. Your AI Tutor awaits!",
    "The future of AI in education starts here.",
    "Customizable, ethical AI for your classroom.",
    "Empowering students, supporting teachers."
];

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

    useEffect(() => {
        const interval = setInterval(() => {
            setDescriptionIndex(prevIndex => (prevIndex + 1) % cyclingDescriptions.length);
        }, 3000); 

        return () => clearInterval(interval);
    }, []);

  
  const handleLoginSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
            // Fetch user profile from Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                sessionStorage.setItem('lyra-user-info', JSON.stringify({ name: userData.name, role: userData.role, grade: userData.grade }));
                
                toast({ title: 'Login Successful', description: `Welcome back, ${userData.name}!` });
                
                if (userData.role === 'teacher') {
                    router.push('/teacher');
                } else {
                    router.push('/');
                }
            } else {
                 throw new Error("User profile not found.");
            }
        }
    } catch (error: any) {
        console.error("Firebase sign-in failed:", error);
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password. Please try again.';
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
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up animate-colorful-border">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl animate-fade-in-down gradient-text" style={{ animationDelay: '0.2s' }}>Welcome back to Lyra</CardTitle>
          <CardDescription key={descriptionIndex} className="animate-fade-in-down transition-all duration-500" style={{ animationDelay: '0.3s' }}>{cyclingDescriptions[descriptionIndex]}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">Don't have an account?</p>
              <Link href="/register">
                  <Button variant="link" className="text-primary">
                      Create one here
                  </Button>
              </Link>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <p>
                By logging in, you agree to our Terms and Conditions.
            </p>
          </div>
        </CardContent>
      </Card>
  );
}
