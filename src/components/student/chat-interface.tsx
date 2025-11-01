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
import { Bot, User, Send, BookCheck } from 'lucide-react';
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

/**
 * This component is shown only when a new chat is started (`chatId` is null).
 * It displays a welcome message and a dropdown menu for the user to select a subject.
 *
 * @param {object} props - Component properties.
 * @param {function} props.onSubjectSelect - A callback function that gets called when the user picks a subject.
 * @param {string | null} props.subject - The currently selected subject.
 * @param {SubjectData[]} props.availableSubjects - The list of subjects to show in the dropdown.
 * @param {string | null} props.userName - The name of the logged-in user.
 * @returns {JSX.Element} The UI for the new chat screen.
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
  }) => (
    <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fade-in-up'>
      <div className='p-3 rounded-full border-2 border-primary/20 bg-primary/10 mb-4 animate-scale-in'>
        <BookCheck className='h-10 w-10 text-primary' />
      </div>
      <h3 className='text-2xl font-headline text-foreground mb-2'>
        Ready for a new learning session, {userName || 'friend'}?
      </h3>
      <p className='max-w-md mb-6'>
        What subject are we diving into today? This helps me tailor my guidance.
      </p>

      {/* The dropdown menu component for subject selection */}
      <Select onValueChange={onSubjectSelect} value={subject || ''}>
        <SelectTrigger className='w-[280px]'>
          <SelectValue placeholder='Select a subject...' />
        </SelectTrigger>
        <SelectContent>
          {/* Loop over the available subjects and create a dropdown item for each one. */}
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
  ),
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
 *
 * C-like Analogy:
 * This is the `main()` function for the chat UI.
 *
 * Internal State (Variables):
 *   - `input`: The text currently in the message input box. (string)
 *   - `subject`: The subject selected for a new chat. (string or null)
 *   - `localLoadingText`: The "AI is thinking..." message, which cycles through different phrases. (string)
 *   - `availableSubjects`: The list of subjects the current student is eligible for.
 */
