'use server';

/**
 * @fileOverview An AI tutor response generator.
 *
 * - generateAITutorResponse - A function that generates an AI tutor response.
 * - GenerateAITutorResponseInput - The input type for the generateAITutorResponse function.
 * - GenerateAITutorResponseOutput - The return type for the generateAITutorResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAITutorResponseInputSchema = z.object({
  problemStatement: z.string().describe('The problem statement from the student.'),
  systemPrompt: z.string().optional().describe('The system prompt to guide the AI tutor.'),
  exampleGoodAnswers: z.array(z.string()).optional().describe('Examples of good answers to guide the AI.'),
});
export type GenerateAITutorResponseInput = z.infer<typeof GenerateAITutorResponseInputSchema>;

const GenerateAITutorResponseOutputSchema = z.object({
  tutorResponse: z.string().describe('The AI tutor response, providing hints, analogies, and questions.'),
});
export type GenerateAITutorResponseOutput = z.infer<typeof GenerateAITutorResponseOutputSchema>;

export async function generateAITutorResponse(input: GenerateAITutorResponseInput): Promise<GenerateAITutorResponseOutput> {
  return generateAITutorResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAITutorResponsePrompt',
  input: {schema: GenerateAITutorResponseInputSchema},
  output: {schema: GenerateAITutorResponseOutputSchema},
  prompt: `{{#if systemPrompt}} {{systemPrompt}} {{else}} You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting, including MermaidJS for diagrams (using \`\`\`mermaid code blocks). {{/if}}\n\n{{#if exampleGoodAnswers}} Here are some examples of good answers: {{#each exampleGoodAnswers}} - {{{this}}} {{/each}} {{/if}}\n\nProblem Statement: {{{problemStatement}}}`,
});

const generateAITutorResponseFlow = ai.defineFlow(
  {
    name: 'generateAITutorResponseFlow',
    inputSchema: GenerateAITutorResponseInputSchema,
    outputSchema: GenerateAITutorResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
