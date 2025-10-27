// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Global Loading Page (`loading.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file leverages a special Next.js App Router convention. A file named `loading.tsx`
 * at any level of the `app` directory automatically creates a loading UI for that
 * route segment and all its children. It wraps the `page.tsx` file in a React
 * Suspense boundary.
 *
 * When data is being fetched in a Server Component within the same route segment
 * (e.g., in `page.tsx`), Next.js will render this `Loading` component as a fallback
 * UI until the data fetching is complete. This prevents the user from seeing a blank
 * or partially loaded page and improves the perceived performance.
 *
 * C-like Analogy:
 * Think of this as a default "Please Wait..." screen. Before your C program's main
 * display function (`render_page_content()`) is ready to run (perhaps it's waiting
 * for a network resource), the system automatically calls `render_loading_screen()` first.
 * Once `render_page_content()` has its data and finishes, the system replaces the
 * loading screen with the final output.
 */

import { LoadingScreen } from '@/components/layout/loading-screen';

/**
 * The component rendered by Next.js as the suspense fallback.
 *
 * @returns {JSX.Element} The loading screen UI.
 */
export default function Loading() {
  // This simply renders our centralized, reusable LoadingScreen component.
  return <LoadingScreen />;
}
