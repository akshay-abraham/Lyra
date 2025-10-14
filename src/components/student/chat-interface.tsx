'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { Bot, User, CornerDownLeft, BookCheck, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '../layout/logo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { useFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const loadingTexts = [
    "Opening textbooks...",
    "Consulting with the great thinkers...",
    "Finding where Napoleon left his keys...",
    "Brewing some fresh ideas...",
    "Untangling a knot of knowledge...",
    "Asking the Oracle of Delphi...",
    "Shuffling the library cards...",
    "Polishing the crystal ball...",
];

const Mermaid = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    if (chartRef.current && chart) {
        mermaid.run({
            nodes: [chartRef.current],
        });
    }
  }, [chart]);

  return <div ref={chartRef} className="mermaid">{chart}</div>;
};

const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match && match[1];

    if (lang === 'mermaid') {
        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }

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

const subjects = ["Math", "Science", "History", "English", "Coding", "Other"];

export function ChatInterface({ chatId: currentChatId }: { chatId: string | null }) {
  const [messages, setMessages] = useState<WithId<Message>[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const [subject, setSubject] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const { firestore } = useFirebase();
  const { user } = useUser();

  // Data fetching for existing chat
  const messagesQuery = React.useMemo(() => {
    if (!user || !firestore || !currentChatId) return null;
    return collection(firestore, 'users', user.uid, 'chatSessions', currentChatId, 'messages');
  }, [user, firestore, currentChatId]);

  const { data: fetchedMessages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);


  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
    inputRef.current?.focus();
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', darkMode: true, themeVariables: {
        'background': '#020817',
        'primaryColor': '#09090b',
        'primaryTextColor': '#f8fafc',
        'lineColor': '#334155',
        'secondaryColor': '#020817',
        'tertiaryColor': '#1e293b'
    }});
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingText(prev => {
          const currentIndex = loadingTexts.indexOf(prev);
          return loadingTexts[(currentIndex + 1) % loadingTexts.length];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user || !firestore) return;

    let chatId = currentChatId;
    const currentInput = input;
    setInput('');

    // If this is the first message of a new chat
    if (!chatId) {
      if (!subject) {
        toast({
          variant: 'destructive',
          title: 'Please select a subject',
          description: 'You need to choose a subject before starting a new chat.',
        });
        setInput(currentInput);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Generate a title
        const titleResponse = await generateChatTitle({ firstMessage: currentInput });
        const newTitle = titleResponse.title;

        // 2. Create the chat session document
        const chatSessionRef = await addDoc(collection(firestore, 'users', user.uid, 'chatSessions'), {
          userId: user.uid,
          subject: subject,
          title: newTitle,
          startTime: serverTimestamp(),
        });
        chatId = chatSessionRef.id;

        // 3. Navigate to the new chat URL
        router.push(`/?chatId=${chatId}`);

      } catch (error) {
        console.error("Error creating new chat session:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat session.' });
        setIsLoading(false);
        setInput(currentInput);
        return;
      }
    }

    if (!chatId) return; // Should not happen, but for type safety

    const userMessage: Message = { role: 'user', content: currentInput };
    const messagesCol = collection(firestore, 'users', user.uid, 'chatSessions', chatId, 'messages');
    addDocumentNonBlocking(messagesCol, { ...userMessage, createdAt: serverTimestamp() });
    
    setMessages((prev) => [...prev, { ...userMessage, id: 'temp-user' }]);
    setIsLoading(true);

    try {
      const response = await generateAITutorResponse({
        problemStatement: currentInput,
      });

      if (response.tutorResponse) {
        const assistantMessage: Message = { role: 'assistant', content: response.tutorResponse };
        addDocumentNonBlocking(messagesCol, { ...assistantMessage, createdAt: serverTimestamp() });
        setMessages((prev) => [...prev.filter(m => m.id !== 'temp-user'), { ...assistantMessage, id: 'temp-ai' }]);
      } else {
        throw new Error("Failed to get a response from the AI tutor.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: "I seem to be having trouble connecting. Please try again in a moment." };
      addDocumentNonBlocking(messagesCol, { ...errorMessage, createdAt: serverTimestamp() });
      setMessages((prev) => [...prev.filter(m => m.id !== 'temp-user'), { ...errorMessage, id: 'temp-error' }]);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
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

  const NewChatView = () => (
     <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fade-in-up">
        <div className="p-3 rounded-full border-2 border-primary/20 bg-primary/10 mb-4 animate-scale-in" style={{animationDelay: '0.2s'}}>
          <BookCheck className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-headline text-foreground mb-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>Start a New Learning Session</h3>
        <p className="max-w-md mb-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>What subject are we diving into today? This helps me tailor my guidance.</p>
        
        <Select onValueChange={setSubject} value={subject || ""}>
          <SelectTrigger className="w-[280px] animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <SelectValue placeholder="Select a subject..." />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
    </div>
  );


  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center">
      <div className="flex-grow w-full max-w-3xl mx-auto overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 sm:p-6 space-y-6">
                  {(messages.length === 0 && !currentChatId) && <NewChatView />}

                  {messages.map((message, index) => (
                      <div key={message.id || index} className={`flex items-start gap-4 animate-fade-in-up ${message.role === 'user' ? 'justify-end' : ''}`}>
                          {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 border bg-card">
                                  <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                              </Avatar>
                          )}
                          <div className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${message.role === 'user' ? 'bg-primary/20' : 'bg-card/80 backdrop-blur-sm border'}`}>
                              {message.role === 'assistant' ? (
                                <div className="prose dark:prose-invert max-w-none prose-p:my-2">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                                      {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                          </div>
                          {message.role === 'user' && (
                              <Avatar className="h-8 w-8 border bg-card">
                                  <AvatarFallback className="bg-transparent"><User className="text-accent h-5 w-5"/></AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                  ))}
                  {isLoading && (
                      <div className="flex items-start gap-4 animate-fade-in-up">
                           <Avatar className="h-8 w-8 border bg-card">
                              <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                          </Avatar>
                          <div className="max-w-md rounded-lg p-3 bg-card/80 backdrop-blur-sm border flex items-center">
                              <p className="text-sm text-muted-foreground animate-fade-in">{loadingText}</p>
                          </div>
                      </div>
                  )}
              </div>
          </ScrollArea>
      </div>

      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
          <Card className={cn("shadow-lg animate-fade-in-up bg-card/80 backdrop-blur-sm", (isLoading || !subject && !currentChatId) ? "" : "animate-colorful-border")} style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-2">
                  <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                      <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={!subject && !currentChatId ? "Please select a subject above to begin." : "Message Lyra..."}
                          className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent animate-glow"
                          rows={1}
                          disabled={!subject && !currentChatId}
                      />
                      <Button type="submit" disabled={isLoading || !input.trim()} size="icon" aria-label="Submit message">
                          <CornerDownLeft className="h-4 w-4" />
                      </Button>
                  </form>
              </CardContent>
          </Card>
           <p className="text-xs text-center text-muted-foreground mt-2">Lyra can make mistakes. Consider checking important information with your teachers.</p>
      </div>
    </div>
  );
}
