// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Teacher Dashboard Page (`/teacher`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the main entry point for the teacher's section of the
 * application, available at the `/teacher` URL. It acts as a strict gatekeeper,
 * performing both authentication and authorization checks.
 *
 * Its primary responsibilities are:
 * 1.  **Authentication Check:** It ensures a user is logged in. If not, it redirects
 *     to the login page.
 * 2.  **Authorization Check:** This is crucial. It verifies that the logged-in user
 *     has the `role` of "teacher". If the user is a student or has no role, they
 *     are blocked from seeing the dashboard content.
 * 3.  **Render Dashboard:** If the user is an authenticated teacher, it renders the
 *     main `TeacherDashboard` component, which contains all the tools for customizing the AI.
 *
 * This is a "Client Component" (`'use client'`) because it needs to access
 * browser-specific APIs like `sessionStorage` to quickly check the user's role
 * without waiting for a full database read.
 */
'use client';

// Import necessary components and hooks.
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard';
import { useUser } from '@/firebase'; // Hook to get user authentication status.
import { useRouter } from 'next/navigation'; // Hook for redirects.
import { useEffect, useState } from 'react'; // React's core hooks.
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { LoadingScreen } from '@/components/layout/loading-screen';
import type { UserProfile } from '@/types';

/**
 * The main component for the teacher dashboard page.
 *
 * @returns {JSX.Element} The teacher dashboard UI or a loading/unauthorized screen.
 *
 * C-like Explanation: `function TeacherPage() -> returns JSX_Element`
 *
 * Internal State (Global Variables for this function):
 *   - `user`, `isUserLoading`: From Firebase auth, tracks login status.
 *   - `userInfo`: A struct-like object to hold the user's profile (especially the role),
 *     fetched from `sessionStorage` for a fast initial check.
 *   - `router`: An object for handling redirects.
 */
export default function TeacherPage() {
  // Get user authentication status from the global Firebase context.
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  // State to hold the user's profile info (especially the role).
  // `useState` initializes it to `null`. The component will re-render when this is set.
  const [userInfo, setUserInfo] = useState<Partial<UserProfile> | null>(null);

  // This `useEffect` hook handles both authentication and authorization logic.
  // It runs after the component renders and whenever `user` or `isUserLoading` changes.
  useEffect(() => {
    // C-like pseudocode:
    // void onComponentUpdate() {
    //   // 1. Authentication Check: If loading is done and user is NULL, redirect to login.
    //   if (!isUserLoading && !user) {
    //     redirectTo('/login');
    //     return; // Stop further execution.
    //   }
    //
    //   // 2. Authorization Check (Quick Path): If user exists, check their role from session storage.
    //   if (user) {
    //     // Read the user's profile from browser session storage.
    //     // This was saved here during the login process for quick access.
    //     string storedInfoJson = sessionStorage.getItem('lyra-user-info');
    //     if (storedInfoJson) {
    //       // Parse the JSON string into a struct-like object.
    //       UserProfile info = JSON.parse(storedInfoJson);
    //       // Update our component's state with this info, triggering a re-render.
    //       setUserInfo(info);
    //     }
    //   }
    // }
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      // Fetch the user's role from session storage for a quick authorization check.
      // This is faster than waiting for a Firestore read on every page load.
      const storedInfo = sessionStorage.getItem('lyra-user-info');
      if (storedInfo) {
        setUserInfo(JSON.parse(storedInfo));
      }
    }
  }, [isUserLoading, user, router]); // Dependency array.

  // This is the combined loading and authorization check.
  // We show the loading screen if:
  // 1. We are still checking the user's login status (`isUserLoading`).
  // 2. We are still waiting to load the user's role from session storage (`!userInfo`).
  if (isUserLoading || !userInfo) {
    return <LoadingScreen />;
  }

  // After loading, we do the final authorization check.
  // If the user's role is not 'teacher', we show an "Access Denied" message.
  if (userInfo.role !== 'teacher') {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-center'>
        <h1 className='text-2xl font-bold'>Access Denied</h1>
        <p className='text-muted-foreground'>
          This page is for teachers only.
        </p>
        <button onClick={() => router.push('/')} className='mt-4 text-primary'>
          Return to Student Chat
        </button>
      </div>
    );
  }

  // If all checks pass, render the teacher dashboard.
  return (
    <SidebarLayout>
      <div className='p-4 sm:p-6 lg:p-8 animate-fade-in'>
        {/*
          This renders the main dashboard component. All the complex UI and logic
          for AI customization is encapsulated in `<TeacherDashboard />`.
          This keeps the page-level component clean and focused on authorization.
        */}
        <TeacherDashboard />
      </div>
    </SidebarLayout>
  );
}
