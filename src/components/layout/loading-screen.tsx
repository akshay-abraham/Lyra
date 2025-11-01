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
  'Loading...',
  'Brewing thoughts...',
  'Warming up the circuits...',
  'Gathering knowledge...',
  'Just a moment...',
];

/**
 * A full-page loading indicator component with animated logo and text.
 *
 * @returns {JSX.Element} The rendered loading screen.
 */
export function LoadingScreen() {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setCurrentText(loadingTexts[index]);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-background'>
      <div className='animate-pulse'>
        <Logo />
      </div>
      <p className='mt-4 text-sm text-muted-foreground transition-opacity duration-500'>
        {currentText}
      </p>
    </div>
  );
}
