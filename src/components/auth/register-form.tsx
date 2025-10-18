
'use client';
import React, { useState } from 'react';
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher']),
  grade: z.string().optional(),
}).refine(data => data.role === 'teacher' || !!data.grade, {
    message: 'Please select a grade',
    path: ['grade'],
});


export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      grade: '',
    },
  });
  
  const selectedRole = form.watch('role');

  const handleRegisterSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
            await setDoc(doc(firestore, 'users', user.uid), {
                uid: user.uid,
                name: data.name,
                email: data.email,
                role: data.role,
                grade: data.role === 'student' ? data.grade : null,
                createdAt: serverTimestamp(),
            });

            sessionStorage.setItem('lyra-user-info', JSON.stringify({ name: data.name, role: data.role, grade: data.grade }));

            toast({
                title: 'Registration Successful',
                description: `Welcome to Lyra, ${data.name}!`,
            });
            
            if (data.role === 'teacher') {
                router.push('/teacher');
            } else {
                router.push('/');
            }
        }
    } catch (error: any) {
        console.error("Registration failed:", error);
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already registered. Please try logging in.';
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

  const k12Classes = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

  return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl animate-fade-in-down gradient-text" style={{ animationDelay: '0.2s' }}>Create Your Lyra Account</CardTitle>
          <CardDescription className="animate-fade-in-down" style={{ animationDelay: '0.3s' }}>Join the future of AI-powered education.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@school.edu" {...field} />
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
            
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>I am a...</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
              />
          
              {selectedRole === 'student' && (
                  <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your grade" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {k12Classes.map(c => <SelectItem key={c} value={String(parseInt(c.split(' ')[1]))}>{c}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">Already have an account?</p>
              <Link href="/login">
                  <Button variant="link" className="text-primary">
                      Log in here
                  </Button>
              </Link>
          </div>
        </CardContent>
      </Card>
  );
}
