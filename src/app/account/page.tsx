// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Account Page (`/account`)
 *
 * C-like Analogy:
 * This file acts as the entry point for the user account management page.
 * It's responsible for ensuring that only logged-in users can access this page.
 *
 * Its main job is to:
 * 1.  Check if a user is currently authenticated.
 * 2.  If the user is not logged in, it redirects them to the `/login` page.
 * 3.  If the user *is* logged in, it displays the main `AccountManagement` component,
 *     which contains all the forms and logic for updating profile information.
 *
 * It uses a technique called "client-side rendering" (`'use client'`) because
 * it needs to access browser features (like checking the user's login status)
 * that aren't available on the server.
 *
 * It also uses React's `<Suspense>` component. This is like a placeholder that
 * shows a "Loading..." message while the page is waiting for necessary data
 * (like the user's authentication status) to be ready.
 */
'use client'

// Like `#include` in C, these lines import necessary code from other files.
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { AccountManagement } from '@/components/account/account-management'
import { useUser } from '@/firebase' // A "hook" to get the current logged-in user.
import { useRouter } from 'next/navigation' // A "hook" for programmatic navigation (redirects).
import { useEffect, Suspense } from 'react' // React's core hooks.

/**
 * C-like Explanation: `function AccountPageContent() -> returns JSX_Element or string`
 *
 * This is the main logic component for the page. We split it from the `export default`
 * function so we can wrap it in `<Suspense>`.
 *
 * Internal State (Global Variables for this function):
 *   - `user`: A struct-like object containing the current user's data (or NULL).
 *   - `isUserLoading`: A boolean flag, `true` while checking auth status.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useUser`: Fetches the current user's auth state.
 *   - `useRouter`: Gives us access to the navigation functions.
 *   - `useEffect`: Runs side-effects, like checking auth and redirecting.
 */
function AccountPageContent() {
  // Get the user's status from our custom `useUser` hook.
  // It's like calling a function: `User* user = getUser(); bool isLoading = isUserStillLoading();`
  const { user, isUserLoading } = useUser()
  const router = useRouter() // Get the router object for redirects.

  // `useEffect` is a special React function that runs code *after* the component
  // has rendered. It's perfect for actions that interact with the outside world,
  // like redirecting a user.
  useEffect(() => {
    // C-like pseudocode:
    //
    // void onComponentUpdate() {
    //   // This function is automatically called when `isUserLoading` or `user` changes.
    //
    //   // Check if we are done loading the user status AND if the user is NULL.
    //   if (!isUserLoading && !user) {
    //     // If both are true, it means the user is not logged in.
    //     // Redirect them to the login page.
    //     redirectTo('/login');
    //   }
    // }
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [isUserLoading, user, router]) // The "dependency array": this effect re-runs ONLY when these values change.

  // While we're checking the user's login status, or if we've determined
  // they are not logged in (and are about to be redirected), show a loading message.
  if (isUserLoading || !user) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  // If the user is successfully loaded and authenticated, render the main page content.
  return (
    <SidebarLayout>
      <div className='p-4 sm:p-6 lg:p-8 animate-fade-in'>
        {/*
                  Render the `AccountManagement` component. This is like calling another
                  function that is responsible for displaying the actual form fields
                  for name, email, etc. This keeps our code organized.
                */}
        <AccountManagement />
      </div>
    </SidebarLayout>
  )
}

/**
 * C-like Explanation: `function AccountPage() -> returns JSX_Element`
 *
 * This is the main exported function for this file, which Next.js uses to render
 * the `/account` page.
 *
 * Its only job is to wrap our main content (`AccountPageContent`) inside a
 * `<Suspense>` boundary. This tells React: "While `AccountPageContent` is doing
 * its initial data loading (like checking for a user), show this `fallback` UI
 * instead." Once the loading is done, React automatically swaps the fallback
s
 * with the actual content.
 */
export default function AccountPage() {
  return (
    // The `fallback` is what users see while the main component is loading.
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-screen'>
          <p>Loading...</p>
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  )
}
