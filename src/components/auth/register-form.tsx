
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { MultiSelect, type GroupedOption } from '@/components/ui/multi-select';
import { allClasses, getSubjectsForClasses, type ClassData } from '@/lib/subjects-data';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
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
})
.refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
.refine(data => {
    if (data.role === 'student') {
        return !!data.class;
    }
    return true;
}, { message: 'Please select a class', path: ['class'] })
.refine(data => {
    if (data.role === 'teacher') {
        return data.classesTaught && data.classesTaught.length > 0;
    }
    return true;
}, { message: 'Please select at least one class', path: ['classesTaught'] })
.refine(data => {
    if (data.role === 'teacher') {
        return data.subjectsTaught && data.subjectsTaught.length > 0;
    }
    return true;
}, { message: 'Please select at least one subject', path: ['subjectsTaught'] });


export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthColor, setStrengthColor] = useState('bg-destructive');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    mode: 'onChange'
  });
  
  const selectedRole = form.watch('role');
  const selectedClasses = form.watch('classesTaught');
  const password = form.watch('password');

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;

    // Award points for different criteria
    if (password.length >= 8) score += 20;
    if (password.match(/[a-z]/)) score += 20;
    if (password.match(/[A-Z]/)) score += 20;
    if (password.match(/[0-9]/)) score += 20;
    if (password.match(/[^A-Za-z0-9]/)) score += 20;

    return score;
  };

  useEffect(() => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);

    if (strength < 40) {
        setStrengthColor('bg-red-500');
    } else if (strength < 80) {
        setStrengthColor('bg-orange-500');
    } else {
        setStrengthColor('bg-green-500');
    }
  }, [password]);


  useEffect(() => {
    if (selectedRole === 'teacher' && selectedClasses && selectedClasses.length > 0) {
      const subjects = getSubjectsForClasses(selectedClasses);
      setAvailableSubjects(subjects.map(s => s.name));
    } else {
      setAvailableSubjects([]);
    }
    // Reset subjects taught if classes change
    form.setValue('subjectsTaught', []);
  }, [selectedClasses, selectedRole, form]);


  const handleRegisterSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
            const userProfileData: any = {
                uid: user.uid,
                name: data.name,
                email: data.email,
                role: data.role,
                school: data.school,
                createdAt: serverTimestamp(),
            };

            if (data.role === 'student') {
                userProfileData.class = data.class;
            } else {
                userProfileData.classesTaught = data.classesTaught;
                userProfileData.subjectsTaught = data.subjectsTaught;
            }
            
            const userDocRef = doc(firestore, 'users', user.uid);
            setDoc(userDocRef, userProfileData).catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: userProfileData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            
            sessionStorage.setItem('lyra-user-info', JSON.stringify(userProfileData));

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


  return (
      <Card className="w-full max-w-lg shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up">
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
                    <div className="relative">
                        <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Toggle password visibility">
                           {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </button>
                    </div>
                    {password && (
                        <div className="space-y-2 pt-1">
                            <Progress value={passwordStrength} className="h-2" indicatorClassName={strengthColor} />
                            <FormDescription>
                                Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.
                            </FormDescription>
                        </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                        <FormControl>
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                        </FormControl>
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Toggle confirm password visibility">
                           {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your school" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {schoolOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                      name="class"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your class" /></SelectTrigger>
                              </FormControl>
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
                      )}
                  />
              )}

              {selectedRole === 'teacher' && (
                <>
                    <FormField
                        control={form.control}
                        name="classesTaught"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Classes Taught</FormLabel>
                                <MultiSelect
                                    options={teacherClassOptions}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || []}
                                    placeholder="Select classes..."
                                    isGrouped
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {availableSubjects.length > 0 && (
                        <FormField
                            control={form.control}
                            name="subjectsTaught"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subjects Taught</FormLabel>
                                    <MultiSelect
                                        options={availableSubjects.map(s => ({ label: s, value: s }))}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || []}
                                        placeholder="Select subjects..."
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </>
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

    