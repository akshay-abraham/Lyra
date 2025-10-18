
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
  getDoc,
  getDocs,
  where,
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
    role: 'student' | 'teacher';
    class?: string;
    school?: string;
    subjectsTaught?: string[];
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
    if (!user || !firestore || !chatId) {
      return null;
    }
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
        const teachersQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'teacher'),
            where('school', '==', studentProfile.school),
            where('classesTaught', 'array-contains', studentProfile.class)
        );
        
        const teachersSnapshot = await getDocs(teachersQuery);
        
        if (teachersSnapshot.empty) {
            console.log(`No teachers found for class "${studentProfile.class}"`);
            return null;
        }

        const teacherDoc = teachersSnapshot.docs.find(doc => {
            const teacherData = doc.data() as UserProfile;
            return teacherData.subjectsTaught?.includes(subject);
        });

        if (!teacherDoc) {
             console.log(`No teacher found for class "${studentProfile.class}" who teaches subject "${subject}"`);
             return null;
        }
        
        const teacherId = teacherDoc.id;

        const settingsId = `${teacherId}_${subject.replace(/\s+/g, '-')}`;
        const settingsDocRef = doc(firestore, 'teacherSettings', settingsId);
        const settingsSnapshot = await getDoc(settingsDocRef);

        if (!settingsSnapshot.exists()) {
             console.log(`No settings found for teacher "${teacherId}" and subject "${subject}"`);
            return null;
        }
        
        return settingsSnapshot.data() as TeacherSettings;

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
      if(chatSession?.subject) {
          finalSubject = chatSession.subject;
      }

      if (!finalSubject) {
          toast({ variant: 'destructive', title: 'Error', description: 'Subject is required for a new chat.' });
          setIsLoading(false);
          return;
      }
      
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

      const userMessage: Message = { role: 'user', content };
      addDocumentNonBlocking(messagesCol, { ...userMessage, createdAt: serverTimestamp() });

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let teacherSettings: TeacherSettings | null = null;
      if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          if(userProfile.role === 'student') {
             teacherSettings = await getTeacherSettings(userProfile, finalSubject);
          }
      }

      const response = await generateAITutorResponse({ 
          problemStatement: content,
          systemPrompt: teacherSettings?.systemPrompt,
          exampleGoodAnswers: teacherSettings?.exampleAnswers
      });
      if (!response.tutorResponse) {
        throw new Error("Failed to get a response from the AI tutor.");
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response.tutorResponse };
      addDocumentNonBlocking(messagesCol, { ...assistantMessage, createdAt: serverTimestamp() });

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "I seem to be having trouble connecting. Please try again in a moment.";
      
      if (currentChatId) {
          const messagesCol = collection(firestore, 'users', user.uid, 'chatSessions', currentChatId, 'messages');
          const errorResponseMessage: Message = { role: 'assistant', content: errorMessage };
          addDocumentNonBlocking(messagesCol, { ...errorResponseMessage, createdAt: serverTimestamp() });
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
