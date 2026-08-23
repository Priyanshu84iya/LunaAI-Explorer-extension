/// <reference types="chrome" />

// LunaAI Explorer - MV3 service worker.
// Owns all AshnaAI API calls. The explorer iframe sends messages here instead
// of making cross-origin requests directly. Every message resolves to either
// { success: true, data } or { success: false, error }.

import type { AnswerResponse, ProviderSettings, SelectionContext, TopicResponse } from '../ai/types';
import { sanitizeAnswerResponse, sanitizeTopicResponse } from '../ai/schemas';
import type { BackgroundRequest, BackgroundResponse } from '../ai/messages';
import { buildChatEndpoint, isPlaceholderEndpoint, resolveSettings } from '../ai/config';

async function getSettings(): Promise<ProviderSettings> {
  try {
    const stored = await chrome.storage.sync.get(['lunaaiSettings']);
    return resolveSettings(stored.lunaaiSettings as Partial<ProviderSettings> | undefined);
  } catch {
    return resolveSettings();
  }
}

const SYSTEM_PROMPT = `You are AshnaAI, the knowledge engine behind LunaAI Explorer.
You turn highlighted text into a clear, understandable topic explanation.
Always respond with valid JSON only, matching the schema exactly. Never wrap in markdown fences.`;

function buildTopicPrompt(context: SelectionContext, settings: ProviderSettings): string {
  const parts: string[] = [];
  parts.push(`Selected text: "${context.text}"`);
  if (settings.includeContext) {
    if (context.pageTitle) parts.push(`Page title: "${context.pageTitle}"`);
    if (context.heading) parts.push(`Relevant heading: "${context.heading}"`);
    if (context.nearbyContext) parts.push(`Nearby context: "${context.nearbyContext}"`);
    if (context.domain) parts.push(`Domain: ${context.domain}`);
  }
  parts.push(`
Analyze the topic and return JSON with this shape:
{
  "topic": string,
  "category": "Biology"|"Medicine"|"Physics"|"Chemistry"|"Geography"|"Astronomy"|"History"|"Computer Science"|"Mathematics"|"Engineering"|"Business"|"General Knowledge",
  "summary": string (1-2 sentences, simple),
  "keyConcepts": [string],
  "relatedTopics": [string],
  "suggestedQuestions": [string],
  "explorationOptions": [string]
}
Keep keyConcepts to 4-8 focused ideas, relatedTopics to 4-8 connected topics, suggestedQuestions to 3-5 questions a learner would ask, and explorationOptions to 3-5 ways to go deeper.`);
  return parts.join('\n');
}

function buildExplorePrompt(concept: string, parentContext: string): string {
  return `Explore the concept "${concept}" deeper in the context of "${parentContext}".
Return the same JSON schema as topic analysis, with "topic" set to "${concept}", a clear summary, key concepts, related topics, suggested questions, and exploration options.`;
}

function buildAskPrompt(question: string, topic: string, summary: string): string {
  return `Answer this question about "${topic}": "${question}"
Context: ${summary}
Return JSON with this shape:
{
  "answer": string (clear, helpful, 2-4 sentences),
  "relatedTopics": [string],
  "suggestedQuestions": [string]
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end >= start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        throw new Error('AshnaAI returned invalid JSON');
      }
    }
    throw new Error('AshnaAI returned invalid JSON');
  }
}

async function chatRequest(settings: ProviderSettings, prompt: string): Promise<unknown> {
  const endpoint = buildChatEndpoint(settings.apiEndpoint);
  if (!endpoint || isPlaceholderEndpoint(settings.apiEndpoint)) {
    throw new Error('AshnaAI endpoint is not configured. Set your API base URL and key in Options or .env.');
  }
  if (!settings.apiKey) {
    throw new Error('AshnaAI API key is missing. Set it in Options or .env.');
  }
  if (!settings.model) {
    throw new Error('AshnaAI model is missing. Set it in Options or .env.');
  }

  console.log('[AshnaAI] Base URL:', settings.apiEndpoint);
  console.log('[AshnaAI] Endpoint:', endpoint);
  console.log('[AshnaAI] Model:', settings.model);
  console.log('[AshnaAI] Request sent');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    const responseText = await res.text();
    console.log('[AshnaAI] Status:', res.status);
    console.log('[AshnaAI] Raw response:', responseText);

    if (res.status === 401 || res.status === 403) {
      throw new Error('Authentication failed. Check your AshnaAI API key in Options.');
    }
    if (res.status === 429) {
      throw new Error('Rate limited. Try again shortly.');
    }
    if (!res.ok) {
      throw new Error(`AshnaAI API error ${res.status}: ${responseText.slice(0, 300)}`);
    }
    const data = JSON.parse(responseText) as { choices?: { message?: { content?: string } }[]; content?: string };
    const content = data.choices?.[0]?.message?.content ?? data.content;
    console.log('[LunaAI] Parsed content:', content);
    if (!content) throw new Error('AshnaAI returned an empty response');
    return extractJson(content);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('AshnaAI returned a non-JSON response');
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function analyzeTopic(context: SelectionContext): Promise<TopicResponse> {
  const settings = await getSettings();
  const prompt = buildTopicPrompt(context, settings);
  const parsed = await chatRequest(settings, prompt);
  const result = sanitizeTopicResponse(parsed);
  if (!result) throw new Error('AshnaAI response failed schema validation');
  return result;
}

async function exploreTopic(concept: string, parentContext: string): Promise<TopicResponse> {
  const settings = await getSettings();
  const prompt = buildExplorePrompt(concept, parentContext);
  const parsed = await chatRequest(settings, prompt);
  const result = sanitizeTopicResponse(parsed);
  if (!result) throw new Error('AshnaAI response failed schema validation');
  return result;
}

async function askQuestion(question: string, topic: string, summary: string): Promise<AnswerResponse> {
  const settings = await getSettings();
  const prompt = buildAskPrompt(question, topic, summary);
  const parsed = await chatRequest(settings, prompt);
  const result = sanitizeAnswerResponse(parsed);
  if (!result) throw new Error('AshnaAI response failed schema validation');
  return result;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['lunaaiSettings']).then((stored) => {
    if (!stored.lunaaiSettings) {
      chrome.storage.sync.set({ lunaaiSettings: resolveSettings() });
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const req = message as BackgroundRequest | undefined;
  if (!req || !req.type) return false;

  const respond = (response: BackgroundResponse) => {
    try {
      sendResponse(response);
    } catch {
      // The sender may have gone away; nothing more to do.
    }
  };

  const handle = async (): Promise<void> => {
    try {
      if (req.type === 'ANALYZE_TOPIC') {
        const data = await analyzeTopic(req.payload);
        respond({ success: true, data });
      } else if (req.type === 'EXPLORE_TOPIC') {
        const data = await exploreTopic(req.payload.concept, req.payload.parentContext);
        respond({ success: true, data });
      } else if (req.type === 'ASK_QUESTION') {
        const data = await askQuestion(req.payload.question, req.payload.topic, req.payload.summary);
        respond({ success: true, data });
      } else {
        respond({ success: false, error: 'Unknown request type' });
      }
    } catch (err) {
      console.error('[AshnaAI] Request failed:', err);
      respond({
        success: false,
        error: err instanceof Error ? err.message : 'AshnaAI request failed',
      });
    }
  };

  handle();
  return true; // keep the message channel open for the async response
});
