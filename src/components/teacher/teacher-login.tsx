'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2 } from 'lucide-react';

const TEACHER_PASSWORD = "teach"; // This should be in an environment variable in a real app

const formSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface TeacherLoginProps {
  onAuthSuccess: () => void;
}

export function TeacherLogin({ onAuthSuccess }: TeacherLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      if (values.password === TEACHER_PASSWORD) {
        toast({
          title: "Access Granted",
          description: "Welcome, Teacher!",
        });
        onAuthSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The password you entered is incorrect.",
        });
        form.reset();
      }
      setIsLoading(false);
    }, 500);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in-up">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Teacher Verification</CardTitle>
          <CardDescription>Please enter the password to access the teacher dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Unlock Dashboard
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
