// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Reusable Loading Screen Component (`loading-screen.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This component provides a visually appealing, animated loading screen that can be
 * used anywhere in the application. It displays the Lyra logo with a subtle
 * pulsing animation and cycling text to give the user feedback that something
 * is happening in the background. It's used by the root `loading.tsx` as a
 * suspense fallback and can also be used for page-specific loading states.
 *
 * C-like Analogy:
 * This is a simple, reusable utility function, like `void show_animated_spinner()`.
 * You can call this function from anywhere in your code to display a consistent
 * loading animation, rather than having to redraw it manually each time. It
 * encapsulates the details of the animation and styling.
 */
'use client';
import { Logo } from './logo';
import { useState, useEffect } from 'react';

const loadingTexts = [
  'Brewing cosmic thoughts...',
  'Warming up the idea engine...',
  'Gathering stardust and knowledge...',
  'Juggling neurons...',
  'Asking the big questions...',
  'Finding the perfect analogy...',
  'Reticulating splines...',
  'Polishing the answer...',
];

/**
 * A full-page loading indicator component with animated logo and text.
 *
 * @returns {JSX.Element} The rendered loading screen.
 */
export function LoadingScreen() {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setCurrentText(loadingTexts[index]);
      setTextKey(prevKey => prevKey + 1); // Increment key to re-trigger animation
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-background overflow-hidden relative'>
      {/* Animated background shapes */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute top-[10%] left-[10%] h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float1' />
        <div className='absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float2' />
        <div className='absolute top-[50%] right-[20%] h-48 w-48 rounded-full bg-secondary/20 blur-2xl animate-float3' />
      </div>

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center justify-center'>
        <div className='animate-bounce-in'>
          <Logo />
        </div>
        <p key={textKey} className='mt-6 text-sm text-muted-foreground animate-pop-in'>
          {currentText}
        </p>
      </div>
    </div>
  );
}
