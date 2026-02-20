'use server';

import { z } from 'genkit';
import {
  DEFAULT_AI_MODEL,
  getModelConfig,
  type AIModelId,
} from '@/lib/ai-models';

const GenerateAITutorResponseInputSchema = z.object({
  problemStatement: z
    .string()
    .describe('The problem statement from the student.'),
  systemPrompt: z
    .string()
    .optional()
    .describe('The system prompt to guide the AI tutor.'),
  exampleGoodAnswers: z
    .array(z.string())
    .optional()
    .describe('Examples of good answers to guide the AI.'),
  model: z.string().optional().describe('The selected AI model id.'),
});

export type GenerateAITutorResponseInput = z.infer<
  typeof GenerateAITutorResponseInputSchema
>;

const GenerateAITutorResponseOutputSchema = z.object({
  tutorResponse: z
    .string()
    .describe(
      'The AI tutor response, providing hints, analogies, and questions.',
    ),
});

export type GenerateAITutorResponseOutput = z.infer<
  typeof GenerateAITutorResponseOutputSchema
>;

function buildPrompt(input: GenerateAITutorResponseInput) {
  const systemPrompt =
    input.systemPrompt?.trim() ||
    'You are Lyra, an AI tutor. Your goal is to help the student verbalize their problem and guide them towards the solution by providing hints, analogies, and questions instead of direct answers. You should never give the direct answer. Emulate the Socratic method. Be patient and encouraging. You can use Markdown for formatting, including MermaidJS for diagrams (using ```mermaid code blocks).';

  const examples =
    input.exampleGoodAnswers && input.exampleGoodAnswers.length > 0
      ? `\n\nHere are some examples of good answers:\n${input.exampleGoodAnswers
          .map((example) => `- ${example}`)
          .join('\n')}`
      : '';

  return `${systemPrompt}${examples}\n\nProblem Statement: ${input.problemStatement}`;
}

async function parseOpenAIText(response: Response) {
  const json = await response.json();
  return (
    json?.output_text ||
    json?.choices?.[0]?.message?.content ||
    json?.choices?.[0]?.text ||
    undefined
  ) as string | undefined;
}

async function callOpenAIResponses({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI call failed (${response.status}): ${details}`);
  }

  return parseOpenAIText(response);
}

async function callOpenAICompatible({
  baseUrl,
  apiKey,
  model,
  prompt,
  temperature,
}: {
  baseUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
  temperature: number;
}) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational tutor assistant.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Model call failed (${response.status}): ${details}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content as string | undefined;
}

async function callGemini({
  model,
  prompt,
  apiKey,
}: {
  model: string;
  prompt: string;
  apiKey: string;
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini call failed (${response.status}): ${details}`);
  }

  const json = await response.json();
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return undefined;
  return parts
    .map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();
}

export async function generateAITutorResponse(
  input: GenerateAITutorResponseInput,
): Promise<GenerateAITutorResponseOutput> {
  const selectedModel =
    (input.model as AIModelId | undefined) ?? DEFAULT_AI_MODEL;
  const modelConfig = getModelConfig(selectedModel);
  const prompt = buildPrompt(input);

  let tutorResponse: string | undefined;

  if (modelConfig.provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing.');
    }

    tutorResponse = await callOpenAIResponses({
      apiKey: process.env.OPENAI_API_KEY,
      model: modelConfig.model,
      prompt,
    });
  } else if (modelConfig.provider === 'deepseek') {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is missing.');
    }

    tutorResponse = await callOpenAICompatible({
      baseUrl: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: modelConfig.model,
      prompt,
      temperature: 1,
    });
  } else if (modelConfig.provider === 'google') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    try {
      tutorResponse = await callGemini({
        model: modelConfig.model,
        prompt,
        apiKey: process.env.GEMINI_API_KEY,
      });
    } catch (error) {
      if ('fallbackModel' in modelConfig && modelConfig.fallbackModel) {
        tutorResponse = await callGemini({
          model: modelConfig.fallbackModel,
          prompt,
          apiKey: process.env.GEMINI_API_KEY,
        });
      } else {
        throw error;
      }
    }
  }

  if (!tutorResponse) {
    throw new Error(
      'Failed to generate tutor response from the selected model.',
    );
  }

  return { tutorResponse };
}

export const __schemas = {
  GenerateAITutorResponseInputSchema,
  GenerateAITutorResponseOutputSchema,
};
