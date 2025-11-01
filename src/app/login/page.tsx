// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Page (`/login`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the entry point for the `/login` route of the application.
 * It has been redesigned into a sophisticated, multi-section landing page to provide a
 * more engaging and informative welcome experience for users, inspired by modern AI tool websites.
 *
 * It features:
 * - A full-screen container with a powerful, animated gradient background.
 * - A clean header with the application logo and name.
 * - A central "hero" section with a bold headline and the login form.
 * - A collapsible "Motivation" section to share the project's story.
 * - Visual, icon-driven cards that highlight Lyra's core pedagogical features.
 * - A "Powered By" section showcasing the technology stack.
 * - A minimal, collapsible license and credits section in the footer.
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { Logo } from '@/components/layout/logo';
import {
  BrainCircuit,
  GraduationCap,
  Sparkles,
  BookOpen,
  Scale,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { GitHubLogo } from '@/components/auth/github-logo';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { VercelLogo } from '@/components/auth/vercel-logo';
import { FirebaseLogo } from '@/components/auth/firebase-logo';
import { NextJsLogo } from '@/components/auth/nextjs-logo';
import { ReactLogo } from '@/components/auth/react-logo';
import { TailwindCssLogo } from '@/components/auth/tailwind-css-logo';

/**
 * The main component for the redesigned login page.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the login page.
 */
export default function LoginPage() {
  const features = [
    {
      icon: <GraduationCap className='h-10 w-10 text-primary' />,
      title: 'Guide, Never Tell',
      description:
        'Lyra acts like a real tutor, asking questions and providing hints instead of giving direct answers.',
    },
    {
      icon: <Sparkles className='h-10 w-10 text-accent' />,
      title: 'Teacher-Powered AI',
      description:
        'Educators can customize the AI’s personality and provide examples to match their teaching style.',
    },
    {
      icon: <BrainCircuit className='h-10 w-10 text-primary' />,
      title: 'Grounded in Your Content',
      description:
        'With RAG, Lyra answers questions based on your uploaded course materials for fact-checked accuracy.',
    },
  ];

  const technologies = [
    { name: 'Next.js', component: <NextJsLogo className='h-12 w-12' /> },
    { name: 'Firebase', component: <FirebaseLogo className='h-12 w-12' /> },
    {
      name: 'Genkit',
      component: (
        <Image
          data-ai-hint='genkit logo'
          src='/genkit.png'
          alt='Genkit logo'
          width={48}
          height={48}
        />
      ),
    },
    { name: 'React', component: <ReactLogo className='h-12 w-12' /> },
    { name: 'Tailwind CSS', component: <TailwindCssLogo className='h-12 w-12' /> },
    { name: 'Vercel', component: <VercelLogo className='h-12 w-12' /> },
  ];

  return (
    <div className='relative min-h-screen w-full overflow-x-hidden bg-background text-foreground'>
      {/* The animated background is a separate div placed behind everything else. */}
      <div className='animated-background'></div>

      {/* Header */}
      <header className='fixed top-0 left-0 w-full p-4 sm:p-6 z-20 bg-background/50 backdrop-blur-sm'>
        <div className='container mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Logo />
            <span className='font-headline text-2xl font-bold text-foreground'>
              Lyra
            </span>
          </div>
          <Button asChild variant='ghost' size='icon'>
            <Link
              href={siteConfig.github}
              target='_blank'
              rel='noopener noreferrer'
            >
              <GitHubLogo className='h-6 w-6' />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main container for all page content. */}
      <div className='relative z-10 flex flex-col items-center justify-center pt-24 text-center'>
        {/* Hero Section */}
        <main
          id='hero'
          className='flex w-full flex-col items-center space-y-8 py-20 px-4'
        >
          <div
            className='max-w-3xl animate-fade-in-up'
            style={{ animationDelay: '0.2s' }}
          >
            <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline gradient-text'>
              An Ethical AI Tutor,
              <br />
              Customizable by Teachers.
            </h1>
            <p className='mt-6 text-lg max-w-2xl mx-auto leading-8 text-muted-foreground'>
              Lyra is designed to guide students toward solutions, not just give
              them away. Empower students and support teachers with pedagogical
              guardrails you control.
            </p>
          </div>
          <Suspense fallback={<LoadingScreen />}>
            <LoginForm />
          </Suspense>
        </main>

        {/* Motivation Section */}
        <section id='motivation' className='w-full py-20 px-4'>
          <div className='container mx-auto max-w-4xl'>
            <Collapsible>
              <div className='text-base text-muted-foreground max-w-none text-center animate-fade-in-up'>
                <p>
                  In today’s classrooms, AI is often met with suspicion. Lyra
                  was born from a different philosophy: that AI can coexist with
                  classrooms under{' '}
                  <strong className='text-foreground'>
                    educational and ethical guardrails
                  </strong>
                  ...{' '}
                  <CollapsibleTrigger asChild>
                    <Button
                      variant='link'
                      className='text-base p-0 text-primary/80 hover:text-accent font-normal'
                    >
                      (see more)
                    </Button>
                  </CollapsibleTrigger>
                </p>
              </div>
              <CollapsibleContent>
                <div className='text-base text-muted-foreground max-w-prose text-left mx-auto mt-8 space-y-4 animate-fade-in-up'>
                  <p>
                    Educators worry that students will{' '}
                    <strong className='text-foreground'>
                      outsource thinking
                    </strong>{' '}
                    — generating essays, solving problem sets, or even writing
                    code entirely with AI. The immediate institutional response
                    has often been prohibition: <em>ban AI outright</em>.
                  </p>
                  <p>
                    But a good human tutor rarely gives the solution directly.
                    Instead, they ask guiding questions, offer hints, and
                    encourage students to verbalize their thought process. This
                    project was inspired by experiences with the{' '}
                    <strong className='text-foreground'>
                      CS50 Rubber Duck Assistant
                    </strong>
                    , which proved that structured, pedagogical guidance is
                    often more valuable than a powerful but undirected AI like
                    GitHub Copilot.
                  </p>
                  <p>
                    Thus, Lyra was born — as a{' '}
                    <strong className='text-foreground'>
                      central AI backend
                    </strong>{' '}
                    designed with <em>pedagogical principles</em> at its core to
                    reduce over-reliance on direct answers and guide learning
                    through hints, analogies, and Socratic questioning.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='w-full py-20 px-4 bg-primary/5'>
          <div className='container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left'>
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className='flex flex-col items-start animate-fade-in-up'
                style={{ animationDelay: `${0.5 + index * 0.2}s` }}
              >
                <div className='p-3 rounded-full border-2 border-primary/10 bg-card mb-4'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-headline font-bold mb-2 text-foreground'>
                  {feature.title}
                </h3>
                <p className='text-muted-foreground'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section id='tech' className='w-full py-20 px-4'>
          <div className='container mx-auto'>
            <h2
              className='text-center text-3xl font-headline font-bold mb-4 animate-fade-in-up'
              style={{ animationDelay: '1.2s' }}
            >
              Powered by a Modern Stack
            </h2>
            <p
              className='text-center text-muted-foreground mb-12 max-w-xl mx-auto animate-fade-in-up'
              style={{ animationDelay: '1.3s' }}
            >
              Built with industry-leading technologies for a reliable,
              scalable, and performant user experience.
            </p>
            <div
              className='flex justify-center items-center gap-x-8 md:gap-x-12 gap-y-6 flex-wrap animate-fade-in-up'
              style={{ animationDelay: '1.4s' }}
            >
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className='flex flex-col items-center gap-3 group'
                >
                  {tech.component}
                  <span className='font-semibold text-muted-foreground group-hover:text-foreground transition-colors'>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='w-full p-8 text-center border-t border-border'>
          <div className='container mx-auto text-xs text-muted-foreground'>
            <Accordion type='single' collapsible className='w-auto'>
              <p>
                © 2025{' '}
                <Link
                  href={siteConfig.developer.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline-offset-4 hover:underline hover:text-foreground'
                >
                  {siteConfig.developer.name} 🔗
                </Link>
                .
                <AccordionItem value='license' className='border-none inline'>
                  <AccordionTrigger className='p-0 text-xs hover:no-underline hover:text-foreground inline-flex ml-1'>
                    All rights reserved.
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='text-xs text-muted-foreground max-w-prose text-left mx-auto mt-4 p-4 bg-card/50 rounded-lg border space-y-2'>
                      <p>
                        <strong>
                          © 2025 {siteConfig.developer.name}. All rights
                          reserved.
                        </strong>
                      </p>
                      <p>
                        This software and all associated materials, including
                        but not limited to the codebase, design, architecture,
                        content, and branding of “Lyra”, are proprietary
                        intellectual property owned by{' '}
                        {siteConfig.developer.name}.
                      </p>
                      <p>
                        Unauthorized reproduction, distribution, modification,
                        or deployment of this system, in whole or in part, is
                        strictly prohibited.
                      </p>
                      <p>
                        For licensing and partnership inquiries, please contact:{' '}
                        <a
                          href={`mailto:akshaykroobenabraham@gmail.com`}
                          className='underline'
                        >
                          akshaykroobenabraham@gmail.com
                        </a>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </p>
            </Accordion>
          </div>
        </footer>
      </div>
    </div>
  );
}
