// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Main Entry Point for Development AI Server (`dev.ts`)
 *
 * C-like Analogy:
 * Think of this file as the `main.c` for our AI development environment. Its primary
 * job is to "include" or "import" all the different AI capabilities (the "flows")
 * that we've defined in other files.
 *
 * When you run the `genkit:dev` script, this is the file that gets executed. It tells
 * the Genkit development server which AI functions to load and make available for testing.
 *
 * The `'use server';` directive is a modern JavaScript feature that marks this code
 * as guaranteed to run only on the server, never in the user's browser. This is
 * important for security and performance.
 *
 * The `import` statements are the modern equivalent of `#include` in C. They tell the
 * program to load the code from another file.
 */
'use server';
import { config } from 'dotenv';
config();

// #include "src/ai/flows/guide-ai-response-generation.ts"
import '@/ai/flows/guide-ai-response-generation.ts';

// #include "src/ai/flows/customize-ai-teaching-style.ts"
import '@/ai/flows/customize-ai-teaching-style.ts';

// #include "src/ai/flows/generate-ai-tutor-response.ts"
import '@/ai/flows/generate-ai-tutor-response.ts';

// #include "src/ai/flows/implement-ethical-ai-guardrails.ts"
import '@/ai/flows/implement-ethical-ai-guardrails.ts';

// #include "src/ai/flows/generate-chat-title.ts"
import '@/ai/flows/generate-chat-title.ts';
