import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-4xl">Lyra</CardTitle>
          <p className="text-muted-foreground">A Centralized AI Backend with Pedagogical Guardrails</p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none dark:prose-invert">
          <h2 className="font-headline">Motivation</h2>
          <p>
            In today’s classrooms, AI is often met with suspicion. Educators fear that students will outsource thinking. The real challenge is not to ban AI, but to integrate it as a tool for critical thinking. Lyra is designed to be a smart, pedagogical assistant that guides students through problems with hints and Socratic questioning, much like a real tutor. It encourages students to verbalize their thought processes, a technique known as rubber duck debugging, to help them arrive at solutions on their own.
          </p>

          <h2 className="font-headline">Core Components</h2>
          <p>
            Lyra is built on a foundation of modern AI technologies to provide a safe and effective learning experience.
          </p>
          <ul>
            <li><strong>Retrieval-Augmented Generation (RAG):</strong> Lyra uses RAG to ground its responses in factual, course-specific information, reducing the risk of hallucination.</li>
            <li><strong>Vector Databases:</strong> For fast and semantically relevant information retrieval from lecture notes and documents.</li>
            <li><strong>Prompt Engineering:</strong> Carefully crafted prompts ensure the AI follows pedagogical rules, adapting to different teaching styles and subjects.</li>
          </ul>

          <h2 className="font-headline">The Vision</h2>
          <p>
            Lyra aims to be a customizable and scalable AI tutoring platform with educational ethics at its core. It's a tool for learning, not just for getting answers.
          </p>

          <h2 className="font-headline">Credits</h2>
          <p>
            This project is brought to you by:
          </p>
          <ul>
            <li><a href="https://akshayabraham.vercel.app/" target="_blank" rel="noopener noreferrer">Akshay K Rooben Abraham</a></li>
            <li>Andre Milan Ajith</li>
            <li>Ameena Fathima</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
