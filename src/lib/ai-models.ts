export const AI_MODELS = [
  {
    id: 'openai:gpt-5-nano',
    label: 'ChatGPT · GPT-5 Nano',
    provider: 'openai',
    model: 'gpt-5-nano',
  },
  {
    id: 'openai:gpt-5-mini',
    label: 'ChatGPT · GPT-5 Mini',
    provider: 'openai',
    model: 'gpt-5-mini',
  },
  {
    id: 'openai:gpt-5.2',
    label: 'ChatGPT · GPT-5.2',
    provider: 'openai',
    model: 'gpt-5.2',
  },
  {
    id: 'google:gemini-3-flash',
    label: 'Gemini · 3 Flash',
    provider: 'google',
    model: 'gemini-3-flash',
  },
  {
    id: 'google:gemini-3.1-pro',
    label: 'Gemini · 3.1 Pro',
    provider: 'google',
    model: 'gemini-3.1-pro',
  },
  {
    id: 'deepseek:deepseek-chat',
    label: 'DeepSeek · V3.2 (Non-thinking)',
    provider: 'deepseek',
    model: 'deepseek-chat',
  },
  {
    id: 'deepseek:deepseek-reasoner',
    label: 'DeepSeek · V3.2 (Thinking)',
    provider: 'deepseek',
    model: 'deepseek-reasoner',
  },
] as const;

export type AIModelId = (typeof AI_MODELS)[number]['id'];

export const DEFAULT_AI_MODEL: AIModelId = 'openai:gpt-5-mini';

export function getModelConfig(modelId: AIModelId) {
  return AI_MODELS.find((model) => model.id === modelId) ?? AI_MODELS[1];
}
