// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Account Page (`/account`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the user account management page. It
 * acts as a gatekeeper, ensuring that only authenticated (logged-in) users can
 * access this page. If a user is not logged in, they are redirected to the
 * `/login` page. For logged-in users, it renders the main `AccountManagement`
 * component, which contains the forms and logic for updating profile information.
 *
 * This component uses client-side rendering (`'use client'`) because it relies
 * on React Hooks (`useEffect`, `useRouter`, `useUser`) that need to run in the
 * browser to check the user's authentication status.
 *
 * C-like Analogy:
 * This file is like a `main()` function for the account section. Its first job
 * is to check a global authentication flag.
 * ```c
 * int main() {
 *   if (!is_user_logged_in()) {
 *     redirect_to_login_page();
 *     return 0; // Exit early
 *   }
 *
 *   // If logged in, render the main account management UI.
 *   render_account_management_screen();
 *   return 0;
 * }
 * ```
 */
'use client';

// Like `#include` in C, these lines import necessary code from other files.
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { AccountManagement } from '@/components/account/account-management';
import { useUser } from '@/firebase'; // A "hook" to get the current logged-in user.
import { useRouter } from 'next/navigation'; // A "hook" for programmatic navigation (redirects).
import { useEffect, Suspense } from 'react'; // React's core hooks for side effects and loading states.
import { LoadingScreen } from '@/components/layout/loading-screen';

/**
 * The main logic component for the account page.
 * It's separated from the default export so it can be wrapped in `<Suspense>`,
 * which handles the initial loading state gracefully.
 *
 * @returns {JSX.Element | null} The account management UI if the user is authenticated, otherwise a loading indicator.
 *
 * C-like Explanation: `function AccountPageContent() -> returns JSX_Element or NULL`
 *
 * Internal State (Global Variables for this function):
 *   - `user`: A struct-like object containing the current user's data (or NULL).
 *   - `isUserLoading`: A boolean flag, `true` while checking auth status.
 *
 * Hooks (Special Lifecycle Functions):
 *   - `useUser`: Fetches the current user's auth state from the global Firebase context.
 *   - `useRouter`: Gives us access to navigation functions for redirects.
 *   - `useEffect`: Runs side-effects, like checking auth status and redirecting if necessary.
 */
function AccountPageContent() {
  // Get the user's status from our custom `useUser` hook.
  // It's like calling a function: `User* user = getUser(); bool isLoading = isUserStillLoading();`
  const { user, isUserLoading } = useUser();
  const router = useRouter(); // Get the router object for redirects.

  // `useEffect` is a special React function that runs code *after* the component
  // has rendered. It's perfect for actions that interact with the browser,
  // like checking authentication and redirecting a user.
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
      router.push('/login');
    }
  }, [isUserLoading, user, router]); // The "dependency array": this effect re-runs ONLY when these values change.

  // While we're checking the user's login status, or if we've determined
  // they are not logged in (and are about to be redirected), show the loading screen.
  if (isUserLoading || !user) {
    return <LoadingScreen />;
  }

  // If the user is successfully loaded and authenticated, render the main page content.
  return (
    <SidebarLayout>
      <div className='p-4 sm:p-6 lg:p-8 animate-fade-in'>
        {/*
          Render the `AccountManagement` component. This is like calling another
          function that is responsible for displaying the actual form fields
          for name, email, etc. This keeps our code organized and modular.
        */}
        <AccountManagement />
      </div>
    </SidebarLayout>
  );
}

/**
 * The main exported component for this page, which Next.js uses to render `/account`.
 * Its only job is to wrap our main content (`AccountPageContent`) inside a
 * `<Suspense>` boundary. This tells React: "While `AccountPageContent` is doing
 * its initial data loading (like checking for a user), show the `fallback` UI
 * instead." Once the loading is done, React automatically swaps the fallback
 * with the actual content.
 *
 * @returns {JSX.Element} The Suspense boundary wrapping the page content.
 */
export default function AccountPage() {
  return (
    // The `fallback` is what users see while the main component is loading.
    <Suspense fallback={<LoadingScreen />}>
      <AccountPageContent />
    </Suspense>
  );
}
