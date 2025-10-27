// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview `useIsMobile` custom hook.
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a simple custom React hook, `useIsMobile`, that detects whether
 * the user's browser window is currently at a "mobile" width. This is useful for
 * building responsive components that need to change their behavior or layout based
 * on the screen size, without relying solely on CSS media queries.
 *
 * It uses the `window.matchMedia` API, which is a modern and efficient way to
 * check if the document matches a given media query string.
 *
 * C-like Analogy:
 * This is like a utility function that checks a system property.
 *
 * ```c
 * #define MOBILE_BREAKPOINT 768
 *
 * bool is_mobile_view() {
 *   int screen_width = get_current_screen_width();
 *   return screen_width < MOBILE_BREAKPOINT;
 * }
 * ```
 * The hook is more advanced because it also listens for changes, so if the user
 * resizes their browser window from desktop to mobile size, the hook will
 * automatically update and cause the components using it to re-render.
 */
import * as React from 'react';

// The pixel width below which we consider the viewport to be "mobile".
const MOBILE_BREAKPOINT = 768;

/**
 * A custom hook that returns `true` if the viewport width is less than the mobile breakpoint.
 *
 * @returns {boolean} `true` if the current screen width is considered mobile, otherwise `false`.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // `window.matchMedia` creates a media query list object.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // This is the callback function that will run whenever the result of the media query changes.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add the listener.
    mql.addEventListener('change', onChange);

    // Set the initial value on component mount.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Return a cleanup function. This will be called when the component unmounts.
    // It's crucial for preventing memory leaks by removing the event listener.
    return () => mql.removeEventListener('change', onChange);
  }, []); // The empty dependency array `[]` ensures this effect runs only once on mount.

  // Return the boolean value. The `!!` converts `undefined` to `false` initially.
  return !!isMobile;
}
