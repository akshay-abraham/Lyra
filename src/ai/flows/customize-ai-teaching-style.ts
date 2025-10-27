// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Flow to Customize AI Teaching Style (`customize-ai-teaching-style.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a specific AI capability: allowing a teacher to customize the
 * AI's teaching style. It takes teacher preferences as input (a system prompt and
 * example answers) and uses another AI model to refine and update the system prompt.
 * This is a meta-level flow, as it uses an AI to configure another AI.
 *
 * C-like Analogy:
 * Think of this as a configuration utility function in C. Its job is to take a set
 * of parameters, process them, and write a new configuration to be used by the main
* program. For example, `char* generate_new_config(const char* old_config, const char* new_rules);`.
 */
'use server';

// Import necessary libraries. `ai` is our main Genkit instance, and `z` is for defining data structures.
// C-like analogy: #include <genkit_lib.h> and #include <zod_struct_lib.h>
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @typedef {object} CustomizeAiTeachingStyleInput
 * @description The input schema for the AI teaching style customization flow.
 *
 * C-like Analogy:
 * This is like defining a `struct` in C to specify the *input* for our function.
 * It's a schema that describes what data must be provided when calling this flow.
 * It ensures the data is in the correct format before execution.
 *
 * ```c
 * typedef struct {
 *     char* systemPrompt;         // The main instructions for the AI tutor.
 *     char* exampleGoodAnswers;   // (Optional) Examples of good responses to learn from.
 * } CustomizeAiTeachingStyleInput;
 * ```
 * @property {string} systemPrompt - The system prompt to customize the AI teaching style, guidance level, and domain-specific knowledge.
 * @property {string} [exampleGoodAnswers] - Examples of good answers to guide the AI response generation, to be used in few-shot prompting.
 */
const CustomizeAiTeachingStyleInputSchema = z.object({
  systemPrompt: z
    .string()
    .describe(
      'The system prompt to customize the AI teaching style, guidance level, and domain-specific knowledge.',
    ),
  exampleGoodAnswers: z
    .string()
    .optional()
    .describe(
      'Examples of good answers to guide the AI response generation, to be used in few-shot prompting.',
    ),
});
// This creates a TypeScript "type" from the schema, similar to using the `typedef` struct.
export type CustomizeAiTeachingStyleInput = z.infer<
  typeof CustomizeAiTeachingStyleInputSchema
>;

/**
 * @typedef {object} CustomizeAiTeachingStyleOutput
 * @description The output schema for the AI teaching style customization flow.
 *
 * C-like Analogy:
 * This is the `struct` for the *output* of our function. It defines what the
 * function will return, ensuring a consistent and predictable response format.
 *
 * ```c
 * typedef struct {
 *     char* updatedSystemPrompt;  // The newly generated and refined system prompt.
 * } CustomizeAiTeachingStyleOutput;
 * ```
 * @property {string} updatedSystemPrompt - The updated system prompt after customization.
 */
const CustomizeAiTeachingStyleOutputSchema = z.object({
  updatedSystemPrompt: z
    .string()
    .describe('The updated system prompt after customization.'),
});
// Create the TypeScript type from the schema.
export type CustomizeAiTeachingStyleOutput = z.infer<
  typeof CustomizeAiTeachingStyleOutputSchema
>;

/**
 * The main, exported function that the application's front-end will call.
 * This function acts as a clean, simple wrapper around the underlying Genkit "flow".
 * This separation makes the code easier to test and the API contract clearer.
 *
 * @param {CustomizeAiTeachingStyleInput} input - The input data, matching the schema.
 * @returns {Promise<CustomizeAiTeachingStyleOutput>} A promise that resolves with the AI's generated output.
 *
 * C-like Analogy:
 * ```c
 * // The public API function exposed in a header file.
 * CustomizeAiTeachingStyleOutput* customizeAiTeachingStyle(CustomizeAiTeachingStyleInput* input);
 * ```
 * It's an `async` function, which means it can perform long-running operations (like calling an AI model)
 * without freezing the entire program. It returns a `Promise`, which is a placeholder for the eventual result.
 */
export async function customizeAiTeachingStyle(
  input: CustomizeAiTeachingStyleInput,
): Promise<CustomizeAiTeachingStyleOutput> {
  // Call the internal flow function and return its result.
  return customizeAiTeachingStyleFlow(input);
}

/**
 * This defines the template for the AI prompt used in this flow. It tells the AI
 * what its task is and where to insert the data from the input schema.
 *
 * C-like Analogy:
 * It's like a `printf` format string, but for an AI. The `{{{...}}}` parts are placeholders
 * where the actual data from the input struct will be injected before being sent to the AI.
 *
 * - `name`: A unique identifier for this prompt within the Genkit system.
 * - `input`: Links to the input struct schema (`CustomizeAiTeachingStyleInputSchema`).
 * - `output`: Links to the output struct schema. This tells the AI what format to return, enabling structured output.
 * - `prompt`: The actual text template sent to the AI model.
 */
const customizeAiTeachingStylePrompt = ai.definePrompt({
  name: 'customizeAiTeachingStylePrompt',
  input: { schema: CustomizeAiTeachingStyleInputSchema },
  output: { schema: CustomizeAiTeachingStyleOutputSchema },
  prompt: `You are customizing the system prompt for an AI tutor. The current system prompt is: {{{systemPrompt}}}.  Update the system prompt based on teacher customizations. If applicable, incorporate the following examples of good answers: {{{exampleGoodAnswers}}}. Return the updated system prompt.

Updated System Prompt:`,
});

/**
 * This is the core logic of the AI flow, defined using Genkit's `defineFlow`.
 * A flow is a managed, server-side function that can be instrumented, logged, and traced.
 *
 * @param {object} config - The flow's configuration.
 * @param {string} config.name - A unique name for this flow.
 * @param {z.ZodSchema} config.inputSchema - The expected input data structure.
 * @param {z.ZodSchema} config.outputSchema - The expected output data structure.
 * @param {function(CustomizeAiTeachingStyleInput): Promise<CustomizeAiTeachingStyleOutput>} flowFunction - The async function that receives the input and performs the work.
 */
const customizeAiTeachingStyleFlow = ai.defineFlow(
  {
    name: 'customizeAiTeachingStyleFlow',
    inputSchema: CustomizeAiTeachingStyleInputSchema,
    outputSchema: CustomizeAiTeachingStyleOutputSchema,
  },
  // This is the function body of the flow.
  async (input) => {
    // PSEUDOCODE:
    // 1. Call the AI prompt with the provided input data.
    //    `result = ai_call(customizeAiTeachingStylePrompt, input);`
    //    This is an asynchronous call, so we `await` the result.
    const { output } = await customizeAiTeachingStylePrompt(input);

    // 2. The `result.output` is guaranteed by Genkit to be in the format of our
    //    `CustomizeAiTeachingStyleOutput` struct because we defined it in the prompt.
    //    The `!` is a TypeScript non-null assertion, telling the compiler we're sure this value exists.
    return {
      updatedSystemPrompt: output!.updatedSystemPrompt,
    };
  },
);
