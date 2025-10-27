// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Flow for Guided AI Response Generation (`guide-ai-response-generation.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines an AI capability that is a more specific version of the main
 * response generator. Its purpose is to generate an AI response that is heavily
 * guided by examples provided by a teacher. This flow is used in the "Test AI"
 * sandbox feature of the teacher dashboard.
 *
 * It demonstrates a key AI technique called "Few-Shot Prompting," where you give
 * the AI a few examples of "good" outputs to help it understand the desired style
 * and content for its own responses.
 *
 * C-like Analogy:
 * Think of this as a specialized function, `generate_response_with_examples()`, that
 * takes not just a problem, but also a set of ideal answer patterns. It's like
 * giving a C function a set of input-output pairs to help it "learn" the
 * transformation rule before applying it to new input.
 */
'use server';

// Import necessary libraries.
// C-like analogy: #include <genkit_lib.h> and #include <zod_struct_lib.h>
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @typedef {object} GuidedResponseInput
 * @description The input schema for the guided response generation flow.
 *
 * C-like Analogy: Input Struct Definition
 * ```c
 * typedef struct {
 *     char* studentQuestion;     // The student's question.
 *     char** teacherExamples;    // An array of strings with good answer examples.
 *     char* systemPrompt;        // The overall rules for the AI tutor.
 * } GuidedResponseInput;
 * ```
 * @property {string} studentQuestion - The question asked by the student.
 * @property {string[]} teacherExamples - Examples of good answers provided by the teacher.
 * @property {string} systemPrompt - The overall system prompt for the AI tutor.
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
 * @typedef {object} GuidedResponseOutput
 * @description The output schema for the guided response generation flow.
 *
 * C-like Analogy: Output Struct Definition
 * ```c
 * typedef struct {
 *     char* aiResponse; // The final AI-generated response, influenced by the examples.
 * } GuidedResponseOutput;
 * ```
 * @property {string} aiResponse - The AI-generated response to the student question, guided by the teacher examples.
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
 * The main exported function that the Teacher Dashboard calls when running
 * the "Test AI" feature. It wraps the internal Genkit flow.
 *
 * @param {GuidedResponseInput} input - The input data, including the system prompt, examples, and test question.
 * @returns {Promise<GuidedResponseOutput>} A promise that resolves with the AI's generated response.
 *
 * C-like Analogy:
 * ```c
 * // The public API function exposed in a header file.
 * GuidedResponseOutput* generateGuidedResponse(GuidedResponseInput* input);
 * ```
 */
export async function generateGuidedResponse(
  input: GuidedResponseInput,
): Promise<GuidedResponseOutput> {
  // It's a simple wrapper that calls the internal Genkit flow.
  return generateGuidedResponseFlow(input);
}

/**
 * The AI Prompt Template for this flow, structured for "Few-Shot" learning.
 * This prompt template explicitly shows the AI the desired output format by
 * providing concrete examples before asking it to generate a new response.
 *
 * C-like Analogy:
 * This is like building a command string piece by piece.
 * `char prompt[1024];`
 * `strcpy(prompt, system_prompt);`
 * `strcat(prompt, "\nHere are some examples:\n");`
 * `for (i=0; i<num_examples; i++) { sprintf(prompt, "- %s\n", examples[i]); }`
 * `sprintf(prompt, "Student Question: %s\nAI Response: ", student_question);`
 *
 * - `{{systemPrompt}}`: First, we provide the main rules for the AI.
 * - `{{#each teacherExamples}} ... {{/each}}`: This is a `for` loop. We iterate through the
 *   `teacherExamples` array and print each one, showing the AI what good answers look like.
 * - `{{{studentQuestion}}}`: Finally, we present the actual student question that the AI
 *   needs to answer, now that it has been "trained" with the examples.
 */
const prompt = ai.definePrompt({
  name: 'generateGuidedResponsePrompt',
  input: { schema: GuidedResponseInputSchema }, // Input data format.
  output: { schema: GuidedResponseOutputSchema }, // Expected output format.
  prompt: `{{systemPrompt}}\n\nHere are some examples of good answers to guide your response:\n{{#each teacherExamples}}\n- {{{this}}}\n{{/each}}\n\nStudent Question: {{{studentQuestion}}}\n\nAI Response: `,
});

/**
 * This is the core logic function, defining the Genkit "flow".
 *
 * @param {object} config - The flow's configuration.
 * @param {function(GuidedResponseInput): Promise<GuidedResponseOutput>} flowFunction - The async function that performs the work.
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
