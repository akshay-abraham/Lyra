
// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Page (`/`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the main home page for the Lyra application. It's a
 * sophisticated, multi-section landing page designed to be a "mini-presentation"
 * that captures the core narrative and value proposition of Lyra.
 *
 * It features:
 * - A full-screen container with a powerful, animated gradient background.
 * - A clean header with the application logo and name.
 * - A central "hero" section with a bold, compelling headline.
 * - A highly interactive "Motivation" section that tells the story of Lyra.
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
  ZapOff,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { GitHubLogo } from '@/components/auth/github-logo';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * The main component for the redesigned home page.
 *
 * @returns {JSX.Element} The JSX that describes the structure of the page.
 */
export default function HomePage() {
  const features = [
    {
      icon: <GraduationCap className='h-10 w-10 text-primary' />,
      title: 'Guide, Never Tell',
      description:
        'Lyra acts like a real tutor, asking Socratic questions and providing hints instead of giving direct answers.',
    },
    {
      icon: <Sparkles className='h-10 w-10 text-accent' />,
      title: 'Teacher-Powered AI',
      description:
        'Educators can customize the AI’s personality and provide examples to match their teaching style.',
    },
    {
      icon: <ZapOff className='h-10 w-10 text-primary' />,
      title: 'Reduce Over-reliance',
      description:
        'By avoiding direct solutions, Lyra encourages students to develop their own problem-solving skills.',
    },
    {
      icon: <BrainCircuit className='h-10 w-10 text-accent' />,
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
          src='/genkit.webp'
          alt='Genkit logo'
          width={48}
          height={48}
        />
      ),
    },
    { name: 'React', component: <ReactLogo className='h-12 w-12' /> },
    {
      name: 'Tailwind CSS',
      component: <TailwindCssLogo className='h-12 w-12' />,
    },
    { name: 'Vercel', component: <VercelLogo className='h-12 w-12' /> },
  ];

  return (
    <div className='relative min-h-screen w-full overflow-x-hidden bg-background text-foreground'>
      {/* The animated background is a separate div placed behind everything else. */}
      <div className='animated-background'>
        <div className='blob blob-1'></div>
        <div className='blob blob-2'></div>
        <div className='blob blob-3'></div>
      </div>

      {/* Header */}
      <header className='fixed top-0 left-0 w-full p-4 sm:p-6 z-20 bg-background/80 backdrop-blur-sm'>
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
          className='flex w-full flex-col items-center space-y-6 py-16 px-4'
        >
          <div
            className='max-w-3xl animate-fade-in-up'
            style={{ animationDelay: '0.2s' }}
          >
            <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline gradient-text'>
              Stop Outsourcing Thinking.
              <br />
              Start Guided Learning.
            </h1>
            <p className='mt-6 text-lg max-w-2xl mx-auto leading-8 text-muted-foreground'>
              An ethical AI tutor, customizable by teachers.
            </p>
             <p className='mt-4 text-sm max-w-2xl mx-auto text-muted-foreground/80'>
              Lyra fosters critical thinking by turning every prompt into a learning opportunity, not a shortcut.
            </p>
          </div>
          <Suspense fallback={<LoadingScreen />}>
            <LoginForm />
          </Suspense>
          <div
            className='animate-fade-in-up text-sm text-muted-foreground'
            style={{ animationDelay: '0.6s' }}
          >
            Already have an account? The button above works for login, too!
          </div>
        </main>

        {/* Motivation Section */}
        <section id='motivation' className='w-full py-16 px-4'>
          <div className='container mx-auto max-w-4xl'>
            <Card className='bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in-up'>
              <CardHeader>
                <h2 className='text-3xl font-bold text-center font-headline'>
                  The Problem with AI in Education
                </h2>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-muted-foreground text-center max-w-2xl mx-auto'>
                  Today's AI often gives the complete answer, encouraging
                  students to{' '}
                  <strong className='text-foreground gradient-text'>
                    outsource their thinking
                  </strong>
                  . The institutional response? Ban AI. But history shows us
                  prohibition doesn't work.
                </p>
                <p className='text-center text-lg font-semibold text-foreground pt-4'>
                  The solution isn’t to ban AI—it’s to build AI that{' '}
                  <span className='gradient-text'>actually teaches</span>. Lyra
                  fosters critical thinking by asking Socratic questions,
                  turning every prompt into a learning opportunity, not a
                  shortcut.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='w-full py-16 px-4 bg-primary/5'>
          <div className='container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left'>
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className='flex flex-col items-start p-6 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in-up opacity-0 transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 hover:shadow-2xl hover:-translate-y-2'
                style={{ animationDelay: `${0.5 + index * 0.2}s` }}
              >
                <CardHeader className='p-0 mb-4'>
                  <div className='p-3 rounded-full border-2 border-primary/10 bg-card mb-4 w-fit'>
                    {feature.icon}
                  </div>
                  <h3 className='text-xl font-headline font-bold text-foreground'>
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent className='p-0'>
                  <p className='text-muted-foreground'>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section id='tech' className='w-full py-16 px-4'>
          <div className='container mx-auto'>
            <h2
              className='text-center text-3xl font-headline font-bold mb-4 animate-fade-in-up opacity-0'
              style={{ animationDelay: '1.2s' }}
            >
              Powered by a Modern Stack
            </h2>
            <p
              className='text-center text-muted-foreground mb-12 max-w-xl mx-auto animate-fade-in-up opacity-0'
              style={{ animationDelay: '1.3s' }}
            >
              Built with industry-leading technologies for a reliable,
              scalable, and performant user experience.
            </p>
            <div
              className='flex justify-center items-center gap-x-6 md:gap-x-12 gap-y-6 flex-wrap animate-fade-in-up opacity-0'
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
        <footer className='w-full p-6 text-center border-t border-border'>
          <div className='container mx-auto text-xs text-muted-foreground space-y-2'>
            <div className='flex items-center justify-center space-x-1'>
              <span>© 2025</span>
              <Link
                href={siteConfig.developer.url}
                target='_blank'
                rel='noopener noreferrer'
                className='underline-offset-4 hover:underline hover:text-foreground'
              >
                {siteConfig.developer.name}
              </Link>
            </div>
            
            <Accordion type='single' collapsible className='w-auto mx-auto'>
              <AccordionItem value='license' className='border-none'>
                <AccordionTrigger className='p-0 text-xs hover:no-underline hover:text-foreground'>
                  License Information
                </AccordionTrigger>
                <AccordionContent>
                  <div className='text-xs text-muted-foreground max-w-prose text-left mx-auto mt-2 p-4 bg-card/50 rounded-lg border space-y-2'>
                    <p>
                      <strong>
                        © 2025 {siteConfig.developer.name}. All rights reserved.
                      </strong>
                    </p>
                    <p>
                      This software and all associated materials, including but
                      not limited to the codebase, design, architecture,
                      content, and branding of “Lyra”, are proprietary
                      intellectual property owned by {siteConfig.developer.name}
                      .
                    </p>
                    <p>
                      Unauthorized reproduction, distribution, modification, or
                      deployment of this system, in whole or in part, is
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
            </Accordion>
          </div>
        </footer>
      </div>
    </div>
  );
}
