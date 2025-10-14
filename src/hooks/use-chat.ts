
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(chatId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'chatSessions', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [user, firestore, chatId]);

  const { data: messages = [], error: messagesError } = useCollection<Message>(messagesQuery);
    
  useEffect(() => {
    if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        toast({
            variant: "destructive",
            title: "Error loading chat",
            description: "There was a problem fetching the chat history.",
        });
    }
  }, [messagesError, toast]);


  const sendMessage = useCallback(async (content: string, subject: string | null) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
      return;
    }

    setIsLoading(true);

    let currentChatId = chatId;

    try {
      // If this is a new chat, create it first
      if (!currentChatId) {
        if (!subject) {
          toast({ variant: 'destructive', title: 'Error', description: 'Subject is required for a new chat.' });
          setIsLoading(false);
          return;
        }

        const titleResponse = await generateChatTitle({ firstMessage: content });
        const newTitle = titleResponse.title || 'New Chat';

        const chatSessionRef = await addDoc(collection(firestore, 'users', user.uid, 'chatSessions'), {
          userId: user.uid,
          subject: subject,
          title: newTitle,
          startTime: serverTimestamp(),
        });

        currentChatId = chatSessionRef.id;
        router.push(`/?chatId=${currentChatId}`, { scroll: false });
      }

      if (!currentChatId) {
        throw new Error("Failed to create or identify chat session.");
      }
      
      const messagesCol = collection(firestore, 'users', user.uid, 'chatSessions', currentChatId, 'messages');

      // Add user message
      const userMessage: Message = { role: 'user', content };
      await addDocumentNonBlocking(messagesCol, { ...userMessage, createdAt: serverTimestamp() });
      
      // Get AI response
      const response = await generateAITutorResponse({ problemStatement: content });
      if (!response.tutorResponse) {
        throw new Error("Failed to get a response from the AI tutor.");
      }
      
      // Add AI message
      const assistantMessage: Message = { role: 'assistant', content: response.tutorResponse };
      await addDocumentNonBlocking(messagesCol, { ...assistantMessage, createdAt: serverTimestamp() });

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "I seem to be having trouble connecting. Please try again in a moment.";
      
      if (currentChatId) {
          const messagesCol = collection(firestore, 'users', user.uid, 'chatSessions', currentChatId, 'messages');
          const errorResponseMessage: Message = { role: 'assistant', content: errorMessage };
          await addDocumentNonBlocking(messagesCol, { ...errorResponseMessage, createdAt: serverTimestamp() });
      }
      
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatId, user, firestore, router, toast]);

  return { messages, sendMessage, isLoading };
}
