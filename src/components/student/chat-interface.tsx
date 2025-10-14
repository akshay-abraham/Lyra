'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Logo } from '../layout/logo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAITutorResponse({
        problemStatement: currentInput,
        systemPrompt: "You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting.",
        exampleGoodAnswers: []
      });

      if (response.tutorResponse) {
        const assistantMessage: Message = { role: 'assistant', content: response.tutorResponse };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get a response from the AI tutor.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'assistant', content: "I seem to be having trouble connecting. Please try again in a moment." };
      setMessages((prev) => [...prev, errorMessage]);
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

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center">
      <div className="flex-grow w-full max-w-3xl mx-auto overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 sm:p-6 space-y-6">
                  {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20 animate-fade-in-up">
                          <div className="p-3 rounded-full border mb-4">
                            <Logo />
                          </div>
                          <h3 className="text-2xl font-semibold text-foreground">How can I help you today?</h3>
                      </div>
                  )}
                  {messages.map((message, index) => (
                      <div key={index} className={`flex items-start gap-4 animate-fade-in-up ${message.role === 'user' ? 'justify-end' : ''}`}>
                          {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 border bg-background">
                                  <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                              </Avatar>
                          )}
                          <div className={`max-w-xl rounded-lg p-3 text-sm transition-all duration-300 ${message.role === 'user' ? 'bg-primary/20' : 'bg-card/80 backdrop-blur-sm border'}`}>
                              {message.role === 'assistant' ? (
                                <div className="prose dark:prose-invert max-w-none prose-p:my-2">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                          </div>
                          {message.role === 'user' && (
                              <Avatar className="h-8 w-8 border bg-background">
                                  <AvatarFallback className="bg-transparent"><User className="text-accent h-5 w-5"/></AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                  ))}
                  {isLoading && (
                      <div className="flex items-start gap-4 animate-fade-in-up">
                           <Avatar className="h-8 w-8 border bg-background">
                              <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                          </Avatar>
                          <div className="max-w-md rounded-lg p-3 bg-secondary flex items-center">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                      </div>
                  )}
              </div>
          </ScrollArea>
      </div>

      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
          <Card className="shadow-lg animate-fade-in-up bg-card/80 backdrop-blur-sm" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-2">
                  <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                      <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Message Lyra..."
                          className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent"
                          rows={1}
                      />
                      <Button type="submit" disabled={isLoading || !input.trim()} size="icon" aria-label="Submit message">
                          <CornerDownLeft className="h-4 w-4" />
                      </Button>
                  </form>
              </CardContent>
          </Card>
           <p className="text-xs text-center text-muted-foreground mt-2">Lyra can make mistakes. Consider checking important information.</p>
      </div>
    </div>
  );
}
