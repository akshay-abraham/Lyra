// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Main Entry Point for Development AI Server (`dev.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as the primary entry point for the Genkit development server.
 * When you run the `pnpm genkit:dev` script, this is the file that gets executed. It
 * tells the Genkit development server which AI capabilities (the "flows") to load
 * and make available for testing and use.
 *
 * C-like Analogy:
 * Think of this file as the `main.c` for our AI development environment. Its sole
 * purpose is to "include" or "import" all the different AI function definitions
 * from the `src/ai/flows` directory. Just as `main.c` might include various
 * header files to bring in different modules, this file imports the flows to
* register them with the Genkit runtime.
 */
'use server';
import { config } from 'dotenv';
config();

// #include "src/ai/flows/customize-ai-teaching-style.ts"
// This import registers the flow that allows teachers to customize the AI's personality.
import '@/ai/flows/customize-ai-teaching-style.ts';

// #include "src/ai/flows/generate-ai-tutor-response.ts"
// This is the main tutoring flow, responsible for generating Socratic responses.
import '@/ai/flows/generate-ai-tutor-response.ts';

// #include "src/ai/flows/implement-ethical-ai-guardrails.ts"
// This import registers a general-purpose flow for enforcing ethical rules.
import '@/ai/flows/implement-ethical-ai-guardrails.ts';

// #include "src/ai/flows/generate-chat-title.ts"
// This import registers a utility flow that creates a title for new chat sessions.
import '@/ai/flows/generate-chat-title.ts';
