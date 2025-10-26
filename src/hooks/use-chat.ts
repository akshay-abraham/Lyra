// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview FILE SUMMARY - THE BRAIN OF THE CHAT
 *
 * This file contains the `useChat` "custom hook". A hook in React is a reusable
 * function that can "hook into" React features, like state and lifecycle.
 *
 * This `useChat` hook is the central processing unit for our chat logic. It is
 * responsible for everything that happens "under the hood" of the chat interface.
 *
 * Core Responsibilities:
 * 1.  **Fetch Existing Messages:** If you open an old chat, this hook fetches all the
 *     previous messages from the Firestore database.
 * 2.  **Send New Messages:** When the user types a message and hits send, this hook:
 *     a. Creates a new chat session in the database if it's a new chat.
 *     b. Saves the user's message to the database.
 *     c. Calls the AI "flow" (our backend AI function) to get a response.
 *     d. Saves the AI's response to the database.
 * 3.  **Manage Loading State:** It keeps track of when the AI is "thinking" and
 *     tells the UI to display a loading indicator.
 * 4.  **Handle Teacher Customizations:** It fetches custom settings (like system prompts)
 *     that a teacher has configured for a specific subject and class, and passes them
 *     to the AI.
 * 5.  **Error Handling:** It catches errors and displays user-friendly notifications (toasts).
 *
 * C-like Analogy:
 * Think of `useChat` as a dedicated C module (`chat_logic.c`) with a primary
 * function `ChatState* useChat(char* chatId)`.
 *
 * - It takes a `chatId` as an argument.
 * - It manages a `ChatState` struct internally, which might look like:
 *   struct ChatState {
 *     Message* messages;
 *     int message_count;
 *     bool isLoading;
 *     char* chatSubject;
 *   };
 * - It returns a pointer to this state AND a function pointer `void (*sendMessage)(...)`
 *   so the UI can trigger actions.
 *
 * In React, this is simplified. The hook just returns an object with the data and functions
 * all bundled together: `{ messages, sendMessage, isLoading, chatSubject }`.
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
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { generateAITutorResponse } from '@/ai/flows/generate-ai-tutor-response';
import { generateChatTitle } from '@/ai/flows/generate-chat-title';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Define the structure of a Message object, like a `typedef struct` in C.
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

// Define the structure for a ChatSession document in the database.
interface ChatSession {
  subject: string;
}

// Define the structure for a Teacher's settings document.
interface TeacherSettings {
  systemPrompt: string;
  exampleAnswers: string[];
}

// Define the structure for a User's profile document.
interface UserProfile {
  role: 'student' | 'teacher';
  class?: string;
  school?: string;
  subjectsTaught?: string[];
}

/**
 * =================================================================================
 * `useChat` Custom Hook
 * C-like Explanation: `function useChat(chatId) -> returns { messages, sendMessage, isLoading, ... }`
 *
 * @param chatId The ID of the chat session to use. If `null`, a new chat will be created on the first message.
 * @returns An object (like a struct) containing the chat state and functions to interact with it.
 * =================================================================================
 */
