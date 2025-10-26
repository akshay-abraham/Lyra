// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Teacher Dashboard Component (`teacher-dashboard.tsx`)
 *
 * C-like Analogy:
 * This file defines the Teacher Dashboard, the main screen for teachers.
 * It acts as a sophisticated configuration utility for the AI tutor. Think of it as a
 * graphical settings panel (`config_panel.c`) for a complex program.
 *
 * Core Functionalities:
 * 1.  **AI Personality (System Prompt):** Teachers can write a detailed prompt that tells the
 *     AI its role, its tone, and the rules it must follow (e.g., "You are a friendly 5th-grade
 *     math tutor. Never give the direct answer."). This is like editing a `config.ini` file.
 * 2.  **Answer Examples (Few-Shot Prompting):** Teachers can provide examples of good, guiding
 *     responses. The AI uses these examples to learn the desired teaching style. This is
 *     like providing a set of test cases for the AI to learn from.
 * 3.  **Testing Sandbox:** Teachers can ask a sample student question and see how the AI
 *     responds with the current settings, allowing for quick iteration and debugging.
 * 4.  **Custom Knowledge (RAG):** A tab that leads to the RAG management UI, where teachers
 *     can upload their own course materials (like PDFs or notes).
 * 5.  **Subject Selection:** If a teacher teaches multiple subjects, they can switch between
 *     them to create different AI settings for each one. The UI adapts based on the number
 *     of subjects taught.
 *
 * It uses `react-hook-form` to manage the form state, validation, and saving, and it
 * interacts with Firestore to load and save these settings for each teacher and subject.
 */
'use client';

// Like `#include` in C, these lines import necessary code from other files.
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { generateGuidedResponse } from '@/ai/flows/guide-ai-response-generation';
import {
  Bot,
  Loader2,
  Sparkles,
  Wand2,
  X,
  BrainCircuit,
  BookCopy,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RagManagement } from './rag-management';
import { useFirebase, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

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

// A simpler schema just for the "Test AI" form.
const testSchema = z.object({
  studentQuestion: z.string().min(5, {
    message: 'Test question must be at least 5 characters.',
  }),
});

// A default system prompt to use for new settings.
const defaultSystemPrompt =
  'You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting.';

/**
 * =================================================================================
 * MAIN TEACHER DASHBOARD COMPONENT
 * C-like Explanation: `function TeacherDashboard() -> returns JSX_Element`
 *
 * This is the main component function for the teacher's UI.
 *
 * Internal State (Variables):
 *   - `isSaving`: A boolean flag to show a spinner on the save button.
 *   - `isTesting`: A boolean flag for the "Test AI" button spinner.
 *   - `testResult`: A string to store the AI's response from the test sandbox.
 *   - `teacherData`: A struct-like object holding the teacher's profile (subjects, etc.).
 *   - `selectedSubject`: The subject currently being edited.
 *   - `isLoadingSettings`: A boolean flag for when we are fetching settings from the database.
 *
 * Hooks (Special Functions):
 *   - `useForm`: From `react-hook-form`, this manages the entire state of our main
 *     settings form (system prompt, example answers). It handles data, validation, and submission.
 *   - `useFieldArray`: A helper from `react-hook-form` to manage the dynamic list of "Example Answers".
 *   - `useFirebase`, `useUser`: Our custom hooks to get access to the database and current user info.
 *   - `useEffect`: Used to react to changes, like when the user selects a different subject
 *     from the dropdown, which triggers a data fetch from the database.
 * =================================================================================
 */
export function TeacherDashboard() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useUser();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      systemPrompt: defaultSystemPrompt,
      exampleAnswers: [
        {
          value:
            "Instead of solving it for you, can you tell me what you've tried so far?",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exampleAnswers',
  });

  const testForm = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: { studentQuestion: '' },
  });

  /**
   * C-like Explanation: `useCallback(async function loadTeacherData() ...)`
   *
   * This function fetches the teacher's profile from Firestore. `useCallback` is an
   * optimization that prevents the function from being recreated on every render.
   */
  const loadTeacherData = useCallback(async () => {
    if (user && firestore) {
      setIsLoadingSettings(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeacherData(data);
        // If the teacher teaches at least one subject, select the first one by default.
        if (data.subjectsTaught && data.subjectsTaught.length > 0) {
          setSelectedSubject(data.subjectsTaught[0]);
        } else {
          setIsLoadingSettings(false);
        }
      } else {
        setIsLoadingSettings(false);
      }
    }
  }, [user, firestore]);

  // This `useEffect` calls `loadTeacherData` once when the component first mounts.
  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  /**
   * C-like Explanation: `useEffect` for loading settings.
   *
   * This hook runs whenever `selectedSubject` changes. It fetches the specific
   * AI settings for that subject from the database.
   */
  useEffect(() => {
    async function loadSettings() {
      if (selectedSubject && user && firestore) {
        setIsLoadingSettings(true);
        // Construct a unique ID for the settings document (e.g., "teacher123_Maths").
        const settingsId = `${user.uid}_${selectedSubject.replace(/\s+/g, '-')}`;
        const settingsDocRef = doc(firestore, 'teacherSettings', settingsId);
        const docSnap = await getDoc(settingsDocRef);

        if (docSnap.exists()) {
          // If settings exist, load them into the form.
          const settings = docSnap.data();
          form.reset({
            systemPrompt: settings.systemPrompt,
            exampleAnswers: settings.exampleAnswers.map((e: string) => ({
              value: e,
            })),
          });
        } else {
          // Otherwise, reset the form to the default prompt and examples.
          form.reset({
            systemPrompt: defaultSystemPrompt,
            exampleAnswers: [
              {
                value:
                  "Instead of solving it for you, can you tell me what you've tried so far?",
              },
            ],
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
   * C-like Explanation: `async function onSubmit(values)`
   * This function is called when the main settings form is submitted.
   * `values` is a struct containing the data from the form fields.
   */
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!selectedSubject || !user || !firestore) return;
    setIsSaving(true);
    try {
      const settingsId = `${user.uid}_${selectedSubject.replace(/\s+/g, '-')}`;
      // `setDoc` will create the document if it doesn't exist, or overwrite it if it does.
      await setDoc(doc(firestore, 'teacherSettings', settingsId), {
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

  /**
   * C-like Explanation: `async function onTest(values)`
   * This function is called when the "Test AI" form is submitted.
   * `values` is a struct containing the student's test question.
   */
  async function onTest(values: z.infer<typeof testSchema>) {
    setIsTesting(true);
    setTestResult('');
    const currentSettings = form.getValues(); // Get the latest settings from the main form.
    const teacherExamples =
      currentSettings.exampleAnswers
        ?.map((e) => e.value)
        .filter((e) => e.trim() !== '') || [];

    try {
      // Call the AI flow (like a remote function call) with the test data.
      const result = await generateGuidedResponse({
        studentQuestion: values.studentQuestion,
        teacherExamples: teacherExamples,
        systemPrompt: currentSettings.systemPrompt,
      });
      setTestResult(result.aiResponse); // Update state to display the AI's response.
    } catch (error) {
      console.error(error);
      setTestResult(
        'An error occurred while testing. Please check the console.',
      );
      toast({
        variant: 'destructive',
        title: 'Test Failed',
        description: 'Could not get a response from the AI. Please try again.',
      });
    } finally {
      setIsTesting(false);
    }
  }

  // ========================== RETURN JSX (The View) ==========================
  // The rest of this file is the JSX code that describes what the component looks like.
  return (
    <div className='space-y-8'>
      <div className='animate-fade-in-down'>
        <h1 className='text-3xl font-headline font-bold'>Teacher Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome! Here you can shape the AI's personality and give it custom
          knowledge.
        </p>
      </div>

      {/* The Tabs component allows switching between "Teaching Style" and "Custom Knowledge". */}
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
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-up'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6 lg:col-span-2'
              >
                {/* Subject Selector */}
                {teacherData?.subjectsTaught?.length > 0 ? (
                  <div className='mb-6 animate-fade-in-up'>
                    <FormLabel>Select Subject to Customize</FormLabel>
                    <Select
                      onValueChange={setSelectedSubject}
                      value={selectedSubject}
                      disabled={teacherData.subjectsTaught.length <= 1}
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
                    <p className='text-muted-foreground'>
                      You are not assigned to any subjects. Please update your
                      profile.
                    </p>
                  )
                )}

                {/* If settings are loading, show a spinner. Otherwise, show the form cards. */}
                {isLoadingSettings ? (
                  <div className='flex justify-center items-center p-8'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                  </div>
                ) : (
                  <>
                    {/* Card for AI Personality / System Prompt */}
                    <Card
                      className='bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up'
                      style={{ animationDelay: '0.2s' }}
                    >
                      <CardHeader>
                        <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                          <Wand2 /> AI Personality for{' '}
                          {selectedSubject || 'Your Subject'}
                        </CardTitle>
                        <CardDescription>
                          This is where you tell the AI how to act. Think of it
                          as setting the classroom rules!
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
                                This sets the AI's personality, role, and rules.
                                Be explicit. Markdown is supported.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Card for Answer Examples */}
                    <Card
                      className='bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up'
                      style={{ animationDelay: '0.3s' }}
                    >
                      <CardHeader>
                        <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                          <Sparkles /> Answer Examples (Few-shot Prompting)
                        </CardTitle>
                        <CardDescription>
                          Show the AI what a good response looks like. It learns
                          from your examples.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <FormLabel>Example Good Answers</FormLabel>
                          <div className='space-y-2'>
                            {fields.map((field, index) => (
                              <div
                                key={field.id}
                                className='flex items-center gap-2'
                              >
                                <FormField
                                  control={form.control}
                                  name={`exampleAnswers.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem className='flex-grow'>
                                      <FormControl>
                                        <Input
                                          placeholder={`Example ${index + 1}`}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => remove(index)}
                                  aria-label='Remove example'
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => append({ value: '' })}
                          >
                            Add Example
                          </Button>
                          <FormDescription>
                            Show the AI what a good hint or guiding question
                            looks like.
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
                      {isSaving ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <BookCopy className='mr-2 h-4 w-4' />
                      )}
                      Save for {selectedSubject || '...'}
                    </Button>
                  </>
                )}
              </form>
            </Form>

            {/* This is the right-hand column for the AI testing sandbox. */}
            <div className='space-y-6 lg:sticky lg:top-24'>
              <Card
                className='bg-card/80 backdrop-blur-sm border-accent/20 shadow-lg animate-fade-in-up'
                style={{ animationDelay: '0.5s' }}
              >
                <CardHeader>
                  <CardTitle className='font-headline text-2xl'>
                    Test Your AI
                  </CardTitle>
                  <CardDescription>
                    See how the AI will respond with your current settings for{' '}
                    {selectedSubject || 'this subject'}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...testForm}>
                    <form
                      onSubmit={testForm.handleSubmit(onTest)}
                      className='space-y-4'
                    >
                      <FormField
                        control={testForm.control}
                        name='studentQuestion'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student's Question</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='e.g., How do I solve for x in 2x + 5 = 15?'
                                {...field}
                                className='animate-glow'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='submit'
                        disabled={isTesting || !selectedSubject}
                        className='w-full'
                      >
                        {isTesting ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : null}
                        Run Test
                      </Button>
                    </form>
                  </Form>
                  {(isTesting || testResult) && <Separator className='my-6' />}
                  {testResult && (
                    <Alert>
                      <Bot className='h-4 w-4' />
                      <AlertTitle className='font-headline'>
                        AI Response
                      </AlertTitle>
                      <AlertDescription>
                        <div className='prose-sm dark:prose-invert max-w-none whitespace-pre-wrap'>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {testResult}
                          </ReactMarkdown>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* CONTENT for the "Custom Knowledge" tab. It just renders the RagManagement component. */}
        <TabsContent value='rag'>
          <RagManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
