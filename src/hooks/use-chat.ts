
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDocs,
  where,
  limit
} from 'firebase/firestore';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
    subject: string;
}

interface TeacherSettings {
    systemPrompt: string;
    exampleAnswers: string[];
}

interface UserProfile {
    class?: string;
    school?: string;
}

export function useChat(chatId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const chatSessionRef = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return doc(firestore, 'users', user.uid, 'chatSessions', chatId);
  }, [user, firestore, chatId]);

  const { data: chatSession } = useDoc<ChatSession>(chatSessionRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'chatSessions', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [user, firestore, chatId]);

  const { data: messages, error: messagesError } = useCollection<Message>(messagesQuery);
    
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

  const getTeacherSettings = useCallback(async (studentProfile: UserProfile, subject: string): Promise<TeacherSettings | null> => {
      if (!firestore || !studentProfile.class || !studentProfile.school) return null;

      try {
        // Find teachers in the same school who teach the student's class and the selected subject
        const teachersQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'teacher'),
            where('school', '==', studentProfile.school),
            where('classesTaught', 'array-contains', studentProfile.class),
            where('subjectsTaught', 'array-contains', subject),
            limit(1)
        );
        
        const teacherSnapshot = await getDocs(teachersQuery);
        
        if (teacherSnapshot.empty) {
            console.log(`No teacher found for class "${studentProfile.class}" and subject "${subject}"`);
            return null;
        }

        const teacher = teacherSnapshot.docs[0];
        const teacherId = teacher.id;

        // Fetch the settings for that teacher and subject
        const settingsQuery = query(
            collection(firestore, 'teacherSettings'),
            where('teacherId', '==', teacherId),
            where('subject', '==', subject),
            limit(1)
        );

        const settingsSnapshot = await getDocs(settingsQuery);

        if (settingsSnapshot.empty) {
             console.log(`No settings found for teacher "${teacherId}" and subject "${subject}"`);
            return null;
        }
        
        return settingsSnapshot.docs[0].data() as TeacherSettings;

      } catch (error) {
          console.error("Error fetching teacher settings:", error);
          return null;
      }
  }, [firestore]);


  const sendMessage = useCallback(async (content: string, subject: string | null) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
      return;
    }

    setIsLoading(true);

    let currentChatId = chatId;
    let finalSubject = subject;

    try {
      // If this is an existing chat, the subject is already known
      if(chatSession?.subject) {
          finalSubject = chatSession.subject;
      }

      if (!finalSubject) {
          toast({ variant: 'destructive', title: 'Error', description: 'Subject is required for a new chat.' });
          setIsLoading(false);
          return;
      }
      
      // If this is a new chat, create it first
      if (!currentChatId) {
        const titleResponse = await generateChatTitle({ firstMessage: content });
        const newTitle = titleResponse.title || 'New Chat';

        const chatSessionRef = await addDoc(collection(firestore, 'users', user.uid, 'chatSessions'), {
          userId: user.uid,
          subject: finalSubject,
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

      // Fetch student profile and teacher settings
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDocs(query(collection(firestore, 'users'), where('uid', '==', user.uid), limit(1)));

      let teacherSettings: TeacherSettings | null = null;
      if (!userDoc.empty) {
          const studentProfile = userDoc.docs[0].data() as UserProfile;
          if(studentProfile.role === 'student') {
             teacherSettings = await getTeacherSettings(studentProfile, finalSubject);
          }
      }

      // Get AI response
      const response = await generateAITutorResponse({ 
          problemStatement: content,
          systemPrompt: teacherSettings?.systemPrompt,
          exampleGoodAnswers: teacherSettings?.exampleAnswers
      });
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
  }, [chatId, user, firestore, router, toast, chatSession, getTeacherSettings]);

  return { messages, sendMessage, isLoading, chatSubject: chatSession?.subject };
}