export function useChat(chatId: string | null) {
  // State variable to track if the AI is currently generating a response.
  const [isLoading, setIsLoading] = useState(false);
  // Get access to Firebase services (firestore, auth) and the current user.
  const { firestore } = useFirebase();
  const { user } = useUser();
  // Get the router to programmatically change the URL (e.g., to the new chat's URL).
  const router = useRouter();
  // Get the toast function for showing notifications.
  const { toast } = useToast();

  // --- DATA FETCHING ---
  // These hooks fetch data from Firestore in real-time. They automatically update
  // when the data changes in the database.

  // 1. Get the current chat session document (which contains the subject).
  const chatSessionRef = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return doc(firestore, 'users', user.uid, 'chatSessions', chatId);
  }, [user, firestore, chatId]);
  const { data: chatSession } = useDoc<ChatSession>(chatSessionRef);

  // 2. Get the list of messages for the current chat session.
  // The query is ordered by creation time to ensure messages appear in the correct order.
  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) {
      return null;
    }
    return query(
      collection(
        firestore,
        'users',
        user.uid,
        'chatSessions',
        chatId,
        'messages',
      ),
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
   * C-like Explanation: `async function getTeacherSettings(studentProfile, subject) -> returns TeacherSettings* or NULL`
   *
   * This function is responsible for finding the right teacher and their custom AI settings
   * for a given student and subject.
   */
  const getTeacherSettings = useCallback(
    async (
      studentProfile: UserProfile,
      subject: string,
    ): Promise<TeacherSettings | null> => {
      // PSEUDOCODE:
      // 1. Check for valid inputs (database connection, student class, etc.). If not valid, return NULL.
      // 2. Query the 'users' collection to find all teachers at the student's school who teach the student's class.
      //    `SELECT * FROM users WHERE role == 'teacher' AND school == student.school AND classesTaught CONTAINS student.class`
      // 3. If no teachers are found, log it and return NULL.
      // 4. From the list of found teachers, find one who also teaches the given `subject`.
      //    This is done on the client side because Firestore has query limitations.
      // 5. If no specific teacher is found for that subject, log it and return NULL.
      // 6. Using the found teacher's ID and the subject, construct the ID for the settings document
      //    (e.g., "teacherId123_Maths").
      // 7. Fetch this specific settings document from the 'teacherSettings' collection.
      // 8. If the document exists, return its data. Otherwise, return NULL.
      if (!firestore || !studentProfile.class || !studentProfile.school)
        return null;

      try {
        const teachersQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'teacher'),
          where('school', '==', studentProfile.school),
          where('classesTaught', 'array-contains', studentProfile.class),
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
          console.log(
            `No teacher found for class "${studentProfile.class}" who teaches subject "${subject}"`,
          );
          return null;
        }

        const teacherId = teacherDoc.id;

        const settingsId = `${teacherId}_${subject.replace(/\s+/g, '-')}`;
        const settingsDocRef = doc(firestore, 'teacherSettings', settingsId);
        const settingsSnapshot = await getDoc(settingsDocRef);

        if (!settingsSnapshot.exists()) {
          console.log(
            `No settings found for teacher "${teacherId}" and subject "${subject}"`,
          );
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
   * C-like Explanation: `async function sendMessage(content, subject)`
   *
   * This is the main function exposed by the hook to the UI. It orchestrates the
   * entire process of sending a message and getting a response.
   */
  const sendMessage = useCallback(
    async (content: string, subject: string | null) => {
      // 1. Pre-condition checks.
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not authenticated.',
        });
        return;
      }

      setIsLoading(true);

      let currentChatId = chatId;
      let finalSubject = subject;

      try {
        // 2. Determine the subject for the chat.
        if (chatSession?.subject) {
          finalSubject = chatSession.subject;
        }

        if (!finalSubject) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Subject is required for a new chat.',
          });
          setIsLoading(false);
          return;
        }

        // 3. If it's a new chat, create the session document first.
        if (!currentChatId) {
          // a. Ask the AI to generate a short title for the chat based on the first message.
          const titleResponse = await generateChatTitle({
            firstMessage: content,
          });
          const newTitle = titleResponse.title || 'New Chat';

          // b. Create a new document in the `chatSessions` subcollection.
          const chatSessionRef = await addDoc(
            collection(firestore, 'users', user.uid, 'chatSessions'),
            {
              userId: user.uid,
              subject: finalSubject,
              title: newTitle,
              startTime: serverTimestamp(), // Use the database server's timestamp.
            },
          );

          currentChatId = chatSessionRef.id;
          // c. Update the URL in the browser to reflect the new chat ID without a full page reload.
          router.push(`/?chatId=${currentChatId}`, { scroll: false });
        }

        if (!currentChatId) {
          throw new Error('Failed to create or identify chat session.');
        }

        // 4. Save the user's message to the database.
        // This is the path to the `messages` subcollection for this specific chat.
        const messagesCol = collection(
          firestore,
          'users',
          user.uid,
          'chatSessions',
          currentChatId,
          'messages',
        );
        const userMessage: Message = { role: 'user', content };
        // `addDocumentNonBlocking` adds the document without waiting for it to complete.
        // This makes the UI feel faster. The message appears instantly.
        addDocumentNonBlocking(messagesCol, {
          ...userMessage,
          createdAt: serverTimestamp(),
        });

        // 5. Fetch teacher settings if the user is a student.
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        let teacherSettings: TeacherSettings | null = null;
        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          if (userProfile.role === 'student') {
            teacherSettings = await getTeacherSettings(
              userProfile,
              finalSubject,
            );
          }
        }

        // 6. Call the AI to get a response.
        const response = await generateAITutorResponse({
          problemStatement: content,
          systemPrompt: teacherSettings?.systemPrompt, // Use custom prompt if available.
          exampleGoodAnswers: teacherSettings?.exampleAnswers, // Use custom examples if available.
        });
        if (!response.tutorResponse) {
          throw new Error('Failed to get a response from the AI tutor.');
        }

        // 7. Save the AI's response to the database.
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.tutorResponse,
        };
        addDocumentNonBlocking(messagesCol, {
          ...assistantMessage,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        // 8. Handle any errors during the process.
        console.error('Error sending message:', error);
        const errorMessage =
          'I seem to be having trouble connecting. Please try again in a moment.';

        // If an error occurs, post a message in the chat to inform the user.
        if (currentChatId) {
          const messagesCol = collection(
            firestore,
            'users',
            user.uid,
            'chatSessions',
            currentChatId,
            'messages',
          );
          const errorResponseMessage: Message = {
            role: 'assistant',
            content: errorMessage,
          };
          addDocumentNonBlocking(messagesCol, {
            ...errorResponseMessage,
            createdAt: serverTimestamp(),
          });
        }

        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'There was a problem with your request.',
        });
      } finally {
        // 9. No matter what, stop the loading indicator.
        setIsLoading(false);
      }
      // `useCallback` hook memoizes the function. The dependencies array lists all
      // external variables it depends on. It will only recreate the function if one of these changes.
    },
    [chatId, user, firestore, router, toast, chatSession, getTeacherSettings],
  );

  // Finally, return the state and functions that the UI component needs.
  return {
    messages,
    sendMessage,
    isLoading,
    chatSubject: chatSession?.subject,
  };
}
