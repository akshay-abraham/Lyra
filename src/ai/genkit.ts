// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Genkit Initialization (`genkit.ts`)
 *
 * C-like Analogy:
 * This file is like a central configuration file or a global setup function
 * for our AI library (Genkit). Its main purpose is to initialize the Genkit
 * framework and configure it with the necessary plugins and settings.
 *
 * Think of it as the place where you'd initialize a global library in C,
 * for example, `library_init(config)`.
 *
 * 1.  **Import Libraries**: We import `genkit` (the core library) and `googleAI`
 *     (the plugin that lets us talk to Google's AI models). This is like
 *     `#include <genkit.h>` and `#include <google_ai_plugin.h>`.
 *
 * 2.  **Initialize Genkit**: We call `genkit()` with a configuration object.
 *     - `plugins`: This is an array of plugins to use. Here, we're only using the
 *       `googleAI()` plugin. This is like linking against `google_ai.lib`.
 *     - `model`: We set a default AI model to use across the application, in this case,
 *       'gemini-2.5-flash'. This prevents us from having to specify the model in every
 *       single AI call. It's like setting a global default variable.
 *
 * 3.  **Export `ai`**: We create a single, global instance of our configured Genkit
 *     object and `export` it. This means other files in our project can `import { ai }`
 *     to get access to this pre-configured instance, ensuring everyone uses the
 *     same settings. This is like defining a global variable `AI_INSTANCE` that
 *     the rest of the program can use via an `extern` declaration.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// `export const ai = ...` is how you create a global, read-only variable
// that can be used by other files in the project.
export const ai = genkit({
  // An array of plugins. It's like a list of libraries to load.
  plugins: [googleAI()],
  // Set the default model for all AI generation calls.
  model: 'googleai/gemini-2.5-flash',
});
