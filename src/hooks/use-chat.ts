
// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview The `useChat` custom hook, the "brain" of the chat interface.
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file contains the `useChat` "custom hook". A hook in React is a reusable
 * function that can "hook into" React features, like state and lifecycle. This
 * `useChat` hook is the central processing unit for our chat logic, responsible
 * for everything that happens "under the hood" of the chat interface.
 *
 * Core Responsibilities:
 * 1.  **Fetch Existing Messages:** If a user opens an existing chat, this hook fetches all
 *     the previous messages from the Firestore database in real-time.
 * 2.  **Send New Messages:** When the user types a message and hits send, this hook:
 *     a. Creates a new chat session in the database if it's a new chat.
 *     b. Saves the user's message to the database.
 *     c. Calls the backend AI "flow" to get a response.
 *     d. Saves the AI's response to the database.
 * 3.  **Manage Loading State:** It keeps track of when the AI is "thinking" and
 *     tells the UI to display a loading indicator.
 * 4.  **Handle Teacher Customizations:** Before calling the AI, it fetches custom settings
 *     (like system prompts and few-shot examples) that a teacher has configured for the
 *     specific subject and class, and passes them to the AI.
 * 5.  **Error Handling:** It catches errors during the process and displays user-friendly
 *     notifications (toasts).
 *
 * C-like Analogy:
 * Think of `useChat` as a dedicated C module (`chat_logic.c`) with a primary
 * function `ChatState* useChat(char* chatId)`.
 *
 * - It takes a `chatId` as an argument.
 * - It manages a `ChatState` struct internally, which might look like:
 *   ```c
 *   struct ChatState {
 *     Message* messages;
 *     int message_count;
 *     bool isLoading;
 *     char* chatSubject;
 *   };
 *   ```
 * - It returns a pointer to this state AND a function pointer `void (*sendMessage)(...)`
 *   so the UI can trigger actions. In React, this is simplified by returning an object
 *   with all data and functions bundled together: `{ messages, sendMessage, isLoading, chatSubject }`.
 */
'use client';

// Import necessary functions and types from other files.
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
import { useCollection, useDoc } from '@/firebase/firestore/use-collection';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Message, ChatSession, TeacherSettings, UserProfile } from '@/types';
import { COLLECTIONS, FIELDS } from '@/lib/constants';

/**
 * The `useChat` custom hook, the controller for all chat logic.
 *
 * @param {string | null} chatId - The ID of the chat session to use. If `null`, a new chat will be created on the first message.
 * @returns An object containing the chat state and functions to interact with it.
 */
