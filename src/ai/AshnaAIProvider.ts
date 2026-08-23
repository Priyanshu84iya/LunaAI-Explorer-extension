import type { AnswerResponse, ProviderSettings, SelectionContext, StageUpdate, TopicResponse } from './types';
import { BackgroundResponse, withTimeout } from './messages';
import { resolveSettings } from './config';

export interface ExploreCallbacks {
  onStage?: (stage: StageUpdate) => void;
  signal?: AbortSignal;
}

/**
 * Centralized AI access layer. UI components never talk to the API directly.
 * Requests are routed through the background service worker so the explorer
 * iframe never makes cross-origin API calls directly. Every request has a
 * timeout and a deterministic fallback so the UI can never hang forever.
 */
export class AshnaAIProvider {
  private settings: ProviderSettings;
  private cache = new Map<string, TopicResponse>();
  private requestSeq = 0;

  constructor(settings: ProviderSettings) {
    this.settings = settings;
  }

  updateSettings(settings: ProviderSettings) {
    this.settings = settings;
  }

  clearCache() {
    this.cache.clear();
  }

  private cacheKey(prefix: string, key: string): string {
    return `${prefix}:${key.toLowerCase().trim()}`;
  }

  async analyzeTopic(context: SelectionContext, callbacks?: ExploreCallbacks): Promise<TopicResponse> {
    const cacheKey = this.cacheKey('topic', context.text);
    if (this.settings.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const seq = ++this.requestSeq;
    this.emit(callbacks, { stage: 'understanding', message: 'Understanding your topic...' });

    try {
      const result = await this.requestBackground<TopicResponse>({
        type: 'ANALYZE_TOPIC',
        payload: context,
      }, callbacks);
      if (seq !== this.requestSeq) throw new Error('Aborted');
      this.emit(callbacks, { stage: 'ready', message: 'Your explanation is ready.' });
      if (this.settings.cacheEnabled) this.cache.set(cacheKey, result);
      return result;
    } catch (err) {
      if (seq !== this.requestSeq) throw err;
      console.error('[LunaAI] Exploration failed:', err);
      throw err;
    }
  }

  async exploreTopic(concept: string, parentContext: string, callbacks?: ExploreCallbacks): Promise<TopicResponse> {
    const cacheKey = this.cacheKey('explore', `${parentContext}|${concept}`);
    if (this.settings.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    this.emit(callbacks, { stage: 'exploring', message: `Exploring ${concept}...` });
    try {
      const result = await this.requestBackground<TopicResponse>({
        type: 'EXPLORE_TOPIC',
        payload: { concept, parentContext },
      }, callbacks);
      if (this.settings.cacheEnabled) this.cache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('[LunaAI] Explore failed:', err);
      throw err;
    }
  }

  async askQuestion(question: string, topic: string, summary: string): Promise<AnswerResponse> {
    try {
      const result = await this.requestBackground<AnswerResponse>({
        type: 'ASK_QUESTION',
        payload: { question, topic, summary },
      });
      return result;
    } catch (err) {
      console.error('[LunaAI] Question failed:', err);
      throw err;
    }
  }

  private emit(callbacks: ExploreCallbacks | undefined, stage: StageUpdate) {
    if (callbacks?.signal?.aborted) return;
    callbacks?.onStage?.(stage);
  }

  private async requestBackground<T>(request: { type: string; payload: unknown }, callbacks?: ExploreCallbacks): Promise<T> {
    if (callbacks?.signal?.aborted) throw new Error('Aborted');

    const response = await withTimeout<BackgroundResponse>(
      chrome.runtime.sendMessage(request),
      30000,
    );

    if (callbacks?.signal?.aborted) throw new Error('Aborted');

    if (!response) {
      throw new Error('No response from AshnaAI');
    }
    if (!response.success) {
      throw new Error(response.error || 'AshnaAI request failed');
    }
    return response.data as T;
  }
}

export async function loadDefaultSettings(): Promise<ProviderSettings> {
  try {
    const stored = await chrome.storage.sync.get(['lunaaiSettings']);
    return resolveSettings(stored.lunaaiSettings as Partial<ProviderSettings> | undefined);
  } catch {
    return resolveSettings();
  }
}
