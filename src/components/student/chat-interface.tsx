
'use client';

import React, { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, CornerDownLeft, BookCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useChat } from '@/hooks/use-chat';
import { useToast } from "@/hooks/use-toast";
import { getLoadingText } from '@/lib/loading-texts';
import { getSubjectsForUser, type SubjectData, allSubjects } from '@/lib/subjects-data';


const Mermaid = ({ chart }: { chart: string }) => {
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

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
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

const NewChatView = React.memo(({ onSubjectSelect, subject, availableSubjects }: { onSubjectSelect: (subject: string) => void, subject: string | null, availableSubjects: SubjectData[] }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fade-in-up">
        <div className="p-3 rounded-full border-2 border-primary/20 bg-primary/10 mb-4 animate-scale-in">
            <BookCheck className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-headline text-foreground mb-2">Start a New Learning Session</h3>
        <p className="max-w-md mb-6">What subject are we diving into today? This helps me tailor my guidance.</p>
        
        <Select onValueChange={onSubjectSelect} value={subject || ""}>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a subject..." />
            </SelectTrigger>
            <SelectContent>
                {availableSubjects.map(s => (
                    <SelectItem key={s.name} value={s.name}>
                        <div className="flex items-center gap-2">
                           <s.icon className="h-4 w-4" style={{ color: s.color }}/>
                           <span>{s.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
));
NewChatView.displayName = 'NewChatView';

const subjectColorMap = new Map<string, string>(allSubjects.map(s => [s.name, s.color]));

export function ChatInterface({ chatId: currentChatId }: { chatId: string | null }) {
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [localLoadingText, setLocalLoadingText] = useState(getLoadingText(null));
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isLoading, chatSubject } = useChat(currentChatId);
  const safeMessages = messages || [];
  const currentSubject = subject || chatSubject;
  const chatAccentColor = currentSubject ? subjectColorMap.get(currentSubject) || 'hsl(var(--primary))' : 'hsl(var(--primary))';

  useEffect(() => {
    const userInfoStr = sessionStorage.getItem('lyra-user-info');
    if(userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setAvailableSubjects(getSubjectsForUser(userInfo.role, userInfo.grade));
    } else {
       setAvailableSubjects(getSubjectsForUser('guest', null));
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
      // Set initial loading text right away
      setLocalLoadingText(getLoadingText(currentSubject));
      // Then cycle through more every few seconds
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
        className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center"
        style={{ '--chat-accent-color': chatAccentColor } as React.CSSProperties}
    >
      <div className="flex-grow w-full max-w-3xl mx-auto overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 sm:p-6 space-y-6">
                  {(safeMessages.length === 0 && !currentChatId) && <NewChatView onSubjectSelect={setSubject} subject={subject} availableSubjects={availableSubjects} />}

                  {safeMessages.map((message, index) => (
                      <div key={message.id || index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''} animate-fade-in-up`}>
                          {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 border bg-card">
                                  <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                              </Avatar>
                          )}
                          <div className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${message.role === 'user' ? 'bg-[var(--chat-accent-color)]/20' : 'bg-card/80 backdrop-blur-sm border'}`}>
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
                                  <AvatarFallback className="bg-transparent"><User className="h-5 w-5" style={{ color: 'var(--chat-accent-color)' }}/></AvatarFallback>
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
                              <p className="text-sm text-muted-foreground">{localLoadingText}</p>
                          </div>
                      </div>
                  )}
              </div>
          </ScrollArea>
      </div>

      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
          <Card className={cn("shadow-lg bg-card/80 backdrop-blur-sm", (isLoading || (!subject && !currentChatId) && availableSubjects.length > 0) ? "" : "")} >
              <CardContent className="p-2">
                  <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                      <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={(!subject && !currentChatId && availableSubjects.length > 0) ? "Please select a subject above to begin." : "Message Lyra..."}
                          className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent"
                          rows={1}
                          disabled={isLoading || ((!subject && !currentChatId) && availableSubjects.length > 0)}
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
