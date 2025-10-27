// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview About Page (`/about`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file renders the static "About Lyra" page. It explains the project's
 * motivation, the core technologies it uses (RAG, Vector DBs, Prompt Engineering),
 * and its open-source license. As a static page, it doesn't involve complex state
 * management or user interactions.
 *
 * C-like Analogy:
 * This file is like a very simple C program that only uses `printf` statements
 * to display pre-defined, static information to the console. It takes no user
 * input and has no complex logic. Its sole purpose is to render a pre-written
 * screen of information.
 *
 * In Next.js, this is a "Server Component" by default. This means the server
 * generates the complete HTML for the page, which is then sent to the user's
 * browser. This is very efficient for pages with static content like this one.
 */

// Like `#include` in C, these lines import necessary "libraries" or components.
// We are importing UI components (like Card, Button) and icons to build the page.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BrainCircuit,
  Database,
  Languages,
  ArrowRight,
  Shield,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarLayout } from '@/components/layout/sidebar-layout'; // The main layout with the navigation sidebar.
import Image from 'next/image'; // Next.js's optimized image component.

/**
 * The main component function for the About Page.
 * In Next.js, a file named `page.tsx` inside a folder (like `/about`)
 * automatically becomes a page accessible at that URL (e.g., your-website.com/about).
 *
 * @returns {JSX.Element} The JSX code that represents the page's structure and content.
 *
 * C-like Analogy:
 * Think of this as the `main()` function for this specific page. Its `return`
 * value is the visual output that gets "printed" to the user's screen.
 */
