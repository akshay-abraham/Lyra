// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Chat History Component (`chat-history.tsx`)
 *
 * C-like Analogy:
 * This file defines a UI component whose sole responsibility is to fetch and display
 * the user's past chat sessions in the sidebar. It's like a C function,
 * `displayChatHistory()`, that does the following:
 *
 * 1.  Constructs a database query to get all documents from the user's `chatSessions`
 *     collection, ordered by most recent first.
 * 2.  Subscribes to that query to get real-time updates. If a new chat is started in
 *     another tab, it will appear here automatically.
 * 3.  While the data is being fetched, it displays a "loading skeleton" UI.
 * 4.  Once the data arrives, it groups the chats by subject (e.g., "Maths", "Science").
 * 5.  It then renders this grouped list as a series of expandable accordions. Each
 *     accordion item is a subject, and inside it is a list of links to the chats
 *     for that subject.
 *
 * It uses our custom `useCollection` hook to handle all the complexities of
 * real-time data fetching from Firestore.
 */
'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '../ui/sidebar';
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { allSubjects, type SubjectData } from '@/lib/subjects-data';

// This defines the structure of a chat session document, like a `typedef struct` in C.
interface ChatSession {
  id: string;
  title: string;
  subject: string;
}

// Create a lookup map for subject data (like an icon and color).
// This is an optimization to quickly find a subject's metadata by its name.
// It's like a hash map or `std::map` in C++.
const subjectDataMap = new Map<string, SubjectData>(
  allSubjects.map((s) => [s.name, s]),
);

/**
 * C-like Explanation: `function ChatHistory(props) -> returns JSX_Element`
 *
 * This is the main component function for displaying the chat history.
 *
 * Props (Inputs):
 *   - `onLinkClick`: A function pointer (callback) that gets called when a chat link is
 *     clicked. This is used by the parent component (`sidebar-layout`) to close the
 *     mobile menu.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useFirebase`, `useUser`: Get access to the database and current user.
 *   - `usePathname`: Get the current URL to highlight the active chat.
 *   - `useMemoFirebase`: A critical hook to "memoize" the Firestore query. This prevents
 *     the query object from being recreated on every render, which would cause an
 *     infinite loop of data fetching.
 *   - `useCollection`: Our custom hook that subscribes to the Firestore query and
 *     returns the data, loading state, and any errors.
 *   - `React.useMemo`: Another optimization hook. It's used here to re-calculate the
 *     `groupedSessions` only when the `chatSessions` data actually changes.
 */
export function ChatHistory({ onLinkClick }: { onLinkClick: () => void }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const pathname = usePathname();

  // 1. Construct the Firestore query.
  // `useMemoFirebase` ensures this query object is stable across re-renders.
  const chatSessionsQuery = useMemoFirebase(() => {
    // If we don't have a user or database connection yet, return null.
    if (!user || !firestore) return null;
    // This is the query definition:
    // "Get documents from the `chatSessions` collection for the current user,
    // ordered by `startTime` in descending order."
    return query(
      collection(firestore, 'users', user.uid, 'chatSessions'),
      orderBy('startTime', 'desc'),
    );
  }, [user, firestore]); // Dependencies: only re-create the query if `user` or `firestore` changes.

  // 2. Subscribe to the query using our custom hook.
  // This hook handles all the real-time subscription logic.
  // `chatSessions` will be an array of `ChatSession` structs (or null).
  // `isLoading` will be `true` during the initial fetch.
  const { data: chatSessions, isLoading } =
    useCollection<ChatSession>(chatSessionsQuery);

  // 3. Group the fetched sessions by subject.
  // `React.useMemo` ensures this grouping logic only runs when `chatSessions` data changes.
  const groupedSessions = React.useMemo(() => {
    // PSEUDOCODE:
    // function groupSessions(sessions_array):
    //   if (sessions_array is NULL) return empty_map;
    //   map<string, Session[]> grouped_map;
    //   for each session in sessions_array:
    //     subject = session.subject or "Other";
    //     if (grouped_map does not have key `subject`):
    //       create an empty array at `grouped_map[subject]`;
    //     push session into `grouped_map[subject]`;
    //   return grouped_map;
    if (!chatSessions) return {};
    return chatSessions.reduce(
      (acc, session) => {
        const subject = session.subject || 'Other';
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push(session);
        return acc;
      },
      {} as Record<string, ChatSession[]>,
    );
  }, [chatSessions]); // Dependency: only re-run when `chatSessions` changes.

  // 4. Render the UI based on the state.

  // If data is currently being fetched, show a loading UI.
  if (isLoading) {
    return (
      <div className='px-2'>
        <SidebarMenuSkeleton showIcon />
        <SidebarMenuSkeleton showIcon />
        <SidebarMenuSkeleton showIcon />
      </div>
    );
  }

  // If loading is finished and there are no chats, show a helpful message.
  if (!chatSessions || chatSessions.length === 0) {
    return (
      <div className='px-4 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden'>
        Your chat history will appear here.
      </div>
    );
  }

  // If we have data, render the list of accordions.
  return (
    <Accordion
      type='multiple'
      className='w-full group-data-[collapsible=icon]:hidden px-2'
    >
      {/*
              `Object.entries(groupedSessions)` turns our map into an array of [key, value] pairs
              so we can loop over it.
              for each ([subject, sessions_for_subject] in groupedSessions):
                  // render an AccordionItem for this subject...
            */}
      {Object.entries(groupedSessions).map(([subject, sessions]) => {
        const subjectInfo = subjectDataMap.get(subject);
        const Icon = subjectInfo?.icon || MessageSquareText;

        return (
          <AccordionItem value={subject} key={subject} className='border-b-0'>
            {/* The trigger is the part the user clicks to expand/collapse. */}
            <AccordionTrigger className='py-2 px-2 hover:no-underline hover:bg-sidebar-accent rounded-md text-sm font-medium'>
              <div className='flex items-center gap-2'>
                <Icon
                  className='h-4 w-4'
                  style={{ color: subjectInfo?.color }}
                />
                <span className='truncate'>{subject}</span>
              </div>
            </AccordionTrigger>
            {/* The content is what's shown when the accordion is open. */}
            <AccordionContent className='pl-4 pt-1'>
              <div className='flex flex-col gap-1'>
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    {/* Each item is a link to the chat page with the specific `chatId`. */}
                    <Link href={`/?chatId=${session.id}`} onClick={onLinkClick}>
                      <SidebarMenuButton
                        isActive={pathname.includes(session.id)}
                        tooltip={session.title}
                        className='h-auto py-1.5'
                      >
                        <MessageSquareText />
                        <span className='truncate'>{session.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
