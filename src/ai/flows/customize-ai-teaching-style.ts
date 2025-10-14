'use server';

/**
 * @fileOverview A flow to customize the AI's teaching style by adjusting system prompts.
 *
 * - customizeAiTeachingStyle - A function that handles the customization of the AI teaching style.
 * - CustomizeAiTeachingStyleInput - The input type for the customizeAiTeachingStyle function.
 * - CustomizeAiTeachingStyleOutput - The return type for the customizeAiTeachingStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeAiTeachingStyleInputSchema = z.object({
  systemPrompt: z
    .string()
    .describe(
      'The system prompt to customize the AI teaching style, guidance level, and domain-specific knowledge.'
    ),
  exampleGoodAnswers: z
    .string()
    .optional()
    .describe(
      'Examples of good answers to guide the AI response generation, to be used in few-shot prompting.'
    ),
});
export type CustomizeAiTeachingStyleInput = z.infer<
  typeof CustomizeAiTeachingStyleInputSchema
>;

const CustomizeAiTeachingStyleOutputSchema = z.object({
  updatedSystemPrompt: z
    .string()
    .describe('The updated system prompt after customization.'),
});
export type CustomizeAiTeachingStyleOutput = z.infer<
  typeof CustomizeAiTeachingStyleOutputSchema
>;

export async function customizeAiTeachingStyle(
  input: CustomizeAiTeachingStyleInput
): Promise<CustomizeAiTeachingStyleOutput> {
  return customizeAiTeachingStyleFlow(input);
}

const customizeAiTeachingStylePrompt = ai.definePrompt({
  name: 'customizeAiTeachingStylePrompt',
  input: {schema: CustomizeAiTeachingStyleInputSchema},
  output: {schema: CustomizeAiTeachingStyleOutputSchema},
  prompt: `You are customizing the system prompt for an AI tutor. The current system prompt is: {{{systemPrompt}}}.  Update the system prompt based on teacher customizations. If applicable, incorporate the following examples of good answers: {{{exampleGoodAnswers}}}. Return the updated system prompt.

Updated System Prompt:`, // Using Handlebars syntax
});

const customizeAiTeachingStyleFlow = ai.defineFlow(
  {
    name: 'customizeAiTeachingStyleFlow',
    inputSchema: CustomizeAiTeachingStyleInputSchema,
    outputSchema: CustomizeAiTeachingStyleOutputSchema,
  },
  async input => {
    const {output} = await customizeAiTeachingStylePrompt(input);
    return {
      updatedSystemPrompt: output!.updatedSystemPrompt,
    };
  }
);
