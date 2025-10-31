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
 * - Visual, icon-driven cards that highlight Lyra's core pedagogical features.
 * - A visually rich "Powered by" section showcasing the core technologies with logos.
 * - A footer with credits for the developer and mentor.
 */

import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { Logo } from '@/components/layout/logo';
import {
  BrainCircuit,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { GitHubLogo } from '@/components/auth/github-logo';

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
              {siteConfig.technologies.map((tech, index) => (
                <a
                  href='#'
                  key={tech.name}
                  className='flex flex-col items-center gap-3 group'
                >
                  <Image
                    data-ai-hint={tech.name.toLowerCase()}
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    width={48}
                    height={48}
                    className='object-contain transition-transform duration-300 group-hover:scale-110'
                  />
                  <span className='font-semibold text-muted-foreground group-hover:text-foreground transition-colors'>
                    {tech.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='w-full p-8 text-center border-t border-border'>
          <p className='text-sm text-muted-foreground'>
            ©2025 Akshay K Rooben Abraham All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
