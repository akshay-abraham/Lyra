// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Page (`/login`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/login` route of the application.
 * It has been redesigned into a sophisticated, two-column layout to provide a
 * more engaging and informative welcome experience for users.
 *
 * Left Column: A dynamic introduction to Lyra's pedagogical mission.
 * Right Column: The focused login form.
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { Logo } from '@/components/layout/logo';
import { CheckCircle } from 'lucide-react';

/**
 * The main component for the redesigned login page.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the login page.
 */
export default function LoginPage() {
  const features = [
    'Ethical AI with Pedagogical Guardrails',
    'Customizable by Teachers for Any Subject',
    'Focus on Guidance, Not Just Answers',
    'Encourages Critical Thinking',
  ];

  return (
    <div className='w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen'>
      <div className='hidden bg-background lg:block animated-gradient'>
        <div className='flex flex-col justify-between h-full p-8 text-white'>
          <div className='flex items-center gap-2 text-lg font-medium'>
            <Logo />
            <span className='font-headline text-2xl'>Lyra</span>
          </div>
          <div className='space-y-4'>
            <h1 className='text-4xl font-bold font-headline shadow-lg'>
              The Future of AI in Education Starts Here.
            </h1>
            <p className='text-lg text-gray-200/80 shadow-md'>
              Lyra is an ethical AI tutor designed to guide students toward
              solutions, not just give them away. Empower students, support
              teachers.
            </p>
            <div className='space-y-2 pt-4'>
              {features.map((feature, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5 text-green-400' />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <footer className='text-sm text-gray-200/60'>
            Copyright © 2025 Akshay K Rooben Abraham. All rights reserved.
          </footer>
        </div>
      </div>
      <div className='flex items-center justify-center py-12 min-h-screen'>
        {/*
          The `<Suspense>` component is a React feature for handling loading states.
          It tells React: "Try to render the component inside me (`LoginForm`). While it's
          loading any required code or data, show the `fallback` UI instead."
        */}
        <Suspense fallback={<LoadingScreen />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
