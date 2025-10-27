// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Page (`/login`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/login` route of the application.
 * Its main responsibility is to display the login form to the user. It provides a
 * centered layout and renders the `LoginForm` component, which encapsulates all
 * the actual logic for handling user input, validation, and authentication.
 *
 * C-like Analogy:
 * This file is like a very simple C function that sets up the screen environment
 * (e.g., clearing the screen, setting a background color) and then calls a single,
 * more complex function to handle the main task.
 *
 * ```c
 * void show_login_page() {
 *   // 1. Set up the container and center it.
 *   setup_centered_layout();
 *
 *   // 2. Render the actual login form UI and logic.
 *   render_login_form_component();
 * }
 * ```
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';

/**
 * The main component for the login page.
 * Because it's named `page.tsx` and is inside the `/login` folder, Next.js
 * automatically maps this component to the `/login` URL.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the login page.
 */
export default function LoginPage() {
  return (
    // This `div` acts as a container for the whole page.
    // The `className` uses Tailwind CSS utility classes to style it:
    // - `flex items-center justify-center`: This common combination centers a child element horizontally and vertically.
    // - `min-h-screen`: Makes the container take up at least the full height of the browser screen.
    // - `bg-background`: Sets the background color using the CSS variable defined in `globals.css`.
    // - `p-4`: Applies padding around the content.
    <div className='flex items-center justify-center min-h-screen bg-background p-4'>
      {/*
        The `<Suspense>` component is a React feature for handling loading states.
        It tells React: "Try to render the component inside me (`LoginForm`). While it's
        loading any required code or data, show the `fallback` UI instead." This is
        useful for code splitting, where `LoginForm` might be loaded on demand.
      */}
      <Suspense fallback={<LoadingScreen />}>
        {/*
          This renders the actual login form component. All the logic for handling
          user input, validation, and communicating with Firebase is contained within
          `@/components/auth/login-form.tsx`. This separation keeps our page file clean
          and simple, focusing only on layout. It's like calling a function: `renderLoginFormScreen();`
        */}
        <LoginForm />
      </Suspense>
    </div>
  );
}
