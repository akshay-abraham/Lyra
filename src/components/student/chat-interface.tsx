'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  
  const rubberDuckImage = PlaceHolderImages.find(img => img.id === 'rubber-duck');

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);
  
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
        systemPrompt: "You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging.",
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
    <div className="flex flex-col-reverse lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-4">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        The Smart Duck
                        <span className="text-sm font-body font-normal text-muted-foreground">(your new best friend)</span>
                    </CardTitle>
                    <CardDescription>A better way to debug your thoughts.</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    {rubberDuckImage && (
                        <Image 
                            src={rubberDuckImage.imageUrl}
                            alt={rubberDuckImage.description}
                            width={600}
                            height={400}
                            className="rounded-lg mb-4 w-full aspect-[3/2] object-cover"
                            data-ai-hint={rubberDuckImage.imageHint}
                        />
                    )}
                    <p className="mb-2">Stuck on a problem? Try explaining it to me, step-by-step.</p>
                    <p>This method is inspired by "Rubber Duck Debugging." The act of verbalizing your thoughts can often unlock the solution.</p>
                    <p className="mt-2">I'll listen patiently and ask questions to guide you, but I won't give you the answer directly.</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:w-2/3">
            <Card className="h-[75vh] flex flex-col shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Talk to Lyra</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0 overflow-hidden">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                        <div className="p-6 space-y-6">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                    <Bot className="h-16 w-16 mb-4 text-primary/50" />
                                    <h3 className="text-lg font-semibold text-foreground">What problem are you trying to solve?</h3>
                                    <p className="mt-1">Describe it in your own words, and I'll help you think through it.</p>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'assistant' && (
                                        <Avatar className="h-8 w-8 border bg-background">
                                            <AvatarFallback className="bg-transparent"><Bot className="text-primary h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-xl rounded-lg p-3 shadow-sm text-sm ${message.role === 'user' ? 'bg-primary/20' : 'bg-secondary'}`}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="h-8 w-8 border bg-background">
                                            <AvatarFallback className="bg-transparent"><User className="text-accent h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
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
                </CardContent>
                <CardFooter className="p-4 border-t bg-background/95">
                    <form onSubmit={handleSubmit} className="w-full flex items-start gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Explain your problem here..."
                            className="flex-grow resize-none"
                            rows={1}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="icon" aria-label="Submit message">
                            <CornerDownLeft className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
