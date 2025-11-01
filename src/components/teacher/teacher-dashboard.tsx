// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Teacher Dashboard Component (`teacher-dashboard.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the Teacher Dashboard, the main screen for teachers. It acts as
 * a sophisticated configuration utility for the AI tutor, allowing teachers to
 * customize the AI's behavior for each subject they teach.
 *
 * Core Functionalities:
 * 1.  **Subject Selection:** A dropdown allows teachers who teach multiple subjects
 *     to switch between different customization profiles.
 * 2.  **AI Personality (System Prompt):** Teachers can write a detailed prompt that tells the
 *     AI its role, tone, and pedagogical rules (e.g., "You are a friendly 5th-grade
 *     math tutor. Never give the direct answer.").
 * 3.  **Answer Examples (Few-Shot Prompting):** Teachers can provide a dynamic list of
 *     good, guiding responses. The AI uses these examples to learn the desired teaching style.
 * 4.  **Saving & Loading:** All settings are saved to and loaded from Firestore on a per-teacher,
 *     per-subject basis.
 *
 * C-like Analogy:
 * Think of this as a graphical settings panel (`config_panel.c`) for a complex program.
 * It reads configuration from a file (`load_settings_from_db`), displays it in a user-friendly
 * form, allows the user to modify it, and writes it back (`save_settings_to_db`). It also
 * provides a "Test" button to see the effect of the changes immediately.
 */
'use client';

// Import necessary React hooks, UI components, and Firebase functions.
import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Sparkles,
  Wand2,
  X,
  BrainCircuit,
  BookCopy,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RagManagement } from './rag-management';
