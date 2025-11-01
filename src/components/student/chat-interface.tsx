// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Chat Interface Component (`chat-interface.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the main user interface for the student's chat screen.
 * It is a "controller" component that brings together the data, state management,
 * and UI for the chat functionality.
 *
 * Core Responsibilities:
 * 1.  **Displaying Messages:** Renders the list of messages from the user and the AI.
 * 2.  **Input Handling:** Provides a text area for the user to type their message and a send button.
 * 3.  **New Chat State:** Shows a "new chat" screen where the user must first select a subject.
 * 4.  **Loading Indicator:** Displays an animated "AI is thinking..." message while waiting for a response.
 * 5.  **Markdown & Diagram Rendering:** Correctly formats the AI's responses, including
 *     rendering Markdown for text formatting and MermaidJS for diagrams.
 *
 * It uses a powerful custom hook, `useChat` (from `@/hooks/use-chat.ts`),
 * to handle all the complex back-end logic. This component's main job is to manage
 * the "View" and connect user interactions (like clicking "send") to the logic
 * handled by the `useChat` hook. This separation of concerns follows a
 * Model-View-Controller like pattern, where `ChatInterface` is the View and `useChat`
 * is the Controller.
 */
'use client';

// Import necessary React hooks, UI components, and utilities.
import React, {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, BookCheck, LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Library to render Markdown text.
import remarkGfm from 'remark-gfm'; // Plugin for GitHub Flavored Markdown (tables, etc.).
import mermaid from 'mermaid'; // Library to render diagrams from text.
import { cn } from '@/lib/utils'; // Utility for combining CSS classes.
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useChat } from '@/hooks/use-chat'; // The main logic controller for the chat.
import { useToast } from '@/hooks/use-toast';
import { getLoadingText } from '@/lib/loading-texts';
import {
  getSubjectsForUser,
  type SubjectData,
  allSubjects,
} from '@/lib/subjects-data';
import type { Message } from '@/types';

/**
 * A specialized component to render Mermaid diagrams from a string.
 * The AI can generate text in the Mermaid format (e.g., `graph TD; A-->B;`),
 * and this component will turn that text into a visual diagram.
 *
 * @param {object} props - Component properties.
 * @param {string} props.chart - The Mermaid definition string.
 * @returns {JSX.Element} A div that will contain the rendered diagram.
 *
 * `React.memo` is an optimization. It's like saying: "If the `chart` string hasn't
 * changed, don't bother re-running this component's logic. Just use the last result."
 * This is efficient for static diagrams.
 */
const Mermaid = React.memo(({ chart }: { chart: string }) => {
  // `useRef` is like creating a pointer to a specific element on the screen.
  const chartRef = useRef<HTMLDivElement>(null);

  // `useEffect` runs code *after* the component has been rendered to the screen.
  // It's the correct place to interact with browser APIs or external libraries like Mermaid.
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    // If our pointer to the screen element is valid and we have a chart string...
    if (chartRef.current && chart) {
      // ...tell mermaid to find that element and render the diagram inside it.
      mermaid.run({
        nodes: [chartRef.current],
      });
    }
  }, [chart]); // This function re-runs only if the `chart` string changes.

  // This JSX returns the visual element. The `ref={chartRef}` part is how we
  // connect our `pointer` to this specific `div`.
  return (
    <div ref={chartRef} className='mermaid'>
      {chart}
    </div>
  );
});
Mermaid.displayName = 'Mermaid';

/**
 * A custom renderer for code blocks within the AI's Markdown response.
 * It checks if the code block is a Mermaid diagram and, if so, uses the `Mermaid`
 * component to render it. Otherwise, it renders it as standard pre-formatted code.
 *
 * @param {object} props - Props passed by `ReactMarkdown`. Includes language and code content.
 * @returns {JSX.Element} The rendered code block or diagram.
 */
