
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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { schools, teachersBySchool, studentsBySchool, SchoolName, teacherPassword, getStudentPassword } from '@/lib/school-data';
import { Input } from '../ui/input';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Contact, Loader2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  school: z.string().min(1, 'Please select a school'),
  role: z.enum(['student', 'teacher', 'guest']),
  class: z.string().optional(),
  name: z.string().min(1, 'Please select your name'),
  password: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const cyclingDescriptions = [
    "Step into a world of guided learning. Your AI Tutor awaits!",
    "The future of AI in education starts here.",
    "Customizable, ethical AI for your classroom.",
    "Empowering students, supporting teachers."
];

export function LoginForm() {
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionIndex, setDescriptionIndex] = useState(0);

  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: '',
      role: undefined,
      class: '',
      name: '',
      password: '',
    },
  });

  const selectedSchool = form.watch('school') as SchoolName;
  const selectedRole = form.watch('role');
  const selectedName = form.watch('name');

    useEffect(() => {
        const interval = setInterval(() => {
            setDescriptionIndex(prevIndex => (prevIndex + 1) % cyclingDescriptions.length);
        }, 3000); // Change text every 3 seconds

        return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    if (selectedSchool === 'guest') {
        form.setValue('role', 'guest');
        form.setValue('name', 'Guest');
        setAvailableNames([]);
    } else if (selectedSchool && selectedRole === 'teacher') {
        const schoolTeachers = teachersBySchool[selectedSchool] || [];
        setAvailableNames(schoolTeachers.sort());
    } else if (selectedSchool && selectedRole === 'student') {
        const schoolStudents = studentsBySchool[selectedSchool] || [];
        setAvailableNames(schoolStudents.sort());
    } else {
        setAvailableNames([]);
    }
    
    if (selectedSchool !== 'guest') {
      form.setValue('name', '');
    }

    setShowAddUser(false);
  }, [selectedSchool, selectedRole, form]);

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (name === 'Other') {
        form.setValue('name', '');
        setShowAddUser(true);
    } else {
        setShowAddUser(false);
    }
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
        let passwordCorrect = false;
        let finalRole: 'student' | 'teacher' | 'guest' = 'student';

        if(data.role === 'guest') {
            passwordCorrect = true;
            finalRole = 'teacher';
        } else if (data.role === 'student' && data.name) {
            const expectedPassword = getStudentPassword(data.name);
            passwordCorrect = data.password === expectedPassword;
            finalRole = 'student';
        } else if (data.role === 'teacher') {
            passwordCorrect = data.password === teacherPassword;
            finalRole = 'teacher';
        }

        if (passwordCorrect) {
            login({
                name: data.name,
                school: data.school,
                role: finalRole,
                class: data.class,
            });
            toast({ title: 'Login Successful', description: `Welcome, ${data.name}! Let the learning begin!` });
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'The password you entered is incorrect.',
            });
        }
        setIsSubmitting(false);
    }, 500);

  };

  const k12Classes = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
  const isGuest = selectedSchool === 'guest';
  const isFormValid = isGuest || form.formState.isValid;

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20 animate-fade-in-up animate-colorful-border">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl animate-fade-in-down" style={{ animationDelay: '0.2s' }}>Welcome to Lyra</CardTitle>
        <CardDescription className="animate-fade-in-down transition-all duration-500" style={{ animationDelay: '0.3s' }}>{cyclingDescriptions[descriptionIndex]}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <FormLabel>School</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select your school" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map(school => <SelectItem key={school} value={school}>{school}</SelectItem>)}
                       <SelectItem value="guest">Guest User (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedSchool && selectedSchool !== 'guest' && (
                <>
                    <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
                                <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select your grade" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {k12Classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {(selectedRole === 'student' || selectedRole === 'teacher') && availableNames.length > 0 && (
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                            <FormLabel>Name</FormLabel>
                            <Select onValueChange={handleNameChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select your name" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                    <SelectItem value="Other">My name is not on this list</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )}

                    {showAddUser && (
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                                    <FormLabel>Enter Your Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    
                    {selectedName && selectedRole !== 'guest' && (
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={selectedRole === 'teacher' ? 'Enter administrator password' : "Enter your provided password"} {...field} className={selectedRole === 'teacher' ? 'border-accent ring-accent focus-visible:ring-accent' : ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </>
            )}

            <Button type="submit" className="w-full animate-fade-in-up" style={{ animationDelay: '1s' }} disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enter the Classroom <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
            <p className="text-muted-foreground">Is your school not listed?</p>
             <Link href="https://akshayabraham.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button variant="link" className="text-primary group transition-all duration-300 ease-in-out hover:scale-105">
                    <Contact className="mr-2 h-4 w-4"/> Let's get you set up!
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  );
}
