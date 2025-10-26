// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Flow for Guided AI Response Generation (`guide-ai-response-generation.ts`)
 *
 * C-like Analogy:
 * This file defines an AI capability that is a more specific version of the main
 * response generator. Its purpose is to generate an AI response that is heavily
 * guided by examples provided by a teacher.
 *
 * It demonstrates a key AI technique called "Few-Shot Prompting," where you give
 * the AI a few examples of "good" outputs to help it understand the desired style
 * and content.
 *
 * The primary exported function is `generateGuidedResponse`.
 */
'use server';

// Import necessary libraries.
// C-like analogy: #include <genkit_lib.h> and #include <zod_struct_lib.h>
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * C-like Analogy: Input Struct Definition
 *
 * typedef struct {
 *     char* studentQuestion;     // The student's question.
 *     char** teacherExamples;    // An array of strings with good answer examples.
 *     char* systemPrompt;        // The overall rules for the AI tutor.
 * } GuidedResponseInput;
 */
const GuidedResponseInputSchema = z.object({
  studentQuestion: z.string().describe('The question asked by the student.'),
  teacherExamples: z
    .array(z.string())
    .describe('Examples of good answers provided by the teacher.'),
  systemPrompt: z
    .string()
    .describe('The overall system prompt for the AI tutor.'),
});
// Create a TypeScript "type" from the schema.
export type GuidedResponseInput = z.infer<typeof GuidedResponseInputSchema>;

/**
 * C-like Analogy: Output Struct Definition
 *
 * typedef struct {
 *     char* aiResponse; // The final AI-generated response.
 * } GuidedResponseOutput;
 */
const GuidedResponseOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe(
      'The AI-generated response to the student question, guided by the teacher examples.',
    ),
});
// Create a TypeScript "type" from the schema.
export type GuidedResponseOutput = z.infer<typeof GuidedResponseOutputSchema>;

/**
 * C-like Analogy: `GuidedResponseOutput* generateGuidedResponse(GuidedResponseInput* input)`
 *
 * This is the main exported function that the Teacher Dashboard calls when running
 * the "Test AI" feature.
 */
export async function generateGuidedResponse(
  input: GuidedResponseInput,
): Promise<GuidedResponseOutput> {
  // It's a simple wrapper that calls the internal Genkit flow.
  return generateGuidedResponseFlow(input);
}

/**
 * C-like Analogy: The AI Prompt Template (like a `printf` format string)
 *
 * This prompt template is structured for "Few-Shot" learning.
 *
 * - `{{systemPrompt}}`: First, we provide the main rules for the AI.
 * - `{{#each teacherExamples}} ... {{/each}}`: This is a `for` loop. We iterate through the
 *   `teacherExamples` array and print each one, showing the AI what good answers look like.
 * - `{{{studentQuestion}}}`: Finally, we present the actual student question that the AI
 *   needs to answer, now that it has seen the examples.
 */
const prompt = ai.definePrompt({
  name: 'generateGuidedResponsePrompt',
  input: { schema: GuidedResponseInputSchema }, // Input data format.
  output: { schema: GuidedResponseOutputSchema }, // Expected output format.
  prompt: `{{systemPrompt}}\n\nHere are some examples of good answers to guide your response:\n{{#each teacherExamples}}\n- {{{this}}}\n{{/each}}\n\nStudent Question: {{{studentQuestion}}}\n\nAI Response: `,
});

/**
 * C-like Analogy: The Core Logic Function
 *
 * This defines the Genkit "flow", the managed server-side function that does the work.
 */
const generateGuidedResponseFlow = ai.defineFlow(
  {
    name: 'generateGuidedResponseFlow',
    inputSchema: GuidedResponseInputSchema,
    outputSchema: GuidedResponseOutputSchema,
  },
  // This is the function body of the flow.
  async (input) => {
    // PSEUDOCODE:
    // 1. Call the AI with our prompt, filling it in with the `input` data (system prompt, examples, and question).
    //    `result = ai_call(prompt, input);`
    //    We `await` its completion.
    const { output } = await prompt(input);

    // 2. The `result.output` is guaranteed by Genkit to match our `GuidedResponseOutputSchema`.
    //    We can simply return it. The `!` tells TypeScript we are sure it's not null.
    return output!;
  },
);
