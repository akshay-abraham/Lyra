// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Chat Interface Component (`chat-interface.tsx`)
 *
 * C-like Analogy:
 * This file defines the main user interface for the chat screen.
 * Think of this as the `main()` function for the chat window. It's responsible for:
 * 1.  Displaying the chat messages.
 * 2.  Showing a text input box for the user to type in.
 * 3.  Handling the "send" button press.
 * 4.  Showing a "loading" indicator when the AI is thinking.
 * 5.  Showing a "new chat" screen where the user selects a subject.
 *
 * It uses a "custom hook" called `useChat` (defined in `src/hooks/use-chat.ts`)
 * to handle all the complex logic like sending messages to the server and
 * receiving responses. This component focuses only on the "View" part of the app,
 * following a Model-View-Controller like pattern where `useChat` is the Controller.
 */
'use client'

// Like `#include` in C, these lines import necessary code from other files.
import React, {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, CornerDownLeft, BookCheck } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useChat } from '@/hooks/use-chat'
import { useToast } from '@/hooks/use-toast'
import { getLoadingText } from '@/lib/loading-texts'
import {
  getSubjectsForUser,
  type SubjectData,
  allSubjects,
} from '@/lib/subjects-data'

/**
 * C-like Explanation: Mermaid Component
 *
 * This is a small helper component, like a utility function.
 * Its only job is to render diagrams using the Mermaid library.
 * The AI can generate text in the Mermaid format, and this component
 * turns that text into a visual diagram.
 *
 * `React.memo` is an optimization. It's like saying: "If the inputs (props) to this
 * function haven't changed, don't bother re-running it. Just use the last result."
 * This saves processing time for static diagrams.
 *
 * function Mermaid(props):
 *     // props is like a C struct: struct { char* chart; }
 *     - Takes a string `chart` as input.
 *     - Renders it as a diagram.
 *     - Returns a special `div` element for the diagram.
 */
const Mermaid = React.memo(({ chart }: { chart: string }) => {
  // `useRef` is like creating a pointer to an element on the screen.
  const chartRef = useRef<HTMLDivElement>(null)

  // `useEffect` is a special React function that runs code *after* the component
  // has been rendered to the screen. It's useful for interacting with browser APIs.
  // Think of it as a function that gets called automatically at a specific time.
  useEffect(() => {
    // Initialize the mermaid library.
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
    // If the pointer to our screen element is valid and we have a chart string...
    if (chartRef.current && chart) {
      // ...tell mermaid to find that element and render the diagram inside it.
      mermaid.run({
        nodes: [chartRef.current],
      })
    }
  }, [chart]) // This function re-runs only if the `chart` string changes.

  // This is JSX, which looks like HTML. It returns the visual element.
  // The `ref={chartRef}` part is how we connect our `pointer` to this specific `div`.
  return (
    <div ref={chartRef} className='mermaid'>
      {chart}
    </div>
  )
})
Mermaid.displayName = 'Mermaid'

/**
 * C-like Explanation: CodeBlock Component
 *
 * Another small helper component. Its job is to decide how to display
 * code blocks in the AI's response.
 * If the code is a 'mermaid' diagram, it uses our `Mermaid` component.
 * Otherwise, it just displays it as regular formatted code.
 *
 * function CodeBlock(props):
 *     // props is like a C struct: struct { char* language; char* code_text; }
 *     - Checks the `language` of the code block.
 *     - If `language` is "mermaid", use the `Mermaid` component.
 *     - Otherwise, return a standard `<code>` element.
 */
const CodeBlock: React.FC<any> = ({
  node,
  inline,
  className,
  children,
  ...props
}) => {
  // This uses regular expressions (regex) to find the language name, e.g., "language-javascript".
  const match = /language-(\w+)/.exec(className || '')
  const lang = match && match[1]

  // If the language is 'mermaid', render the special Mermaid component.
  if (lang === 'mermaid') {
    // The `children` prop contains the actual code string.
    return <Mermaid chart={String(children).replace(/\n$/, '')} />
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
  )
}
CodeBlock.displayName = 'CodeBlock'

/**
 * C-like Explanation: NewChatView Component
 *
 * This component is shown only when a new chat is started.
 * It's a simple view with a welcome message and a dropdown menu
 * for the user to select a subject.
 *
 * function NewChatView(props):
 *    // props is a struct: struct { function_pointer onSubjectSelect; char* subject; SubjectData[] availableSubjects; }
 *    - `onSubjectSelect` is a callback function. It gets called when the user picks a subject.
 *    - `subject` is the currently selected subject.
 *    - `availableSubjects` is the list of subjects to show in the dropdown.
 *    - Returns the JSX for the welcome screen.
 */
