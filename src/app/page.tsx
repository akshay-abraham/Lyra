/**
 * @fileoverview Main Student Chat Page (`/`)
 *
 * C-like Analogy:
 * This file is the entry point for the application's root URL (`/`). This is
 * the main chat page for a student.
 *
 * Its primary responsibilities are:
 * 1.  Act as a gatekeeper: It checks if a user is logged in. If not, it redirects
 *     them to the `/login` page.
 * 2.  Handle chat session routing: It reads the `chatId` from the URL's query
 *     parameters (e.g., `/?chatId=xyz123`). This ID is then passed to the
 *     `ChatInterface` component.
 * 3.  Render the main layout: It displays the `SidebarLayout` and the `ChatInterface`,
 *     which together form the complete chat screen.
 *
 * This is a "Client Component" (`'use client'`) because it uses React Hooks like
 * `useEffect`, `useRouter`, and `useSearchParams` that must run in the browser.
 */
'use client';

// Import necessary components and hooks.
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { ChatInterface } from '@/components/student/chat-interface';
import { useUser } from '@/firebase'; // Hook to get the current user.
import { useRouter, useSearchParams } from 'next/navigation'; // Hooks for navigation and URL parameters.
import { Suspense, useEffect } from 'react'; // React's core hooks.

/**
 * C-like Explanation: `function ChatPageContent() -> returns JSX_Element or NULL`
 *
 * This component contains the core logic for the page. It's separated so that it
 * can be wrapped in `<Suspense>`, which gracefully handles the initial loading state.
 *
 * Internal State (Global Variables for this function):
 *   - `user`: A struct-like object for the logged-in user (or NULL).
 *   - `isUserLoading`: A boolean flag, `true` while checking auth.
 *   - `router`: An object for programmatic navigation.
 *   - `searchParams`: An object to read URL query parameters.
 *   - `chatId`: The ID of the chat from the URL (or NULL).
 */
function ChatPageContent() {
  // Get the user's authentication status.
  const { user, isUserLoading } = useUser();
  const router = useRouter(); // Get the router for redirects.
  // Get the URL search parameters. `useSearchParams` is a React Hook for this.
  const searchParams = useSearchParams();
  // Read the 'chatId' parameter from the URL.
  const chatId = searchParams.get('chatId');

  // This `useEffect` hook acts as a gatekeeper. It runs after the component renders
  // and whenever its dependencies (`isUserLoading`, `user`) change.
  useEffect(() => {
    // C-like pseudocode:
    // void onComponentUpdate() {
    //   // If we are finished loading the user's status AND the user is still NULL...
    //   if (!isUserLoading && !user) {
    //     // ...then the user is not logged in. Redirect them.
    //     redirectTo('/login');
    //   }
    // }
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]); // Dependency array.

  // While checking for the user or if the user is not logged in (and about to be redirected),
  // we render nothing (`null`). The parent component's `<Suspense>` fallback will be shown.
  if (isUserLoading || !user) {
      return null;
  }

  // If the user is authenticated, render the main chat layout.
  return (
    <SidebarLayout>
      {/*
        Render the `ChatInterface` component.
        - `key={chatId}`: This is a crucial React optimization. When the `key` changes
          (i.e., when the user clicks a different chat in the sidebar, changing the URL
          and thus the `chatId`), React will completely destroy the old `ChatInterface`
          instance and create a brand new one. This is the simplest way to ensure that
          the chat component resets its state and fetches messages for the new chat session.
        - `chatId={chatId}`: We pass the chat ID down to the component so it knows which
          chat session to load. This is like passing an argument to a function.
      */}
      <ChatInterface key={chatId} chatId={chatId} />
    </SidebarLayout>
  );
}

/**
 * C-like Explanation: `function StudentPage() -> returns JSX_Element`
 *
 * This is the main exported function for the root page (`/`).
 * Its only job is to wrap our main content (`ChatPageContent`) in `<Suspense>`,
 * ensuring a smooth loading experience for the user.
 */
export default function StudentPage() {
  return (
    // While `ChatPageContent` is checking for the user, the `fallback` UI is shown.
    // This prevents a blank screen or layout shifts.
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
