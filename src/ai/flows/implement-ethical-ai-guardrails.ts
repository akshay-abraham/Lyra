// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Flow to Implement Ethical AI Guardrails (`implement-ethical-ai-guardrails.ts`)
 *
 * C-like Analogy:
 * This file defines a foundational AI capability focused on safety and ethics. Its
 * main purpose is to ensure that any AI response adheres to a predefined set of
 * ethical rules (the "guardrails").
 *
 * While other flows focus on specific tasks (like tutoring), this one is more general.
 * It takes a user's input and a system prompt defining the rules, and it generates a
 * response that complies with those rules. In a more complex system, this might be
 * chained with other flows as a final safety check.
 *
 * The primary exported function is `implementEthicalAIGuardrails`.
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
 *     char* userInput;       // The input text from the user.
 *     char* systemPrompt;    // The set of rules (guardrails) the AI must follow.
 * } ImplementEthicalAIGuardrailsInput;
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
 * C-like Analogy: Output Struct Definition
 *
 * typedef struct {
 *     char* aiResponse; // The final, safety-checked AI response.
 * } ImplementEthicalAIGuardrailsOutput;
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
 * C-like Analogy: `ImplementEthicalAIGuardrailsOutput* implementEthicalAIGuardrails(ImplementEthicalAIGuardrailsInput* input)`
 *
 * This is the main exported function. It's a simple wrapper that calls the internal Genkit flow.
 */
export async function implementEthicalAIGuardrails(
  input: ImplementEthicalAIGuardrailsInput,
): Promise<ImplementEthicalAIGuardrailsOutput> {
  return implementEthicalAIGuardrailsFlow(input);
}

/**
 * C-like Analogy: The AI Prompt Template (like a `printf` format string)
 *
 * This is a very straightforward prompt. It simply combines the system prompt
 * (the rules) with the user's input, and asks the AI to generate a response.
 *
 * - `{{systemPrompt}}`: The ethical guardrails and behavior rules.
 * - `{{{userInput}}}`: The user's message.
 */
const ethicalAIGuardrailsPrompt = ai.definePrompt({
  name: 'ethicalAIGuardrailsPrompt',
  input: { schema: ImplementEthicalAIGuardrailsInputSchema },
  output: { schema: ImplementEthicalAIGuardrailsOutputSchema },
  prompt: `{{systemPrompt}}\n\nUser Input: {{{userInput}}}`,
});

/**
 * C-like Analogy: The Core Logic Function
 *
 * This defines the Genkit "flow", the managed server-side function that does the work.
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
