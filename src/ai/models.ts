export interface ModelInfo {
  id: string;
  name: string;
}

export interface ModelProvider {
  provider: string;
  models: ModelInfo[];
}

export const ASHNA_DEFAULT_MODEL = 'ashna-x1';

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    provider: 'Anthropic',
    models: [
      { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4.1', name: 'Claude Opus 4.1' },
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
    ],
  },
  {
    provider: 'Ashna',
    models: [
      { id: 'ashna-diffusion-1', name: 'Ashna Diffusion 1' },
      { id: 'ashna-x1', name: 'Ashna X1' },
    ],
  },
  {
    provider: 'DeepSeek',
    models: [
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
    ],
  },
  {
    provider: 'GLM',
    models: [
      { id: 'glm-4.7', name: 'GLM 4.7' },
      { id: 'glm-5', name: 'GLM 5' },
      { id: 'glm-5.1', name: 'GLM 5.1' },
      { id: 'glm-5.2', name: 'GLM 5.2' },
    ],
  },
  {
    provider: 'Google',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.5-Flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-Flash-Lite', name: 'Gemini 2.5 Flash Lite' },
      { id: 'gemini-2.5-Pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-3-Flash-Preview', name: 'Gemini 3 Flash Preview' },
      { id: 'gemini-3-Pro', name: 'Gemini 3 Pro' },
      { id: 'gemini-3.1-Flash-Lite', name: 'Gemini 3.1 Flash Lite' },
      { id: 'gemini-3.1-Pro', name: 'Gemini 3.1 Pro' },
      { id: 'gemini-3.5-Flash', name: 'Gemini 3.5 Flash' },
    ],
  },
  {
    provider: 'Inception Lab',
    models: [{ id: 'inkling', name: 'Inkling' }],
  },
  {
    provider: 'Kimi',
    models: [
      { id: 'kimi-2.6', name: 'Kimi 2.6' },
      { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking' },
      { id: 'kimi-k2.5-thinking', name: 'Kimi K2.5 Thinking' },
      { id: 'kimi-k2.7-code', name: 'Kimi K2.7 Code' },
      { id: 'kimi-k3', name: 'Kimi K3' },
    ],
  },
  {
    provider: 'Meta',
    models: [
      { id: 'llama-3.3 70B', name: 'Llama 3.3 70B' },
      { id: 'llama-4-scout', name: 'Llama 4 Scout' },
    ],
  },
  {
    provider: 'Mistral',
    models: [
      { id: 'mistral-3b-latest', name: 'Mistral 3B Latest' },
      { id: 'mistral-large-3', name: 'Mistral Large 3' },
      { id: 'mistral-open-8.22B', name: 'Mistral Open 8.22B' },
    ],
  },
  {
    provider: 'NVIDIA',
    models: [{ id: 'nemotron-ultra', name: 'Nemotron Ultra' }],
  },
  {
    provider: 'OpenAI',
    models: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-5', name: 'GPT-5' },
      { id: 'gpt-5-codex', name: 'GPT-5 Codex' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
      { id: 'gpt-5.1', name: 'GPT-5.1' },
      { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex' },
      { id: 'gpt-5.2', name: 'GPT-5.2' },
      { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex' },
      { id: 'gpt-5.2-thinking', name: 'GPT-5.2 Thinking' },
      { id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex' },
      { id: 'gpt-5.4', name: 'GPT-5.4' },
      { id: 'gpt-5.4-thinking', name: 'GPT-5.4 Thinking' },
      { id: 'gpt-5.5', name: 'GPT-5.5' },
      { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna' },
      { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol' },
      { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra' },
      { id: 'gpt-o1', name: 'GPT-o1' },
      { id: 'gpt-o3-mini', name: 'GPT-o3 Mini' },
      { id: 'gpt-o4-mini', name: 'GPT-o4 Mini' },
      { id: 'gpt-oss-120b', name: 'GPT-OSS 120B' },
      { id: 'gpt-oss-20b', name: 'GPT-OSS 20B' },
    ],
  },
  {
    provider: 'xAI',
    models: [
      { id: 'grok-4-1-non-reasoning', name: 'Grok 4.1 Non-Reasoning' },
      { id: 'grok-4-reasoning', name: 'Grok 4 Reasoning' },
      { id: 'grok-4.3', name: 'Grok 4.3' },
    ],
  },
];

export function findModelById(modelId: string): ModelInfo | undefined {
  for (const provider of MODEL_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function findProviderByModelId(modelId: string): ModelProvider | undefined {
  return MODEL_PROVIDERS.find((provider) => provider.models.some((m) => m.id === modelId));
}

export function isKnownModel(modelId: string): boolean {
  return findModelById(modelId) !== undefined;
}