export default function AboutPage() {
  // The `return` statement contains the JSX that defines the page's structure.
  // It's like a series of nested `printf` statements building the visual layout.
  return (
    // All content is wrapped in `<SidebarLayout>`, which provides the consistent
    // navigation sidebar and overall page structure found on most pages.
    <SidebarLayout>
      {/*
        This is the main content area for the page. The classNames are for styling
        using Tailwind CSS (e.g., `container` for centering, `p-4` for padding,
        `animate-fade-in-down` for a simple entry animation).
      */}
      <div className='container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 animate-fade-in-down'>
        {/* A `<Card>` component is used to group content in a visually distinct box with a border and background. */}
        <Card className='overflow-hidden shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20'>
          <CardHeader
            className='text-center bg-primary/5 p-10 animate-fade-in-down'
            style={{ animationDelay: '0.2s' }}
          >
            {/* Display the Lyra logo image. */}
            <div
              className='flex justify-center items-center mb-4 animate-scale-in'
              style={{ animationDelay: '0.3s' }}
            >
              <Image
                src='/logo.png'
                alt='Lyra AI Tutor Logo'
                width={80}
                height={80}
              />
            </div>
            {/* The main title of the card. */}
            <CardTitle className='font-headline text-5xl'>Lyra</CardTitle>
            <p className='text-muted-foreground text-lg'>
              An Ethical AI Tutor, Customizable by Teachers
            </p>
          </CardHeader>
          <CardContent className='p-6 md:p-10 space-y-12'>
            {/* Section explaining the motivation behind Lyra. */}
            <div
              className='prose prose-lg max-w-none dark:prose-invert animate-fade-in-up'
              style={{ animationDelay: '0.4s' }}
            >
              <h2 className='font-headline text-3xl'>Our Motivation</h2>
              <p>
                In today’s classrooms, AI is often met with suspicion. Educators
                fear that students will outsource thinking. The real challenge
                is not to ban AI, but to integrate it as a tool for critical
                thinking. Lyra is designed to be a smart, pedagogical assistant
                that guides students through problems with hints and Socratic
                questioning, much like a real tutor. It encourages students to
                verbalize their thought processes—a technique known as rubber
                duck debugging—to help them arrive at solutions on their own.
              </p>
            </div>

            {/* Section describing the core technical components. */}
            <div
              className='animate-fade-in-up'
              style={{ animationDelay: '0.6s' }}
            >
              <h2 className='font-headline text-3xl text-center mb-8'>
                Core Components
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
                {/* Each item uses an icon, a heading, and a short description to explain a concept. */}
                <div
                  className='flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up'
                  style={{ animationDelay: '0.7s' }}
                >
                  <BrainCircuit className='h-12 w-12 text-primary mb-4' />
                  <h3 className='font-headline text-xl mb-2'>
                    Retrieval-Augmented Generation
                  </h3>
                  <p className='text-muted-foreground'>
                    Lyra uses RAG to ground its responses in factual,
                    course-specific information, reducing the risk of
                    hallucination.
                  </p>
                </div>
                <div
                  className='flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up'
                  style={{ animationDelay: '0.8s' }}
                >
                  <Database className='h-12 w-12 text-primary mb-4' />
                  <h3 className='font-headline text-xl mb-2'>
                    Vector Databases
                  </h3>
                  <p className='text-muted-foreground'>
                    For fast and semantically relevant information retrieval
                    from lecture notes and documents.
                  </p>
                </div>
                <div
                  className='flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up'
                  style={{ animationDelay: '0.9s' }}
                >
                  <Languages className='h-12 w-12 text-primary mb-4' />
                  <h3 className='font-headline text-xl mb-2'>
                    Prompt Engineering
                  </h3>
                  <p className='text-muted-foreground'>
                    Carefully crafted prompts ensure the AI follows pedagogical
                    rules, adapting to different teaching styles.
                  </p>
                </div>
              </div>
            </div>

            {/* A summary of the project's vision. */}
            <div
              className='text-center animate-fade-in-up'
              style={{ animationDelay: '1s' }}
            >
              <h2 className='font-headline text-3xl'>The Vision</h2>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto mt-4'>
                Lyra aims to be a customizable and scalable AI tutoring platform
                with educational ethics at its core. It's a tool for learning,
                not just for getting answers.
              </p>
            </div>

            {/* A card dedicated to displaying the license information. */}
            <Card
              className='bg-card/80 backdrop-blur-sm border-accent/20 animate-fade-in-up'
              style={{ animationDelay: '1.2s' }}
            >
              <CardHeader className='flex flex-row items-center gap-4'>
                <Scale className='h-8 w-8 text-accent' />
                <CardTitle className='font-headline text-2xl'>
                  Open Source License
                </CardTitle>
              </CardHeader>
              <CardContent className='prose prose-base max-w-none dark:prose-invert'>
                <p>
                  <strong>Copyright © 2025 Akshay K. Rooben Abraham.</strong>
                </p>
                <p>
                  This project is licensed under the{' '}
                  <strong>GNU Affero General Public License v3.0</strong>. This
                  license is designed to ensure that the software remains free
                  and open-source, and that any modifications made available
                  over a network are also shared back with the community. It's a commitment
                  to transparency and collaborative improvement in educational technology.
                </p>
                <p>You are free to use, study, share, and modify this software.
                   For full details, please review the complete license text.
                </p>
                <Button asChild>
                  <a
                    href='https://github.com/akshay-abraham/Lyra/blob/main/LICENSE'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    View AGPL-3.0 License{' '}
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </CardContent>
          {/* This is the footer section of the main card. */}
          <div
            className='bg-primary/5 p-6 text-center animate-fade-in border-t border-primary/10'
            style={{ animationDelay: '1.3s' }}
          >
            <div className='flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4'>
              <span className='flex items-center gap-1.5'>
                <Shield className='h-4 w-4' /> Copyright © 2025 Akshay K.
                Rooben Abraham.
              </span>
            </div>
            {/* This button links to an external website. */}
            <Button
              asChild
              className='group transition-all duration-300 ease-in-out hover:scale-105'
            >
              <a
                href='https://akshayabraham.vercel.app/'
                target='_blank'
                rel='noopener noreferrer'
              >
                Contact Developer{' '}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