import { useFirebase, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { TeacherSettings, UserProfile } from '@/types';
import { COLLECTIONS } from '@/lib/constants';

// `zod` is a library for data validation. This defines the "shape" of our settings form.
// It's like defining a `struct` in C and then writing a function to check if
// some data matches that struct's types and constraints.
const settingsSchema = z.object({
  systemPrompt: z.string().min(10, {
    message: 'System prompt must be at least 10 characters.',
  }),
  // This is an array of objects, where each object has a 'value' string.
  exampleAnswers: z.array(
    z.object({
      value: z.string().min(1, { message: 'Example cannot be empty.' }),
    }),
  ),
});

// A default system prompt to use for new settings or subjects.
const defaultSystemPrompt =
  'You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting.';

/**
 * The main component for the teacher's dashboard.
 *
 * @returns {JSX.Element} The rendered teacher dashboard.
 */
export function TeacherDashboard() {
  const [isSaving, setIsSaving] = useState(false);
  const [teacherData, setTeacherData] = useState<UserProfile | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useUser();

  // Initialize the main settings form.
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      systemPrompt: defaultSystemPrompt,
      exampleAnswers: [{ value: "Instead of solving it for you, can you tell me what you've tried so far?" }],
    },
  });

  // `useFieldArray` is a hook for managing dynamic arrays of form fields.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exampleAnswers',
  });

  /**
   * Fetches the teacher's profile from Firestore to get their list of subjects.
   * `useCallback` is an optimization that prevents the function from being recreated on every render.
   */
  const loadTeacherData = useCallback(async () => {
    if (user && firestore) {
      setIsLoadingSettings(true);
      const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setTeacherData(data);
        // If the teacher teaches at least one subject, select the first one by default.
        if (data.subjectsTaught && data.subjectsTaught.length > 0) {
          setSelectedSubject(data.subjectsTaught[0]);
        } else {
          setIsLoadingSettings(false);
        }
      } else {
        setIsLoadingSettings(false); // No profile found.
      }
    }
  }, [user, firestore]);

  // This `useEffect` calls `loadTeacherData` once when the component first mounts.
  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  /**
   * This `useEffect` hook runs whenever `selectedSubject` changes. It fetches the
   * specific AI settings for that subject from the `teacherSettings` collection.
   */
  useEffect(() => {
    async function loadSettings() {
      if (selectedSubject && user && firestore) {
        setIsLoadingSettings(true);
        // Construct a unique ID for the settings document (e.g., "teacher123_Maths").
        const settingsId = `${user.uid}_${selectedSubject.replace(/\s+/g, '-')}`;
        const settingsDocRef = doc(firestore, COLLECTIONS.TEACHER_SETTINGS, settingsId);
        const docSnap = await getDoc(settingsDocRef);

        if (docSnap.exists()) {
          // If settings exist for this subject, load them into the form.
          const settings = docSnap.data() as TeacherSettings;
          form.reset({
            systemPrompt: settings.systemPrompt,
            exampleAnswers: settings.exampleAnswers.map((e: string) => ({ value: e })),
          });
        } else {
          // Otherwise, reset the form to the default prompt and examples for a fresh start.
          form.reset({
            systemPrompt: defaultSystemPrompt,
            exampleAnswers: [{ value: "Instead of solving it for you, can you tell me what you've tried so far?" }],
          });
        }
        setIsLoadingSettings(false);
      }
    }
    if (selectedSubject) {
      loadSettings();
    }
  }, [selectedSubject, user, firestore, form]);

  /**
   * Called when the main settings form is submitted. Saves the settings to Firestore.
   * @param {z.infer<typeof settingsSchema>} values - The validated data from the form.
   */
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!selectedSubject || !user || !firestore) return;
    setIsSaving(true);
    try {
      const settingsId = `${user.uid}_${selectedSubject.replace(/\s+/g, '-')}`;
      // `setDoc` will create the document if it doesn't exist, or overwrite it if it does.
      await setDoc(doc(firestore, COLLECTIONS.TEACHER_SETTINGS, settingsId), {
        teacherId: user.uid,
        subject: selectedSubject,
        systemPrompt: values.systemPrompt,
        exampleAnswers: values.exampleAnswers.map((e) => e.value),
      });

      toast({
        title: 'Settings Saved',
        description: `Your customizations for ${selectedSubject} have been successfully saved.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your customizations. Please try again.',
      });
    } finally {
      setIsSaving(false); // Set loading to false whether it succeeded or failed.
    }
  }

  // ========================== RETURN JSX (The View) ==========================
  return (
    <div className='space-y-8'>
      <div className='animate-fade-in-down'>
        <h1 className='text-3xl font-headline font-bold'>Teacher Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome! Here you can shape the AI's personality and give it custom
          knowledge.
        </p>
      </div>

      <Tabs defaultValue='style' className='w-full space-y-8'>
        <TabsList className='grid w-full grid-cols-2 bg-card/80 backdrop-blur-sm animate-fade-in-up'>
          <TabsTrigger value='style'>
            <Wand2 className='mr-2' /> AI Teaching Style
          </TabsTrigger>
          <TabsTrigger value='rag'>
            <BrainCircuit className='mr-2 animate-pulse' /> Custom Knowledge
          </TabsTrigger>
        </TabsList>

        {/* CONTENT for the "AI Teaching Style" tab */}
        <TabsContent value='style'>
          <div className='space-y-8 animate-fade-in-up'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {/* Subject Selector Dropdown */}
                {teacherData?.subjectsTaught && teacherData.subjectsTaught.length > 0 ? (
                  <div className='mb-6 animate-fade-in-up'>
                    <FormLabel>Select Subject to Customize</FormLabel>
                    <Select
                      onValueChange={setSelectedSubject}
                      value={selectedSubject}
                    >
                      <SelectTrigger className='w-full md:w-1/2 mt-2'>
                        <SelectValue placeholder='Select a subject...' />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherData.subjectsTaught.map((s: string) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  !isLoadingSettings && (
                    <Alert>
                      <AlertTitle>No Subjects Found</AlertTitle>
                      <AlertDescription>
                        You are not assigned to any subjects. Please update your profile in the 'Account' page to begin customizing the AI.
                      </AlertDescription>
                    </Alert>
                  )
                )}

                {/* If settings are loading, show a spinner. Otherwise, show the form cards. */}
                {isLoadingSettings ? (
                  <div className='flex justify-center items-center p-8 h-64'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                  </div>
                ) : (
                  <>
                    <Card
                      className='bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up'
                      style={{ animationDelay: '0.2s' }}
                    >
                      <CardHeader>
                        <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                          <Wand2 /> AI Personality for{' '}
                          <span className='text-primary'>{selectedSubject || '...'}</span>
                        </CardTitle>
                        <CardDescription>
                          This is where you tell the AI how to act. Think of it as setting the classroom rules!
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name='systemPrompt'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>System Prompt</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={8}
                                  placeholder='e.g., You are a friendly math tutor...'
                                  {...field}
                                  className='animate-glow'
                                />
                              </FormControl>
                              <FormDescription>
                                This sets the AI's personality, role, and rules. Be explicit. Markdown is supported.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card
                      className='bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up'
                      style={{ animationDelay: '0.3s' }}
                    >
                      <CardHeader>
                        <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                          <Sparkles /> Answer Examples (Few-shot Prompting)
                        </CardTitle>
                        <CardDescription>
                          Show the AI what a good response looks like. It learns from your examples.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <FormLabel>Example Good Answers</FormLabel>
                          <div className='space-y-2'>
                            {fields.map((field, index) => (
                              <div key={field.id} className='flex items-center gap-2'>
                                <FormField
                                  control={form.control}
                                  name={`exampleAnswers.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem className='flex-grow'>
                                      <FormControl>
                                        <Input placeholder={`Example ${index + 1}`} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)} aria-label='Remove example'>
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button type='button' variant='outline' size='sm' onClick={() => append({ value: '' })}>
                            Add Example
                          </Button>
                          <FormDescription>
                            Show the AI what a good hint or guiding question looks like.
                          </FormDescription>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      type='submit'
                      disabled={isSaving || !selectedSubject}
                      size='lg'
                      className='animate-fade-in-up group transition-all duration-300 ease-in-out hover:scale-105'
                      style={{ animationDelay: '0.4s' }}
                    >
                      {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <BookCopy className='mr-2 h-4 w-4' />}
                      Save for {selectedSubject || '...'}
                    </Button>
                  </>
                )}
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* CONTENT for the "Custom Knowledge" tab. It just renders the RagManagement component mockup. */}
        <TabsContent value='rag'>
          <RagManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
