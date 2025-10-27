// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Flow to Implement Ethical AI Guardrails (`implement-ethical-ai-guardrails.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a foundational AI capability focused on safety and ethics. Its
 * main purpose is to ensure that any AI response adheres to a predefined set of
 * ethical rules (the "guardrails") defined in a system prompt.
 *
 * While other flows focus on specific tasks (like tutoring), this one is more general.
 * It takes a user's input and a system prompt defining the rules, and it generates a
 * response that complies with those rules. In a more complex system, this might be
 * chained with other flows as a final safety check before sending a response to the user.
 *
 * C-like Analogy:
 * This is like a validation or sanitization function. `char* sanitize_response(const char* input, const char* rules);`.
 * It takes raw input, applies a set of rules, and produces a "safe" output. Here, the
 * "sanitization" is done by an AI that understands the rules.
 */
'use server';

// Import necessary libraries.
// C-like analogy: #include <genkit_lib.h> and #include <zod_struct_lib.h>
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @typedef {object} ImplementEthicalAIGuardrailsInput
 * @description The input schema for the ethical guardrails flow.
 *
 * C-like Analogy: Input Struct Definition
 * ```c
 * typedef struct {
 *     char* userInput;       // The input text from the user.
 *     char* systemPrompt;    // The set of rules (guardrails) the AI must follow.
 * } ImplementEthicalAIGuardrailsInput;
 * ```
 * @property {string} userInput - The user input or question.
 * @property {string} systemPrompt - The system prompt defining the AI tutor's behavior and ethical guidelines.
 */
const ImplementEthicalAIGuardrailsInputSchema = z.object({
  userInput: z.string().describe('The user input or question.'),
  systemPrompt: z
    .string()
    .describe(
      "The system prompt defining the AI tutor's behavior and ethical guidelines.",
    ),
});
// Create a TypeScript "type" from the schema.
export type ImplementEthicalAIGuardrailsInput = z.infer<
  typeof ImplementEthicalAIGuardrailsInputSchema
>;

/**
 * @typedef {object} ImplementEthicalAIGuardrailsOutput
 * @description The output schema for the ethical guardrails flow.
 *
 * C-like Analogy: Output Struct Definition
 * ```c
 * typedef struct {
 *     char* aiResponse; // The final, safety-checked AI response.
 * } ImplementEthicalAIGuardrailsOutput;
 * ```
 * @property {string} aiResponse - The AI tutor's response, adhering to ethical guidelines.
 */
const ImplementEthicalAIGuardrailsOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe("The AI tutor's response, adhering to ethical guidelines."),
});
// Create a TypeScript "type" from the schema.
export type ImplementEthicalAIGuardrailsOutput = z.infer<
  typeof ImplementEthicalAIGuardrailsOutputSchema
>;

/**
 * The main exported function. It's a simple wrapper that calls the internal Genkit flow.
 *
 * @param {ImplementEthicalAIGuardrailsInput} input - The input data containing the user message and system prompt.
 * @returns {Promise<ImplementEthicalAIGuardrailsOutput>} A promise that resolves with the AI's compliant response.
 *
 * C-like Analogy:
 * ```c
 * // The public API function defined in a header file.
 * ImplementEthicalAIGuardrailsOutput* implementEthicalAIGuardrails(ImplementEthicalAIGuardrailsInput* input);
 * ```
 */
export async function implementEthicalAIGuardrails(
  input: ImplementEthicalAIGuardrailsInput,
): Promise<ImplementEthicalAIGuardrailsOutput> {
  return implementEthicalAIGuardrailsFlow(input);
}

/**
 * The AI Prompt Template. This is a very straightforward prompt that simply
 * combines the system prompt (the rules) with the user's input and asks the
 * AI to generate a response based on them.
 *
 * C-like Analogy: A `printf` format string for the AI.
 * `const char* PROMPT_TEMPLATE = "%s\n\nUser Input: %s";`
 * `sprintf(final_prompt, PROMPT_TEMPLATE, system_prompt, user_input);`
 */
const ethicalAIGuardrailsPrompt = ai.definePrompt({
  name: 'ethicalAIGuardrailsPrompt',
  input: { schema: ImplementEthicalAIGuardrailsInputSchema },
  output: { schema: ImplementEthicalAIGuardrailsOutputSchema },
  prompt: `{{systemPrompt}}\n\nUser Input: {{{userInput}}}`,
});

/**
 * The core logic function, defining the Genkit "flow".
 *
 * @param {object} config - The flow's configuration.
 * @param {function(ImplementEthicalAIGuardrailsInput): Promise<ImplementEthicalAIGuardrailsOutput>} flowFunction - The async function that performs the work.
 */
const implementEthicalAIGuardrailsFlow = ai.defineFlow(
  {
    name: 'implementEthicalAIGuardrailsFlow',
    inputSchema: ImplementEthicalAIGuardrailsInputSchema,
    outputSchema: ImplementEthicalAIGuardrailsOutputSchema,
  },
  // This is the function body of the flow.
  async (input) => {
    // PSEUDOCODE:
    // 1. Call the AI with our prompt, providing the rules and the user's input.
    //    `result = ai_call(ethicalAIGuardrailsPrompt, input);`
    //    We `await` its completion.
    const { output } = await ethicalAIGuardrailsPrompt(input);

    // 2. Return the AI's response, which should now conform to the ethical guardrails.
    //    The `!` tells TypeScript we are sure the output is not null.
    return output!;
  },
);
