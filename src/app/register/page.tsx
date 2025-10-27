// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Registration Page (`/register`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/register` route. Much like the
 * login page, its primary job is to provide a centered layout and display the
 * `RegisterForm` component. This component encapsulates all the complex logic for
 * the registration process, including form fields, validation, and account creation.
 *
 * C-like Analogy:
 * This file is like a simple `main` function for the registration feature. It
 * sets up the visual container and then calls the primary function that handles
 * all the heavy lifting.
 *
 * ```c
 * void show_register_page() {
 *   // 1. Set up the container and center it on the screen.
 *   setup_centered_layout();
 *
 *   // 2. Render the actual registration form UI and logic.
 *   render_registration_form_component();
 * }
 * ```
 */

import { RegisterForm } from '@/components/auth/register-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';

/**
 * The main component for the registration page.
 * Because it's named `page.tsx` and is inside the `/register` folder, Next.js
 * automatically maps this component to the `/register` URL.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the registration page.
 */
export default function RegisterPage() {
  return (
    // This `div` is the main container for the page, using Tailwind CSS classes
    // to center its content both vertically and horizontally.
    <div className='flex items-center justify-center min-h-screen bg-background p-4'>
      {/*
        The `<Suspense>` component wraps the `RegisterForm`. If `RegisterForm` had
        to load data or code asynchronously before rendering, the `fallback` UI
        (our `LoadingScreen`) would be displayed to the user, preventing a blank screen.
      */}
      <Suspense fallback={<LoadingScreen />}>
        {/*
          This renders the actual registration form. All the complex logic for form
          state management, validation, password strength checking, and communicating with
          Firebase to create a new user account is encapsulated inside the `RegisterForm` component.
          This separation of concerns keeps our page file clean and focused on layout.
        */}
        <RegisterForm />
      </Suspense>
    </div>
  );
}
