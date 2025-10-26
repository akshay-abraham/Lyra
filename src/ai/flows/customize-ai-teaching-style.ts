// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Flow to Customize AI Teaching Style (`customize-ai-teaching-style.ts`)
 *
 * C-like Analogy:
 * This file defines a specific AI capability: allowing a teacher to customize the
 * AI's teaching style. Think of it as a single, well-defined function in a C program
 * that takes some teacher preferences as input and returns an updated set of instructions
 * for the AI.
 *
 * The primary exported function is `customizeAiTeachingStyle`.
 */
'use server';

// Import necessary libraries. `ai` is our main Genkit instance, and `z` is for defining data structures.
// C-like analogy: #include <genkit_lib.h> and #include <zod_struct_lib.h>
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * C-like Analogy:
 *
 * This is like defining a `struct` in C to specify the *input* for our function.
 * It's a schema that describes what data must be provided when calling this flow.
 * It ensures the data is in the correct format.
 *
 * typedef struct {
 *     char* systemPrompt;         // The main instructions for the AI.
 *     char* exampleGoodAnswers;   // (Optional) Examples of good responses.
 * } CustomizeAiTeachingStyleInput;
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
 * C-like Analogy:
 *
 * This is the `struct` for the *output* of our function. It defines what the
 * function will return.
 *
 * typedef struct {
 *     char* updatedSystemPrompt;  // The newly generated system prompt.
 * } CustomizeAiTeachingStyleOutput;
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
 * C-like Analogy: `CustomizeAiTeachingStyleOutput* customizeAiTeachingStyle(CustomizeAiTeachingStyleInput* input)`
 *
 * This is the main, exported function that our application will call.
 * It's a simple wrapper that calls the underlying Genkit "flow".
 * This separation makes the code cleaner and easier to test.
 *
 * It's an `async` function, which means it can perform long-running operations (like calling an AI)
 * without freezing the entire program. It returns a `Promise`, which is like a placeholder
 * for the eventual result.
 */
export async function customizeAiTeachingStyle(
  input: CustomizeAiTeachingStyleInput,
): Promise<CustomizeAiTeachingStyleOutput> {
  // Call the internal flow function and return its result.
  return customizeAiTeachingStyleFlow(input);
}

/**
 * C-like Analogy: This defines the template for the AI prompt.
 *
 * It's like a `printf` format string. The `{{{...}}}` parts are placeholders
 * where the actual data from the input struct will be inserted.
 *
 * - `name`: A unique identifier for this prompt.
 * - `input`: Links to the input struct schema we defined earlier.
 * - `output`: Links to the output struct schema. This tells the AI what format to return.
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
 * C-like Analogy: This is the core logic of the AI flow.
 *
 * It defines a Genkit "flow", which is a managed, server-side function.
 *
 * - `name`: A unique name for this flow.
 * - `inputSchema`: The expected input data structure.
 * - `outputSchema`: The expected output data structure.
 *
 * The second argument is an `async` function that receives the `input` and
 * performs the work.
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

    // 2. Create the output struct.
    //    `CustomizeAiTeachingStyleOutput response;`
    //    `response.updatedSystemPrompt = result.output.updatedSystemPrompt;`
    // 3. Return the response.
    return {
      updatedSystemPrompt: output!.updatedSystemPrompt,
    };
  },
);
