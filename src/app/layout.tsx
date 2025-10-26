// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Root Layout (`layout.tsx`)
 *
 * C-like Analogy:
 * This file is the absolute root of your application's UI. Think of it as the
 * `main()` function that every other part of the program runs inside of.
 *
 * In Next.js, this `layout.tsx` file wraps around every single page. The `children`
 * prop is where the actual page content (like `page.tsx` from the `about` or `login`
 * folders) gets rendered.
 *
 * Its primary jobs are:
 * 1.  Define the `<html>` and `<body>` tags for the entire application.
 * 2.  Load global assets, like fonts and the main stylesheet (`globals.css`).
 * 3.  Set up global "providers". A provider is a component that gives all of its
 *     children access to some shared data or functionality. Here, we set up
 *     the `FirebaseClientProvider` to make the Firebase connection available to all pages.
 * 4.  Define metadata for the site (like the title that appears in the browser tab).
 */

// Import necessary types and components.
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google'; // Google font loading utility.
import './globals.css'; // The global stylesheet we just looked at.
import { Toaster } from '@/components/ui/toaster'; // Component to display pop-up notifications.
import { FirebaseClientProvider } from '@/firebase/client-provider'; // The global Firebase provider.

// Load the 'Inter' font. This function from Next.js is highly optimized.
// It downloads the font at build time and serves it with the rest of the app,
// preventing layout shifts and improving performance.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Load the 'Sora' font, used for headlines.
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
});

// This is metadata for Search Engine Optimization (SEO) and browser tabs.
// It's like setting the title of your console window.
export const metadata: Metadata = {
  title: 'Lyra: Ethical AI Tutor',
  description: 'An ethical AI tutor for students, customizable by teachers.',
};

/**
 * C-like Explanation: `function RootLayout(props) -> returns JSX_Element`
 *
 * This is the main layout component.
 *
 * Props (Inputs):
 *   - `children`: This is a special prop in React. It represents whatever components
 *     are nested inside this one. In this case, it will be the actual page being viewed.
 *     Think of it as a placeholder where the content of `about/page.tsx` or
 *     `login/page.tsx` will be inserted.
 *
 * Returns:
 *   - The root HTML structure for every page in the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The `<html>` tag, with the language set to English.
    // `suppressHydrationWarning` is a technical setting to avoid warnings in some cases.
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* The <head> tag can contain metadata, links to stylesheets, etc. */}
        {/* Next.js automatically handles much of this for us. */}
      </head>
      {/*
        The `<body>` tag. We apply the font variables we loaded earlier.
        This makes the fonts available as CSS variables (`--font-inter`, `--font-sora`)
        that we can use in our Tailwind CSS configuration.
        `antialiased` is a common class for smoother font rendering.
      */}
      <body
        className={`${inter.variable} ${sora.variable} font-body antialiased bg-background text-foreground`}
      >
        {/*
          This is a Context Provider. It's a critical concept.
          C-like Analogy: Imagine `FirebaseClientProvider` is a function that initializes
          a global struct, let's call it `g_firebase_connection`. Any function or component
          called within this provider (i.e., `children`) can now access `g_firebase_connection`
          without it being passed down as an argument to every single function.
          It makes the Firebase app, auth, and firestore instances available everywhere.
        */}
        <FirebaseClientProvider>
          {/*
            This is where the actual page content is rendered. If you are viewing
            the `/login` page, the content of `login/page.tsx` appears here.
          */}
          {children}
        </FirebaseClientProvider>
        {/*
          The `<Toaster>` component is placed here at the root. It doesn't display
          anything by default, but it listens for "toast" events. When any other
          component in the app calls the `toast()` function, this component is
          responsible for rendering the pop-up notification on the screen.
        */}
        <Toaster />
      </body>
    </html>
  );
}