export function useChat(chatId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // --- DATA FETCHING ---
  // These hooks fetch data from Firestore in real-time. They automatically update
  // when the data changes in the database.

  // 1. Get the current chat session document (which contains the subject).
  const chatSessionRef = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return doc(firestore, COLLECTIONS.USERS, user.uid, COLLECTIONS.CHAT_SESSIONS, chatId);
  }, [user, firestore, chatId]);
  const { data: chatSession } = useDoc<ChatSession>(chatSessionRef);

  // 2. Get the list of messages for the current chat session.
  // The query is ordered by creation time to ensure messages appear in the correct order.
  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) {
      return null;
    }
    return query(
      collection(firestore, COLLECTIONS.USERS, user.uid, COLLECTIONS.CHAT_SESSIONS, chatId, COLLECTIONS.MESSAGES),
      orderBy('createdAt', 'asc'),
    );
  }, [user, firestore, chatId]);
  const { data: messages, error: messagesError } =
    useCollection<Message>(messagesQuery);

  // This `useEffect` hook watches for errors from the `useCollection` hook.
  useEffect(() => {
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      toast({
        variant: 'destructive',
        title: 'Error loading chat',
        description: 'There was a problem fetching the chat history.',
      });
    }
  }, [messagesError, toast]);

  /**
   * Finds the right teacher and their custom AI settings for a given student and subject.
   *
   * @param {UserProfile} studentProfile - The profile of the student asking the question.
   * @param {string} subject - The subject of the chat session.
   * @returns {Promise<TeacherSettings | null>} The teacher's custom settings, or null if not found.
   */
  const getTeacherSettings = useCallback(
    async (
      studentProfile: UserProfile,
      subject: string,
    ): Promise<TeacherSettings | null> => {
      if (!firestore || !studentProfile.class || !studentProfile.school) return null;

      try {
        const teachersQuery = query(
          collection(firestore, COLLECTIONS.USERS),
          where(FIELDS.ROLE, '==', 'teacher'),
          where(FIELDS.SCHOOL, '==', studentProfile.school),
          where(FIELDS.CLASSES_TAUGHT, 'array-contains', studentProfile.class),
        );

        const teachersSnapshot = await getDocs(teachersQuery);

        if (teachersSnapshot.empty) {
          console.log(`No teachers found for class "${studentProfile.class}"`);
          return null;
        }

        // Client-side filtering because Firestore doesn't allow two 'array-contains' in one query.
        const teacherDoc = teachersSnapshot.docs.find((doc) => {
          const teacherData = doc.data() as UserProfile;
          return teacherData.subjectsTaught?.includes(subject);
        });

        if (!teacherDoc) {
          console.log(`No teacher found for class "${studentProfile.class}" who teaches subject "${subject}"`);
          return null;
        }

        const teacherId = teacherDoc.id;
        const settingsId = `${teacherId}_${subject.replace(/\s+/g, '-')}`;
        const settingsDocRef = doc(firestore, COLLECTIONS.TEACHER_SETTINGS, settingsId);
        const settingsSnapshot = await getDoc(settingsDocRef);

        if (!settingsSnapshot.exists()) {
          console.log(`No settings found for teacher "${teacherId}" and subject "${subject}"`);
          return null;
        }

        return settingsSnapshot.data() as TeacherSettings;
      } catch (error) {
        console.error('Error fetching teacher settings:', error);
        return null;
      }
    },
    [firestore],
  );

  /**
   * Orchestrates the entire process of sending a message and getting a response.
   *
   * @param {string} content - The text content of the user's message.
   * @param {string | null} subject - The subject for a new chat.
   */
  const sendMessage = useCallback(
    async (content: string, subject: string | null) => {
      if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
        return;
      }

      setIsLoading(true);
      let currentChatId = chatId;
      let finalSubject = subject;

      try {
        if (chatSession?.subject) {
          finalSubject = chatSession.subject;
        }

        if (!finalSubject) {
          toast({ variant: 'destructive', title: 'Error', description: 'Subject is required for a new chat.' });
          setIsLoading(false);
          return;
        }

        if (!currentChatId) {
          // --- Generate Title ---
          let newTitle = 'New Chat'; // Default title
          try {
            // Attempt to generate a title, but don't let it block the chat.
            const titleResponse = await generateChatTitle({ firstMessage: content });
            newTitle = titleResponse.title || newTitle;
          } catch (error) {
            console.warn('AI title generation failed. Using default title.', error);
            // We use the default title, so no need to throw the error.
          }
          // --- End Generate Title ---

          const chatSessionRef = await addDoc(
            collection(firestore, COLLECTIONS.USERS, user.uid, COLLECTIONS.CHAT_SESSIONS),
            {
              [FIELDS.USER_ID]: user.uid,
              subject: finalSubject,
              title: newTitle,
              [FIELDS.START_TIME]: serverTimestamp(),
            },
          );

          currentChatId = chatSessionRef.id;
          router.push(`/chat?chatId=${currentChatId}`, { scroll: false });
        }

        if (!currentChatId) {
          throw new Error('Failed to create or identify chat session.');
        }

        const messagesCol = collection(firestore, COLLECTIONS.USERS, user.uid, COLLECTIONS.CHAT_SESSIONS, currentChatId, COLLECTIONS.MESSAGES);
        const userMessage: Message = { role: 'user', content };
        addDocumentNonBlocking(messagesCol, { ...userMessage, createdAt: serverTimestamp() });

        const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
        const userDoc = await getDoc(userDocRef);
        let teacherSettings: TeacherSettings | null = null;
        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          if (userProfile.role === 'student') {
            teacherSettings = await getTeacherSettings(userProfile, finalSubject);
          }
        }

        const response = await generateAITutorResponse({
          problemStatement: content,
          systemPrompt: teacherSettings?.systemPrompt,
          exampleGoodAnswers: teacherSettings?.exampleAnswers,
        });
        if (!response.tutorResponse) {
          throw new Error('Failed to get a response from the AI tutor.');
        }

        const assistantMessage: Message = { role: 'assistant', content: response.tutorResponse };
        addDocumentNonBlocking(messagesCol, { ...assistantMessage, createdAt: serverTimestamp() });
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = 'I seem to be having trouble connecting. Please try again in a moment.';

        if (currentChatId) {
          const messagesCol = collection(firestore, COLLECTIONS.USERS, user.uid, COLLECTIONS.CHAT_SESSIONS, currentChatId, COLLECTIONS.MESSAGES);
          const errorResponseMessage: Message = { role: 'assistant', content: errorMessage };
          addDocumentNonBlocking(messagesCol, { ...errorResponseMessage, createdAt: serverTimestamp() });
        }

        toast({ variant: 'destructive', title: 'Oh no! Something went wrong.', description: 'There was a problem with your request.' });
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, user, firestore, router, toast, chatSession, getTeacherSettings],
  );

  // Return the state and functions that the UI component needs to operate.
  return {
    messages,
    sendMessage,
    isLoading,
    chatSubject: chatSession?.subject,
  };
}
