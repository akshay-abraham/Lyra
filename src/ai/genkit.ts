// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Genkit Initialization (`genkit.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file acts as the central configuration point for the Genkit AI framework.
 * Its primary purpose is to initialize the Genkit library with the necessary plugins
 * and default settings, and then export a single, pre-configured instance for use
 * throughout the application. This ensures that all AI-related code uses a consistent
 * configuration.
 *
 * C-like Analogy:
 * This file is like a global setup function or a singleton pattern implementation
 * in C. Imagine a function `setup_ai_library()` that you call once at the start of
 * your `main()` function. This function would initialize a global struct, say
 * `g_ai_instance`, with all the necessary settings (like API keys, default models, etc.).
 * Any other part of the program can then use this `g_ai_instance` to make AI calls,
 * confident that it has been properly configured.
 *
 * Key Steps:
 * 1.  **Import Libraries**: It imports `genkit` (the core library) and `googleAI`
 *     (the plugin for connecting to Google's AI models).
 *     C-like: `#include <genkit.h>` and `#include <google_ai_plugin.h>`.
 *
 * 2.  **Initialize Genkit**: It calls `genkit()` with a configuration object that specifies
 *     which plugins to use and sets a default AI model ('gemini-2.5-flash').
 *     C-like: `g_ai_instance = ai_library_init({ .plugin = &google_plugin, .default_model = "gemini-2.5-flash" });`
 *
 * 3.  **Export Singleton**: It exports the configured `ai` object. Other files in the
 *     project can then simply `import { ai } from '@/ai/genkit';` to get access to this
 *     single, shared instance.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * The global, pre-configured Genkit instance.
 * @type {Genkit}
 *
 * `export const ai = ...` is how you create a global, read-only "singleton" object
 * that can be used by other files in the project. This ensures that all parts
 * of the application share the same AI configuration.
 */
export const ai = genkit({
  // An array of plugins. It's like a list of libraries to load or link against.
  plugins: [googleAI()],
  // Set the default model for all AI generation calls. This prevents us from
  // having to specify the model in every single `ai.generate()` call, reducing
  // redundancy and making it easy to change the model globally.
  model: 'googleai/gemini-3-flash',
});
