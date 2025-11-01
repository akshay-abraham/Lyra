// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Root Layout (`layout.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines the root layout for the entire Next.js application. It is the
 * top-most component and wraps around every single page. Think of it as the
 * foundational `<html>` and `<body>` structure for the whole site.
 *
 * Its primary responsibilities are:
 * 1.  Defining the `<html>` and `<body>` tags.
 * 2.  Loading global assets like fonts (Inter, Sora) and the main stylesheet (`globals.css`).
 * 3.  Setting up global "providers". A provider is a component that gives all of its
 *     children access to some shared data or functionality. Here, we set up
 *     the `FirebaseClientProvider` to make the Firebase connection available to all pages.
 * 4.  Providing a `<Toaster>` component, which is a global sink for displaying pop-up notifications.
 * 5.  Defining top-level metadata for the site (like the title and description for SEO).
 *
 * C-like Analogy:
 * This file is the absolute root of the application's UI, analogous to the `main()`
 * function that sets up the global environment before any other code runs.
 *
 * ```c
 * int main(int argc, char* argv[]) {
 *   // 1. Load global configurations and styles.
 *   load_fonts();
 *   load_global_stylesheet();
 *
 *   // 2. Initialize global services (like the database connection).
 *   FirebaseServices* services = initialize_firebase_globally();
 *
 *   // 3. Render the specific page requested by the user, passing the global services to it.
 *   render_page(argv[1], services);
 *
 *   return 0;
 * }
 * ```
 * The `children` prop in `RootLayout` is where the actual page content (e.g., `about/page.tsx`) gets rendered.
 */

// Import necessary types and components.
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google'; // Google font loading utility from Next.js.
import './globals.css'; // The global stylesheet.
import { Toaster } from '@/components/ui/toaster'; // Component to display pop-up notifications (toasts).
import { FirebaseClientProvider } from '@/firebase/client-provider'; // The global Firebase provider.
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Load the 'Inter' font for body text. This function from Next.js is highly optimized.
// It downloads the font at build time and serves it with the rest of the app,
// preventing layout shifts ("flash of unstyled text") and improving performance.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Load the 'Sora' font, used for headlines.
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
});

// This is metadata for Search Engine Optimization (SEO) and for the browser tab.
// It's like setting the title of your console window.
export const metadata: Metadata = {
  title: 'Lyra: Ethical AI Tutor',
  description: 'An ethical AI tutor for students, customizable by teachers.',
};

/**
 * The root layout component for the application.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - A special prop in React. It represents whatever components
 *   are nested inside this one. In this case, it will be the actual page being viewed (e.g., `login/page.tsx`).
 *   Think of it as a placeholder where the content of the current route will be inserted.
 * @returns {JSX.Element} The root HTML structure for every page in the application.
 *
 * C-like Explanation: `function RootLayout(props) -> returns JSX_Element`
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The `<html>` tag, with the language set to English.
    // `suppressHydrationWarning` is a technical setting to avoid specific warnings when
    // server-rendered and client-rendered content have minor, unavoidable differences (like timestamps).
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* The <head> tag can contain metadata, links to stylesheets, etc. */}
        {/* Next.js automatically handles much of this for us based on the `metadata` object. */}
      </head>
      {/*
        The `<body>` tag. We apply the font variables we loaded earlier.
        This makes the fonts available as CSS variables (`--font-inter`, `--font-sora`)
        that we can use in our Tailwind CSS configuration (`tailwind.config.ts`).
        `antialiased` is a common class for smoother font rendering in browsers.
      */}
      <body
        className={`${inter.variable} ${sora.variable} font-body antialiased bg-background text-foreground`}
      >
        {/*
          This is a Context Provider. It's a critical concept in React.
          C-like Analogy: Imagine `FirebaseClientProvider` is a function that initializes
          a global struct, let's call it `g_firebase_connection`. Any function or component
          called within this provider (i.e., `children`) can now access `g_firebase_connection`
          without it being passed down as an argument to every single function.
          It makes the Firebase app, auth, and firestore instances available everywhere in the app.
        */}
        <FirebaseClientProvider>
          {/*
            This is where the actual page content is rendered. If you are viewing
            the `/login` page, the content of `login/page.tsx` appears here.
          */}
          {children}
           {/* This component listens for globally emitted errors and displays them. */}
          <FirebaseErrorListener />
        </FirebaseClientProvider>
        {/*
          The `<Toaster>` component is placed here at the root. It doesn't display
          anything by default, but it "listens" for toast events triggered by the `useToast` hook.
          When any other component in the app calls the `toast()` function, this component is
          responsible for rendering the actual pop-up notification on the screen.
        */}
        <Toaster />
      </body>
    </html>
  );
}
