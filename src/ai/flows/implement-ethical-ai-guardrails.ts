'use server';
/**
 * @fileOverview Implements ethical AI guardrails for the AI tutor.
 *
 * - implementEthicalAIGuardrails - A function that applies ethical guidelines to the AI tutor's responses.
 * - ImplementEthicalAIGuardrailsInput - The input type for the implementEthicalAIGuardrails function.
 * - ImplementEthicalAIGuardrailsOutput - The return type for the implementEthicalAIGuardrails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImplementEthicalAIGuardrailsInputSchema = z.object({
  userInput: z.string().describe('The user input or question.'),
  systemPrompt: z.string().describe('The system prompt defining the AI tutor\'s behavior and ethical guidelines.'),
});
export type ImplementEthicalAIGuardrailsInput = z.infer<typeof ImplementEthicalAIGuardrailsInputSchema>;

const ImplementEthicalAIGuardrailsOutputSchema = z.object({
  aiResponse: z.string().describe('The AI tutor\'s response, adhering to ethical guidelines.'),
});
export type ImplementEthicalAIGuardrailsOutput = z.infer<typeof ImplementEthicalAIGuardrailsOutputSchema>;

export async function implementEthicalAIGuardrails(input: ImplementEthicalAIGuardrailsInput): Promise<ImplementEthicalAIGuardrailsOutput> {
  return implementEthicalAIGuardrailsFlow(input);
}

const ethicalAIGuardrailsPrompt = ai.definePrompt({
  name: 'ethicalAIGuardrailsPrompt',
  input: {schema: ImplementEthicalAIGuardrailsInputSchema},
  output: {schema: ImplementEthicalAIGuardrailsOutputSchema},
  prompt: `{{systemPrompt}}\n\nUser Input: {{{userInput}}}`,
});

const implementEthicalAIGuardrailsFlow = ai.defineFlow(
  {
    name: 'implementEthicalAIGuardrailsFlow',
    inputSchema: ImplementEthicalAIGuardrailsInputSchema,
    outputSchema: ImplementEthicalAIGuardrailsOutputSchema,
  },
  async input => {
    const {output} = await ethicalAIGuardrailsPrompt(input);
    return output!;
  }
);
