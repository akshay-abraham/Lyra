import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';
import { BookOpen, BrainCircuit, Database, Languages, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 animate-fade-in-down">
      <Card className="overflow-hidden shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center bg-primary/5 p-10 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center items-center mb-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Logo />
          </div>
          <CardTitle className="font-headline text-5xl">Lyra</CardTitle>
          <p className="text-muted-foreground text-lg">An Ethical AI Tutor, Customizable by Teachers</p>
        </CardHeader>
        <CardContent className="p-6 md:p-10 space-y-12">
          <div className="prose prose-lg max-w-none dark:prose-invert animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="font-headline text-3xl">Our Motivation</h2>
              <p>
                In today’s classrooms, AI is often met with suspicion. Educators fear that students will outsource thinking. The real challenge is not to ban AI, but to integrate it as a tool for critical thinking. Lyra is designed to be a smart, pedagogical assistant that guides students through problems with hints and Socratic questioning, much like a real tutor. It encourages students to verbalize their thought processes—a technique known as rubber duck debugging—to help them arrive at solutions on their own.
              </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="font-headline text-3xl text-center mb-8">Core Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <BrainCircuit className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-headline text-xl mb-2">Retrieval-Augmented Generation</h3>
                <p className="text-muted-foreground">Lyra uses RAG to ground its responses in factual, course-specific information, reducing the risk of hallucination.</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <Database className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-headline text-xl mb-2">Vector Databases</h3>
                <p className="text-muted-foreground">For fast and semantically relevant information retrieval from lecture notes and documents.</p>
              </div>
              <div className="flex flex-col items-center p-6 rounded-xl transition-all duration-500 hover:bg-primary/5 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                <Languages className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-headline text-xl mb-2">Prompt Engineering</h3>
                <p className="text-muted-foreground">Carefully crafted prompts ensure the AI follows pedagogical rules, adapting to different teaching styles.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <h2 className="font-headline text-3xl">The Vision</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
              Lyra aims to be a customizable and scalable AI tutoring platform with educational ethics at its core. It's a tool for learning, not just for getting answers.
            </p>
          </div>

        </CardContent>
        <div className="bg-primary/5 p-6 text-center animate-fade-in border-t border-primary/10" style={{ animationDelay: '1.1s' }}>
          <p className="text-sm text-muted-foreground mb-4">Copyright © 2025 | Apache 2.0 | Akshay Abraham</p>
          <Button asChild variant="outline">
            <Link href="https://akshayabraham.vercel.app/" target="_blank" rel="noopener noreferrer">
              Connect <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}