const CodeBlock: React.FC<any> = ({
  node,
  inline,
  className,
  children,
  ...props
}) => {
  // Use a regular expression to extract the language name from the className
  // (e.g., "language-javascript" becomes "javascript").
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1];

  // If the language is 'mermaid', render our special Mermaid component.
  if (lang === 'mermaid') {
    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
  }

  // For any other language, render it inside a standard HTML `<code>` tag for styling.
  return !inline && match ? (
    <code className={className} {...props}>
      {children}
    </code>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
CodeBlock.displayName = 'CodeBlock';

const AnimatedSubjectIcon = ({
  Icon,
  subject,
}: {
  Icon: LucideIcon;
  subject: SubjectData | null;
}) => {
  if (!subject) return null;

  const animationClass = () => {
    switch (subject.name) {
      case 'Maths':
      case 'Maths Core':
      case 'Applied Maths':
        return 'animate-[spin_2s_ease-in-out]';
      case 'Science':
      case 'Physics':
      case 'Chemistry':
        return 'animate-[spin_4s_linear_infinite]';
      case 'Biology':
        return 'animate-[heartbeat_1.5s_ease-in-out_infinite]';
      case 'Computer Science':
      case 'AI':
        return 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]';
      default:
        return 'animate-bounce-in';
    }
  };

  return (
    <div
      key={subject.name}
      className='absolute inset-0 flex items-center justify-center -z-10'
    >
      <Icon
        className={`h-48 w-48 text-primary/5 ${animationClass()}`}
        style={{ color: subject.color, opacity: 0.1 }}
        strokeWidth={1}
      />
    </div>
  );
};
AnimatedSubjectIcon.displayName = 'AnimatedSubjectIcon';

/**
 * This component is shown only when a new chat is started (`chatId` is null).
 * It displays a welcome message and a dropdown menu for the user to select a subject.
 */