export function ChatInterface({
  chatId: currentChatId,
}: {
  chatId: string | null;
}) {
  // `useState` is a React Hook for declaring a state variable.
  // C-like analogy: `char* input = ""; void setInput(char* newValue) { ... }`
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [localLoadingText, setLocalLoadingText] = useState(
    getLoadingText(null),
  );
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  // Other hooks to get access to common utilities.
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Pointer to the scrollable message area.
  const inputRef = useRef<HTMLTextAreaElement>(null); // Pointer to the text input box.

  // This connects the UI component to the chat logic controller (`useChat`).
  // It returns the current state (`messages`, `isLoading`, `chatSubject`) and the
  // primary action function (`sendMessage`).
  const { messages, sendMessage, isLoading, chatSubject } =
    useChat(currentChatId);

  // Safety check: if `messages` is null (which can happen initially), use an empty array.
  const safeMessages = messages || [];

  // Determine the current subject. If a subject is selected for a new chat, use that.
  // Otherwise, use the subject from the existing chat session data.
  const currentSubject = subject || chatSubject;
  // Get the accent color for the current subject from our map.
  const chatAccentColor = currentSubject
    ? subjectColorMap.get(currentSubject) || 'hsl(var(--primary))'
    : 'hsl(var(--primary))';

  // This `useEffect` runs once when the component is first created.
  // Its job is to determine which subjects the current student should see in the dropdown.
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
  }, []); // The empty `[]` means this runs only once.

  // This `useEffect` hook automatically scrolls the chat window to the bottom
  // whenever a new message is added or when the AI starts/stops thinking.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current; // Get the element from our pointer.
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight, // Scroll to the very bottom.
        behavior: 'smooth', // Make it a smooth animation.
      });
    }
  }, [safeMessages, isLoading]); // It re-runs whenever `safeMessages` or `isLoading` changes.

  // This `useEffect` runs once to focus the text input box and initialize the Mermaid library.
  useEffect(() => {
    inputRef.current?.focus(); // Puts the text cursor in the message box.
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

  // This `useEffect` hook manages the "AI is thinking..." text.
  // It starts a timer to cycle through different fun loading messages.
  useEffect(() => {
    if (isLoading) {
      setLocalLoadingText(getLoadingText(currentSubject));
      const interval = setInterval(() => {
        setLocalLoadingText(getLoadingText(currentSubject));
      }, 2500);
      // Return a cleanup function. It runs when `isLoading` becomes false.
      // It stops the timer to prevent memory leaks.
      return () => clearInterval(interval);
    }
  }, [isLoading, currentSubject]); // It re-runs whenever `isLoading` or `currentSubject` changes.

  /**
   * Sends the user's message. Called when the user hits "Enter" or clicks the send button.
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return; // Don't send empty messages.

    // For new chats, a subject must be selected first.
    if (!currentChatId && !subject) {
      toast({
        variant: 'destructive',
        title: 'Please select a subject',
        description: 'You need to choose a subject before starting a new chat.',
      });
      return;
    }

    const currentInput = input;
    setInput(''); // Optimistically clear the input box for a responsive feel.

    // Call the `sendMessage` function from the `useChat` hook.
    await sendMessage(currentInput, subject);
  };

  // Wrapper to call `handleSendMessage` when the form is submitted.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevents the webpage from reloading.
    handleSendMessage();
  };

  // Handles keyboard input in the text area.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If the user presses "Enter" but NOT "Shift+Enter"...
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // ...prevent a new line from being added...
      handleSendMessage(); // ...and send the message instead.
    }
  };

  // ========================== RETURN JSX (The View) ==========================
  return (
    <div
      className='flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center'
      // Pass the accent color as a CSS variable for child components to use.
      style={{ '--chat-accent-color': chatAccentColor } as React.CSSProperties}
    >
      <div className='flex-grow w-full max-w-3xl mx-auto overflow-hidden'>
        <ScrollArea className='h-full' ref={scrollAreaRef}>
          <div className='p-4 sm:p-6 space-y-6'>
            {/* Conditional Rendering: If this is a new chat, show the NewChatView. */}
            {safeMessages.length === 0 && !currentChatId && (
              <NewChatView
                onSubjectSelect={setSubject}
                subject={subject}
                availableSubjects={availableSubjects}
                userName={userName}
              />
            )}

            {/* Loop over the messages and render a message bubble for each one. */}
            {safeMessages.map((message: Message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start gap-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                } animate-fade-in-up`}
              >
                {/* If the message is from the AI, show the Bot avatar. */}
                {message.role === 'assistant' && (
                  <Avatar className='h-8 w-8 border bg-card'>
                    <AvatarFallback className='bg-transparent'>
                      <Bot className='text-primary h-5 w-5' />
                    </AvatarFallback>
                  </Avatar>
                )}
                {/* The message bubble itself. */}
                <div
                  className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-[var(--chat-accent-color)]/20'
                      : 'bg-card/80 backdrop-blur-sm border'
                  }`}
                >
                  {/* If the message is from the assistant, render it using ReactMarkdown
                      so that formatting (bold, lists, and our custom code blocks) works. */}
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
                {/* If the message is from the user, show the User avatar. */}
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
            {/* If `isLoading` is true, show the "AI is thinking..." bubble. */}
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

      {/* The bottom part of the screen with the input box. */}
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
                ref={inputRef} // Attach our pointer to this element.
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !subject && !currentChatId && availableSubjects.length > 0
                    ? 'Please select a subject above to begin.'
                    : 'Message Lyra...'
                }
                className='flex-grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent'
                rows={1}
                disabled={
                  isLoading ||
                  (!subject && !currentChatId && availableSubjects.length > 0)
                } // Disable input while loading or if no subject is selected.
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
