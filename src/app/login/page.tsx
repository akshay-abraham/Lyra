// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Page (`/login`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/login` route of the application.
 * It has been redesigned into a sophisticated, single-section landing page to provide a
 * more engaging and informative welcome experience for users, inspired by modern AI tool websites.
 *
 * It features:
 * - A full-screen container with a powerful, animated gradient background.
 * - A clean header with the application logo and name.
 * - A central "hero" section with a bold headline and a descriptive paragraph.
 * - The login form component is the primary call-to-action, placed centrally.
 * - A "Powered by" section showcasing the core technologies.
 *
 * C-like Analogy:
 * Think of this as the main function for a graphical application's startup screen.
 * It sets up the main window (`div` with `min-h-screen`), draws the background,
 * renders the header, and then displays the main content (the hero text and login form).
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { Logo } from '@/components/layout/logo';

/**
 * The main component for the redesigned login page.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the login page.
 */
export default function LoginPage() {
  const technologies = [
    'Next.js',
    'Firebase',
    'Genkit',
    'React',
    'Tailwind CSS',
  ];

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-background'>
      {/* The animated background is a separate div placed behind everything else. */}
      <div className='animated-background'></div>

      {/* Main container for the page content. */}
      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center p-4 text-center'>
        <header className='absolute top-0 left-0 w-full p-4 sm:p-6'>
          <div className='flex items-center gap-3'>
            <Logo />
            <span className='font-headline text-2xl font-bold text-foreground'>
              Lyra
            </span>
          </div>
        </header>

        <main className='flex w-full flex-col items-center space-y-8'>
          <div
            className='max-w-3xl animate-fade-in-up'
            style={{ animationDelay: '0.2s' }}
          >
            <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline gradient-text'>
              An Ethical AI Tutor,
              <br />
              Customizable by Teachers.
            </h1>
            <p className='mt-6 text-lg leading-8 text-muted-foreground'>
              Lyra is designed to guide students toward solutions, not just give
              them away. Empower students and support teachers with
              pedagogical guardrails you control.
            </p>
          </div>

          {/*
            The `<Suspense>` component is a React feature for handling loading states.
            It tells React: "Try to render the component inside me (`LoginForm`). While it's
            loading any required code or data, show the `fallback` UI instead."
          */}
          <Suspense fallback={<LoadingScreen />}>
            <LoginForm />
          </Suspense>
        </main>

        <footer
          className='absolute bottom-0 w-full p-6 text-center animate-fade-in-up'
          style={{ animationDelay: '0.6s' }}
        >
          <p className='text-sm font-medium text-muted-foreground mb-3'>
            Powered by
          </p>
          <div className='flex justify-center items-center gap-x-4 gap-y-2 flex-wrap'>
            {technologies.map((tech, index) => (
              <div
                key={tech}
                className='text-sm text-muted-foreground font-semibold animate-fade-in-up'
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                {tech}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
