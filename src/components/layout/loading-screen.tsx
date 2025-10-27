// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Reusable Loading Screen Component (`loading-screen.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This component provides a visually appealing, animated loading screen that can be
 * used anywhere in the application. It displays the Lyra logo with a subtle
 * pulsing animation to give the user feedback that something is happening in the
 * background. It's used by the root `loading.tsx` as a suspense fallback and can
 * also be used for page-specific loading states.
 *
 * C-like Analogy:
 * This is a simple, reusable utility function, like `void show_animated_spinner()`.
 * You can call this function from anywhere in your code to display a consistent
 * loading animation, rather than having to redraw it manually each time. It
 * encapsulates the details of the animation and styling.
 */

import { Logo } from './logo';

/**
 * A full-page loading indicator component.
 *
 * @returns {JSX.Element} The rendered loading screen.
 */
export function LoadingScreen() {
  return (
    <div className='flex items-center justify-center h-screen w-screen bg-background'>
      <div className='animate-pulse'>
        <Logo />
      </div>
    </div>
  );
}
