// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Teacher Dashboard Page (`/teacher`)
 *
 * C-like Analogy:
 * This file serves as the main entry point for the teacher's section of the
 * application, available at the `/teacher` URL. It acts as a strict gatekeeper.
 *
 * Its primary responsibilities are:
 * 1.  **Authentication Check:** It ensures a user is logged in. If not, it redirects
 *     to the login page.
 * 2.  **Authorization Check:** This is crucial. It verifies that the logged-in user
 *     has the `role` of "teacher". If the user is a student, they will be blocked
 *     from seeing the dashboard content.
 * 3.  **Render Dashboard:** If the user is an authenticated teacher, it renders the
 *     main `TeacherDashboard` component, which contains all the tools for customizing
 *     the AI.
 *
 * Like the account page, this is a "Client Component" (`'use client'`) because it
 * needs to check the user's role, which is stored in the browser's `sessionStorage`.
 */
'use client'

// Import necessary components and hooks.
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard'
import { useUser } from '@/firebase' // Hook to get user authentication status.
import { useRouter } from 'next/navigation' // Hook for redirects.
import { useEffect, useState } from 'react' // React's core hooks.
import { SidebarLayout } from '@/components/layout/sidebar-layout'

/**
 * C-like Explanation: `function TeacherPage() -> returns JSX_Element`
 *
 * This is the main function for the teacher dashboard page.
 *
 * Internal State (Global Variables for this function):
 *   - `user`, `isUserLoading`: From Firebase auth, tracks login status.
 *   - `userInfo`: A struct-like object to hold the user's role, fetched from
 *     `sessionStorage`. Using `useState` means the component will re-render
 *     when this data is loaded.
 *   - `router`: An object for handling redirects.
 */
export default function TeacherPage() {
  // Get user authentication status.
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  // State to hold the user's profile info (especially the role).
  // `useState` initializes it to `null`.
  const [userInfo, setUserInfo] = useState<{ role?: string } | null>(null)

  // This `useEffect` hook handles both authentication and authorization.
  // It runs after the component renders and when `user` or `isUserLoading` changes.
  useEffect(() => {
    // C-like pseudocode:
    // void onComponentUpdate() {
    //   // 1. Check Auth: If loading is done and user is NULL, redirect.
    //   if (!isUserLoading && !user) {
    //     redirectTo('/login');
    //     return; // Stop further execution.
    //   }
    //
    //   // 2. Check Authorization: If user exists, check their role.
    //   if (user) {
    //     // Read the user's profile from browser session storage.
    //     // This was saved here during the login process for quick access.
    //     string storedInfoJson = sessionStorage.getItem('lyra-user-info');
    //     if (storedInfoJson) {
    //       // Parse the JSON string into a struct-like object.
    //       UserInfo info = JSON.parse(storedInfoJson);
    //       // Update our component's state with this info.
    //       setUserInfo(info);
    //     }
    //   }
    // }
    if (!isUserLoading && !user) {
      router.push('/login')
    }
    if (user) {
      // Fetch the user's role from session storage for a quick authorization check.
      const storedInfo = sessionStorage.getItem('lyra-user-info')
      if (storedInfo) {
        setUserInfo(JSON.parse(storedInfo))
      }
    }
  }, [isUserLoading, user, router]) // Dependency array.

  // This is the combined loading and authorization check.
  // Render a "Loading..." or "Access Denied" message if:
  // 1. We are still checking the user's login status (`isUserLoading`).
  // 2. The user is not logged in (`!user`).
  // 3. The user's role is not 'teacher' (`userInfo?.role !== 'teacher'`).
  // The `?.` is optional chaining: it safely accesses `role` only if `userInfo` is not null.
  if (isUserLoading || !user || userInfo?.role !== 'teacher') {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading or unauthorized...</p>
      </div>
    )
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
  )
}
