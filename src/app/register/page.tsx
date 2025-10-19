/**
 * @fileoverview Registration Page (`/register`)
 *
 * C-like Analogy:
 * This file is the entry point for the `/register` URL of the application.
 * Much like the login page, its primary job is to display the registration form.
 *
 * It does two main things:
 * 1.  Provides a centered, styled background for the page.
 * 2.  Renders the `RegisterForm` component, which contains all the fields (name,
 *     email, password, role, etc.) and the logic for creating a new user account.
 * 3.  Uses `<Suspense>` to show a loading state, which is a good practice for
 *     pages that might have complex components.
 */

import { RegisterForm } from '@/components/auth/register-form';
import { Suspense } from 'react';

/**
 * C-like Explanation: `function RegisterPage() -> returns JSX_Element`
 *
 * This is the main function for this page. Because it's named `page.tsx` and
 * is inside the `/register` folder, Next.js automatically makes it the view for
 * the `your-website.com/register` URL.
 *
 * It returns JSX that describes the simple structure of the registration page.
 */
export default function RegisterPage() {
  return (
    // This `div` is the main container for the page.
    // It uses Tailwind CSS classes to center its content both vertically and horizontally.
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/*
        The `<Suspense>` component wraps the `RegisterForm`.
        If `RegisterForm` had to load data or code before rendering, the `fallback`
        UI would be displayed to the user, preventing a blank screen.
      */}
      <Suspense fallback={<div>Loading...</div>}>
        {/*
          This renders the actual registration form. All the complex logic for form
          state, validation, password strength checking, and communicating with
          Firebase to create an account is encapsulated inside the `RegisterForm` component.
          This separation of concerns keeps our page file clean and focused.
          It's like calling a single function to handle the entire registration UI: `renderRegistrationScreen();`
        */}
        <RegisterForm />
      </Suspense>
    </div>
  );
}