const NewChatView = React.memo(
  ({
    onSubjectSelect,
    subject,
    availableSubjects,
    userName,
  }: {
    onSubjectSelect: (subject: string) => void;
    subject: string | null;
    availableSubjects: SubjectData[];
    userName: string | null;
  }) => {
    const selectedSubjectData =
      allSubjects.find((s) => s.name === subject) || null;
    const Icon = selectedSubjectData?.icon || BookCheck;

    return (
      <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fade-in-up relative overflow-hidden'>
        {selectedSubjectData && (
          <AnimatedSubjectIcon
            Icon={selectedSubjectData.icon}
            subject={selectedSubjectData}
          />
        )}
        <div className='p-3 rounded-full border-2 border-primary/20 bg-primary/10 mb-4 animate-scale-in'>
          <Icon className='h-8 w-8 text-primary' />
        </div>
        <h3 className='text-xl font-headline text-foreground mb-2'>
          Ready for a new learning session, {userName || 'friend'}?
        </h3>
        <p className='max-w-md mb-6 text-sm'>
          What are we diving into? This helps me tailor my guidance.
        </p>

        <Select onValueChange={onSubjectSelect} value={subject || ''}>
          <SelectTrigger className='w-[280px]'>
            <SelectValue placeholder='Select a subject...' />
          </SelectTrigger>
          <SelectContent>
            {availableSubjects.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                <div className='flex items-center gap-2'>
                  <s.icon className='h-4 w-4' style={{ color: s.color }} />
                  <span>{s.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);
NewChatView.displayName = 'NewChatView';

// A key-value map to associate a subject's name with its accent color.
// Used to style the chat bubbles based on the subject.
const subjectColorMap = new Map<string, string>(
  allSubjects.map((s) => [s.name, s.color]),
);

/**
 * The main component for the chat interface.
 *
 * @param {object} props - Component properties.
 * @param {string | null} props.chatId - The ID of the current chat session. If it's `null`,
 *   it means this is a new chat.
 * @returns {JSX.Element} The rendered chat interface.
 */
export function ChatInterface({
  chatId: currentChatId,
}: {
  chatId: string | null;
}) {
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [localLoadingText, setLocalLoadingText] = useState(
    getLoadingText(null),
  );
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isLoading, chatSubject } =
    useChat(currentChatId);

  const safeMessages = messages || [];

  const currentSubject = subject || chatSubject;
  const chatAccentColor = currentSubject
    ? subjectColorMap.get(currentSubject) || 'hsl(var(--primary))'
    : 'hsl(var(--primary))';

  useEffect(() => {
    try {
      const userInfoStr = sessionStorage.getItem('lyra-user-info');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setAvailableSubjects(getSubjectsForUser(userInfo.role, userInfo.class));
        setUserName(userInfo.name);
      } else {
        setAvailableSubjects(getSubjectsForUser(null, null)); // Fallback
      }
    } catch (e) {
      setAvailableSubjects(getSubjectsForUser(null, null)); // Fallback on error
    }
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [safeMessages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = 'auto'; // Reset height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      darkMode: true,
      themeVariables: {
        background: '#020817',
        primaryColor: '#09090b',
        primaryTextColor: '#f8fafc',
        lineColor: '#334155',
        secondaryColor: '#020817',
        tertiaryColor: '#1e293b',
      },
    });
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLocalLoadingText(getLoadingText(currentSubject));
      const interval = setInterval(() => {
        setLocalLoadingText(getLoadingText(currentSubject));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading, currentSubject]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!currentChatId && !subject) {
      toast({
        variant: 'destructive',
        title: 'Please select a subject',
        description: 'You need to choose a subject before starting a new chat.',
      });
      return;
    }

    const currentInput = input;
    setInput('');

    await sendMessage(currentInput, subject);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className='flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center'
      style={{ '--chat-accent-color': chatAccentColor } as React.CSSProperties}
    >
      <div className='flex-grow w-full max-w-3xl mx-auto overflow-hidden'>
        <ScrollArea className='h-full' ref={scrollAreaRef}>
          <div className='p-4 sm:p-6 space-y-6'>
            {safeMessages.length === 0 && !currentChatId && (
              <NewChatView
                onSubjectSelect={setSubject}
                subject={subject}
                availableSubjects={availableSubjects}
                userName={userName}
              />
            )}

            {safeMessages.map((message: Message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start gap-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                } animate-fade-in-up`}
              >
                {message.role === 'assistant' && (
                  <Avatar className='h-8 w-8 border bg-card'>
                    <AvatarFallback className='bg-transparent'>
                      <Bot className='text-primary h-5 w-5' />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-[var(--chat-accent-color)]/20'
                      : 'bg-card/80 backdrop-blur-sm border'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className='prose dark:prose-invert max-w-none prose-p:my-2'>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{ code: CodeBlock }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className='whitespace-pre-wrap'>{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className='h-8 w-8 border bg-card'>
                    <AvatarFallback className='bg-transparent'>
                      <User
                        className='h-5 w-5'
                        style={{ color: 'var(--chat-accent-color)' }}
                      />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className='flex items-start gap-4 animate-fade-in-up'>
                <Avatar className='h-8 w-8 border bg-card'>
                  <AvatarFallback className='bg-transparent'>
                    <Bot className='text-primary h-5 w-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='max-w-md rounded-lg p-3 bg-card/80 backdrop-blur-sm border flex items-center'>
                  <p className='text-sm text-muted-foreground'>
                    {localLoadingText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className='w-full max-w-3xl mx-auto p-4 sm:p-6'>
        <Card
          className={cn(
            'shadow-lg bg-card/80 backdrop-blur-sm',
            isLoading ||
              (!subject && !currentChatId && availableSubjects.length > 0)
              ? ''
              : '',
          )}
        >
          <CardContent className='p-2'>
            <form
              onSubmit={handleSubmit}
              className='w-full flex items-center gap-2'
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !subject && !currentChatId && availableSubjects.length > 0
                    ? 'Please select a subject above to begin.'
                    : 'Message Lyra...'
                }
                className='flex-grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent max-h-48'
                rows={1}
                disabled={
                  isLoading ||
                  (!subject && !currentChatId && availableSubjects.length > 0)
                }
              />
              <Button
                type='submit'
                disabled={isLoading || !input.trim()}
                size='icon'
                aria-label='Submit message'
              >
                <Send className='h-4 w-4' />
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className='text-xs text-center text-muted-foreground mt-2'>
          Lyra can make mistakes. Consider checking important information with
          your teachers.
        </p>
      </div>
    </div>
  );
}
