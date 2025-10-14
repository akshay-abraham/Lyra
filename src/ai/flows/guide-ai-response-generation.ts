'use server';
/**
 * @fileOverview An AI agent that generates responses to student questions, guided by teacher-provided examples.
 *
 * - generateGuidedResponse - A function that generates a response to a student question, using teacher-provided examples.
 * - GuidedResponseInput - The input type for the generateGuidedResponse function.
 * - GuidedResponseOutput - The return type for the generateGuidedResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuidedResponseInputSchema = z.object({
  studentQuestion: z
    .string()
    .describe('The question asked by the student.'),
  teacherExamples: z
    .array(z.string())
    .describe('Examples of good answers provided by the teacher.'),
  systemPrompt: z.string().describe('The overall system prompt for the AI tutor.'),
});
export type GuidedResponseInput = z.infer<typeof GuidedResponseInputSchema>;

const GuidedResponseOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe('The AI-generated response to the student question, guided by the teacher examples.'),
});
export type GuidedResponseOutput = z.infer<typeof GuidedResponseOutputSchema>;

export async function generateGuidedResponse(
  input: GuidedResponseInput
): Promise<GuidedResponseOutput> {
  return generateGuidedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGuidedResponsePrompt',
  input: {schema: GuidedResponseInputSchema},
  output: {schema: GuidedResponseOutputSchema},
  prompt: `{{systemPrompt}}\n\nHere are some examples of good answers to guide your response:\n{{#each teacherExamples}}\n- {{{this}}}\n{{/each}}\n\nStudent Question: {{{studentQuestion}}}\n\nAI Response: `,
});

const generateGuidedResponseFlow = ai.defineFlow(
  {
    name: 'generateGuidedResponseFlow',
    inputSchema: GuidedResponseInputSchema,
    outputSchema: GuidedResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
