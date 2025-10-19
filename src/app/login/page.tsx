// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Login Page (`/login`)
 *
 * C-like Analogy:
 * This file is the entry point for the `/login` URL of the application.
 * Its main responsibility is to display the login form to the user.
 *
 * It's a very simple component that does three things:
 * 1.  Provides a centered, styled background for the page.
 * 2.  Renders the `LoginForm` component, which contains the actual email/password
 *     fields and submission logic.
 * 3.  Wraps the `LoginForm` in a `<Suspense>` boundary. This is a good practice
 *     that shows a "Loading..." fallback in case the `LoginForm` component itself
 *     needs to load any data asynchronously (though in this case, it's very fast).
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

/**
 * C-like Explanation: `function LoginPage() -> returns JSX_Element`
 *
 * This is the main function for this page. Because it's named `page.tsx` and
 * is inside the `/login` folder, Next.js automatically makes it the view for
 * the `your-website.com/login` URL.
 *
 * It returns JSX that describes the simple structure of the login page.
 */
export default function LoginPage() {
  return (
    // This `div` acts as a container for the whole page.
    // The `className` uses Tailwind CSS utility classes to style it:
    // - `flex items-center justify-center`: This is a common combination to center an element horizontally and vertically.
    // - `min-h-screen`: Makes the container take up at least the full height of the browser screen.
    // - `bg-background`: Sets the background color using the CSS variable defined in `globals.css`.
    // - `p-4`: Applies padding.
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/*
        The `<Suspense>` component is a React feature for handling loading states.
        It tells React: "Try to render the component inside me (`LoginForm`). While it's
        loading any required code or data, show the `fallback` UI instead."
      */}
      <Suspense fallback={<div>Loading...</div>}>
        {/*
          This renders the actual login form component. All the logic for handling
          user input, validation, and talking to Firebase is contained within
          `@components/auth/login-form.tsx`. This keeps our page file clean and simple.
          It's like calling a function: `renderLoginFormScreen();`
        */}
        <LoginForm />
      </Suspense>
    </div>
  );
}
