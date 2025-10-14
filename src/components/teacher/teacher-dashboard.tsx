'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { customizeAiTeachingStyle } from '@/ai/flows/customize-ai-teaching-style';
import { generateGuidedResponse } from '@/ai/flows/guide-ai-response-generation';
import { Bot, Loader2, Sparkles, Wand2, X, BrainCircuit, BookCopy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RagManagement } from './rag-management';

const formSchema = z.object({
  systemPrompt: z.string().min(10, {
    message: 'System prompt must be at least 10 characters.',
  }),
  exampleAnswers: z.array(z.object({ value: z.string().min(1, { message: 'Example cannot be empty.' }) })),
});

const testSchema = z.object({
    studentQuestion: z.string().min(5, {
        message: 'Test question must be at least 5 characters.'
    })
});

const defaultSystemPrompt = "You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting.";

export function TeacherDashboard() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: defaultSystemPrompt,
      exampleAnswers: [{ value: 'Instead of solving it for you, can you tell me what you\'ve tried so far?' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exampleAnswers",
  });

  const testForm = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: {
        studentQuestion: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const result = await customizeAiTeachingStyle({
          systemPrompt: values.systemPrompt,
          exampleGoodAnswers: values.exampleAnswers?.map(e => e.value).join('\n---\n')
      });
      console.log('Customization saved:', result);
      toast({
        title: "Settings Saved",
        description: "Your AI tutor customizations have been successfully saved.",
      });
    } catch(error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your customizations. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  async function onTest(values: z.infer<typeof testSchema>) {
    setIsTesting(true);
    setTestResult('');
    const currentSettings = form.getValues();
    const teacherExamples = currentSettings.exampleAnswers?.map(e => e.value).filter(e => e.trim() !== '') || [];

    try {
        const result = await generateGuidedResponse({
            studentQuestion: values.studentQuestion,
            teacherExamples: teacherExamples,
            systemPrompt: currentSettings.systemPrompt
        });
        setTestResult(result.aiResponse);
    } catch(error) {
        console.error(error);
        setTestResult('An error occurred while testing. Please check the console.');
        toast({
            variant: "destructive",
            title: "Test Failed",
            description: "Could not get a response from the AI. Please try again.",
        });
    } finally {
        setIsTesting(false);
    }
  }

  return (
    <div className="space-y-8">
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-headline font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome! Here you can shape the AI's personality and give it custom knowledge.</p>
        </div>

        <Tabs defaultValue="style" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-sm animate-fade-in-up">
            <TabsTrigger value="style"><Wand2 className="mr-2" /> AI Teaching Style</TabsTrigger>
            <TabsTrigger value="rag"><BrainCircuit className="mr-2" /> Custom Knowledge</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-up">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2">
                        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wand2 /> AI Personality</CardTitle>
                                <CardDescription>This is where you tell the AI how to act. Think of it as setting the classroom rules!</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="systemPrompt"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>System Prompt</FormLabel>
                                        <FormControl>
                                            <Textarea rows={8} placeholder="e.g., You are a friendly math tutor for 5th graders..." {...field} />
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

                        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles /> Answer Examples</CardTitle>
                                <CardDescription>Show the AI what a good response looks like. It learns from your examples.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <FormLabel>Example Good Answers</FormLabel>
                                    <div className="space-y-2">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`exampleAnswers.${index}.value`}
                                                    render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Example ${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove example">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ value: '' })}
                                    >
                                        Add Example
                                    </Button>
                                    <FormDescription>
                                        Show the AI what a good hint or guiding question looks like.
                                    </FormDescription>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Button type="submit" disabled={isSaving} size="lg" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Customizations
                        </Button>
                    </form>
                </Form>
                
                <div className="space-y-6 lg:sticky lg:top-24">
                    <Card className="bg-card/80 backdrop-blur-sm border-accent/20 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Test Your AI</CardTitle>
                            <CardDescription>See how the AI will respond with your current settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...testForm}>
                                <form onSubmit={testForm.handleSubmit(onTest)} className="space-y-4">
                                    <FormField
                                        control={testForm.control}
                                        name="studentQuestion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Student's Question</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="e.g., How do I solve for x in 2x + 5 = 15?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isTesting} className="w-full">
                                        {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Run Test
                                    </Button>
                                </form>
                            </Form>
                            { (isTesting || testResult) && <Separator className="my-6" />}
                            { testResult && (
                                <Alert>
                                    <Bot className="h-4 w-4" />
                                    <AlertTitle className="font-headline">AI Response</AlertTitle>
                                    <AlertDescription>
                                        <div className="prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
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
          
          <TabsContent value="rag">
              <RagManagement />
          </TabsContent>
        </Tabs>
    </div>
  );
}