const NewChatView = React.memo(
  ({
    onSubjectSelect,
    subject,
    availableSubjects,
  }: {
    onSubjectSelect: (subject: string) => void
    subject: string | null
    availableSubjects: SubjectData[]
  }) => (
    <div className='flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fade-in-up'>
      <div className='p-3 rounded-full border-2 border-primary/20 bg-primary/10 mb-4 animate-scale-in'>
        <BookCheck className='h-10 w-10 text-primary' />
      </div>
      <h3 className='text-2xl font-headline text-foreground mb-2'>
        Start a New Learning Session
      </h3>
      <p className='max-w-md mb-6'>
        What subject are we diving into today? This helps me tailor my guidance.
      </p>

      {/* This is the dropdown menu component */}
      <Select onValueChange={onSubjectSelect} value={subject || ''}>
        <SelectTrigger className='w-[280px]'>
          <SelectValue placeholder='Select a subject...' />
        </SelectTrigger>
        <SelectContent>
          {/*
                  This is like a `for` loop in C. It iterates over the `availableSubjects` array.
                  for (int i = 0; i < availableSubjects.length; i++) {
                      // Create a dropdown menu item for each subject.
                  }
                */}
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
)
NewChatView.displayName = 'NewChatView'

// This is like a constant key-value map or a hash table.
// It maps a subject's name (string) to its color (string).
// Used to style the chat bubbles based on the subject.
const subjectColorMap = new Map<string, string>(
  allSubjects.map((s) => [s.name, s.color]),
)

/**
 * =================================================================================
 * MAIN CHAT INTERFACE COMPONENT
 * C-like Explanation: `function ChatInterface(props) -> returns JSX_Element`
 *
 * This is the main component function for the chat UI.
 *
 * Props (Inputs):
 *   - `chatId`: A string representing the ID of the current chat session. If it's `null`,
 *     it means this is a new chat. This is passed from the main page (`page.tsx`).
 *
 * Internal State (Variables):
 *   - `input`: The text currently in the message input box. (string)
 *   - `subject`: The subject selected for a new chat. (string or null)
 *   - `localLoadingText`: The "AI is thinking..." message. (string)
 *   - `availableSubjects`: The list of subjects for the student. (array of SubjectData structs)
 *
 * Hooks (Special Functions):
 *   - `useChat`: This is a powerful custom hook. It's like a dedicated library or module
 *     that manages all the chat logic: fetching messages from the database, sending new
 *     messages, and handling the loading state. It returns the current `messages`, a
 *     `sendMessage` function, and the `isLoading` status.
 * =================================================================================
 */
export function ChatInterface({
  chatId: currentChatId,
}: {
  chatId: string | null
}) {
  // `useState` is a React Hook. It's how you declare a variable whose changes
  // will cause the UI to re-render.
  // C-like analogy: `char* input = ""; void setInput(char* newValue) { ... }`
  // `input` is the variable, `setInput` is the function to change it.
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState<string | null>(null)
  const [localLoadingText, setLocalLoadingText] = useState(getLoadingText(null))
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([])

  // These are calls to other hooks to get access to common utilities.
  const { toast } = useToast() // For showing pop-up notifications.
  const scrollAreaRef = useRef<HTMLDivElement>(null) // Pointer to the scrollable message area.
  const inputRef = useRef<HTMLTextAreaElement>(null) // Pointer to the text input box.

  // This is the most important hook call. It connects this UI component to the chat logic.
  // It gives us back a struct of data and functions: `{ messages, sendMessage, isLoading, chatSubject }`
  const { messages, sendMessage, isLoading, chatSubject } =
    useChat(currentChatId)

  // If `messages` is null (which can happen initially), we use an empty array
  // to avoid errors. This is a safety check.
  // `const safeMessages = (messages != NULL) ? messages : create_empty_array();`
  const safeMessages = messages || []

  // Determine the current subject. If a subject is selected for a new chat, use that.
  // Otherwise, use the subject from the existing chat session.
  const currentSubject = subject || chatSubject
  // Get the accent color for the current subject from our map. Default to primary color if not found.
  const chatAccentColor = currentSubject
    ? subjectColorMap.get(currentSubject) || 'hsl(var(--primary))'
    : 'hsl(var(--primary))'

  // `useEffect` runs code after rendering. This one runs only once when the component is first created.
  // Its job is to figure out which subjects the current student should see.
  useEffect(() => {
    // PSEUDOCODE:
    // void onComponentMount() {
    //   try {
    //     string userInfoJson = sessionStorage.getItem("lyra-user-info");
    //     if (userInfoJson exists) {
    //       UserInfo userInfo = parseJson(userInfoJson);
    //       SubjectData[] subjects = getSubjectsForUser(userInfo.role, userInfo.class);
    //       setAvailableSubjects(subjects);
    //     } else {
    //       // If no user info, show all subjects as a fallback.
    //       setAvailableSubjects(getSubjectsForUser(null, null));
    //     }
    //   } catch (error) {
    //     // Fallback in case of any error.
    //     setAvailableSubjects(getSubjectsForUser(null, null));
    //   }
    // }
    try {
      const userInfoStr = sessionStorage.getItem('lyra-user-info')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        setAvailableSubjects(getSubjectsForUser(userInfo.role, userInfo.class))
      } else {
        setAvailableSubjects(getSubjectsForUser(null, null))
      }
    } catch (e) {
      setAvailableSubjects(getSubjectsForUser(null, null))
    }
  }, []) // The empty `[]` means this runs only once.

  // This `useEffect` hook's job is to automatically scroll the chat window
  // to the bottom whenever a new message is added or when the AI starts typing.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current // Get the element from our pointer.
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight, // Scroll to the very bottom.
        behavior: 'smooth', // Make it a smooth animation.
      })
    }
  }, [safeMessages, isLoading]) // It re-runs whenever `safeMessages` or `isLoading` changes.

  // This `useEffect` runs only once. It focuses the text input box and initializes the Mermaid library.
  useEffect(() => {
    inputRef.current?.focus() // Puts the cursor in the textbox.
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
    })
  }, [])

  // This `useEffect` hook manages the "AI is thinking..." text.
  // It starts a timer to cycle through different fun loading messages.
  useEffect(() => {
    // If the AI is currently loading a response...
    if (isLoading) {
      // Set an initial loading text.
      setLocalLoadingText(getLoadingText(currentSubject))
      // ...then start a timer (interval) that changes the text every 2.5 seconds.
      const interval = setInterval(() => {
        setLocalLoadingText(getLoadingText(currentSubject))
      }, 2500)
      // This `return` is a cleanup function. It's like `free()` in C.
      // It runs when the component is removed or when `isLoading` becomes false.
      // It stops the timer to prevent memory leaks.
      return () => clearInterval(interval)
    }
  }, [isLoading, currentSubject]) // It re-runs whenever `isLoading` or `currentSubject` changes.

  /**
   * C-like Explanation: `async function handleSendMessage()`
   *
   * This function is called when the user hits "Enter" or clicks the send button.
   *
   * PSEUDOCODE:
   * 1.  Check if the input box is empty. If so, do nothing (`return`).
   * 2.  Check if this is a brand new chat (`currentChatId` is null) AND the user
   *     hasn't selected a subject yet. If so, show an error toast and stop.
   * 3.  Store the current input text in a temporary variable.
   * 4.  Clear the input box on the screen immediately for a responsive feel. `setInput("")`.
   * 5.  Call the `sendMessage` function from our `useChat` hook, passing it the
   *     user's message and the selected subject. This is an `async` call, meaning
   *     it runs in the background. We `await` it to wait for it to finish.
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return

    if (!currentChatId && !subject) {
      toast({
        variant: 'destructive',
        title: 'Please select a subject',
        description: 'You need to choose a subject before starting a new chat.',
      })
      return
    }

    const currentInput = input
    setInput('')

    await sendMessage(currentInput, subject)
  }

  // This function is a simple wrapper to call `handleSendMessage` when the form is submitted.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault() // Prevents the webpage from reloading, which is the default form behavior.
    handleSendMessage()
  }

  // This function handles keyboard input in the text area.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If the user presses "Enter" but NOT "Shift+Enter"...
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // ...prevent a new line from being added...
      handleSendMessage() // ...and send the message instead.
    }
  }

  // ========================== RETURN JSX (The View) ==========================
  // The rest of this file is the JSX code that describes what the component looks like.
  // It's a declarative way to write HTML.
  return (
    <div
      className='flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center'
      // This is a clever trick to pass a CSS variable from React to the CSS file.
      style={{ '--chat-accent-color': chatAccentColor } as React.CSSProperties}
    >
      <div className='flex-grow w-full max-w-3xl mx-auto overflow-hidden'>
        {/* This is the scrollable area for messages. */}
        <ScrollArea className='h-full' ref={scrollAreaRef}>
          <div className='p-4 sm:p-6 space-y-6'>
            {/*
                    Conditional Rendering:
                    IF (there are no messages AND it's a new chat) THEN {
                      Show the `NewChatView` component.
                    }
                  */}
            {safeMessages.length === 0 && !currentChatId && (
              <NewChatView
                onSubjectSelect={setSubject}
                subject={subject}
                availableSubjects={availableSubjects}
              />
            )}

            {/*
                    This is a `for` loop to display each message.
                    for (int i = 0; i < safeMessages.length; i++) {
                        Message message = safeMessages[i];
                        // create a `div` for the message bubble...
                    }
                  */}
            {safeMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''} animate-fade-in-up`}
              >
                {/* If the message is from the 'assistant', show the Bot avatar. */}
                {message.role === 'assistant' && (
                  <Avatar className='h-8 w-8 border bg-card'>
                    <AvatarFallback className='bg-transparent'>
                      <Bot className='text-primary h-5 w-5' />
                    </AvatarFallback>
                  </Avatar>
                )}
                {/* This is the message bubble itself. */}
                <div
                  className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${message.role === 'user' ? 'bg-[var(--chat-accent-color)]/20' : 'bg-card/80 backdrop-blur-sm border'}`}
                >
                  {/*
                                If the message is from the assistant, render it using ReactMarkdown
                                so that formatting (like bold, lists, and our custom code blocks) works.
                                Otherwise, just display the plain text content.
                              */}
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
                {/* If the message is from the 'user', show the User avatar. */}
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

      {/* This is the bottom part of the screen with the input box. */}
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
                onChange={(e) => setInput(e.target.value)} // Update the `input` state variable on every keystroke.
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
                <CornerDownLeft className='h-4 w-4' />
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
  )
}
