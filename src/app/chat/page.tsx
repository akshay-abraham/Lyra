// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Chat Page (`/chat`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/chat` route, which handles all
 * student-facing chat interactions. It uses a client-side component to read the
 * `chatId` from the URL's query parameters and pass it to the main `ChatInterface`
 * component. This clean separation allows the chat functionality to be self-contained.
 *
 * It uses React's `<Suspense>` boundary to show a loading screen while the
 * component and its dependencies are being loaded, ensuring a smooth user experience.
 */
'use client';

// Import necessary components and hooks.
import { ChatInterface } from '@/components/student/chat-interface';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * A simple wrapper component that reads the `chatId` from the URL and
 * passes it to the `ChatInterface`. This is done in a separate component
 * so it can be wrapped in `<Suspense>`.
 */
function ChatPageContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <SidebarLayout>
      <ChatInterface chatId={chatId} />
    </SidebarLayout>
  );
}

/**
 * The main component for the chat page. It wraps the core chat content
 * in a Suspense boundary to handle loading states gracefully.
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ChatPageContent />
    </Suspense>
  );
}
