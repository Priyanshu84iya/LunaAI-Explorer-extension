// Central AshnaAI configuration.
//
// Values come from Vite environment variables (defined in `.env` at the project
// root, all prefixed with VITE_ so Vite exposes them to the build). They are
// used as the default settings and can be overridden per-user from the Options
// page, which persists to chrome.storage.sync.

export interface AshnaEnvConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const ASHNA_DEFAULT_BASE_URL = 'https://api.ashna.ai/v1/api';
export const ASHNA_DEFAULT_MODEL = 'ashna-x1';
const LEGACY_PLACEHOLDER_ENDPOINT = 'https://api.ashnaai.example/v1';

import type { ProviderSettings } from './types';

export function loadEnvConfig(): AshnaEnvConfig {
  const baseUrl = (import.meta.env.VITE_ASHNA_API_BASE_URL as string) || '';
  const apiKey = (import.meta.env.VITE_ASHNA_API_KEY as string) || '';
  const model = (import.meta.env.VITE_ASHNA_MODEL as string) || '';
  return { baseUrl, apiKey, model };
}

export const ENV_CONFIG = loadEnvConfig();

/**
 * Build the OpenAI-compatible chat completions endpoint from a base URL.
 *
 * The configured base URL is `https://api.ashna.ai/v1/api` and the endpoint is
 * `/chat/completions`, giving `https://api.ashna.ai/v1/api/chat/completions`.
 * This is defensive against users pasting the full endpoint or a trailing
 * slash so we never duplicate `/v1`, `/api`, or `/chat/completions`.
 */
export function buildChatEndpoint(baseUrl: string): string {
  const trimmed = (baseUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  return `${trimmed}/chat/completions`;
}

/** True when a stored endpoint is missing or still the old placeholder. */
export function isPlaceholderEndpoint(endpoint: string | undefined): boolean {
  if (!endpoint) return true;
  const trimmed = endpoint.trim();
  return trimmed === '' || trimmed === LEGACY_PLACEHOLDER_ENDPOINT || trimmed === `${LEGACY_PLACEHOLDER_ENDPOINT}/`;
}

/**
 * Merge stored (Options page) settings with the `.env` config.
 *
 * The `.env` values are authoritative for the three critical fields. Stored
 * settings only win for endpoint/key/model when they are real values (not the
 * old placeholder or empty), so a stale Options save can never override a
 * correctly configured `.env`.
 */
export function resolveSettings(stored?: Partial<ProviderSettings>): ProviderSettings {
  const env = ENV_CONFIG;
  const storedEndpoint = stored?.apiEndpoint;
  const storedKey = stored?.apiKey;
  const storedModel = stored?.model;

  const apiEndpoint =
    storedEndpoint && !isPlaceholderEndpoint(storedEndpoint)
      ? storedEndpoint
      : env.baseUrl || ASHNA_DEFAULT_BASE_URL;
  const apiKey = storedKey || env.apiKey;
  const model = storedModel || env.model || ASHNA_DEFAULT_MODEL;

  return {
    apiEndpoint,
    apiKey,
    model,
    privacyMode: stored?.privacyMode ?? 'standard',
    includeContext: stored?.includeContext ?? true,
    cacheEnabled: stored?.cacheEnabled ?? true,
  };
}
