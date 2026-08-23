import type { AnswerResponse, SelectionContext, ProviderSettings, TopicResponse } from './types';
import { sanitizeAnswerResponse, sanitizeTopicResponse } from './schemas';
import { buildChatEndpoint, ENV_CONFIG, isPlaceholderEndpoint } from './config';

export class AshnaAIError extends Error {
  constructor(
    message: string,
    public readonly kind: 'config' | 'network' | 'timeout' | 'invalid' | 'auth' | 'rate' | 'unknown' = 'unknown',
  ) {
    super(message);
    this.name = 'AshnaAIError';
  }
}

const SYSTEM_PROMPT = `You are AshnaAI, powering LunaAI Explorer.

Analyze the user's selected text.

Determine whether the selected text is:
- A topic
- A paragraph
- A question
- A technical concept

Return a concise, easy-to-understand response.

If it is a topic, explain what it is.
If it is a paragraph, summarize it.
If it is a question, answer it directly.

Also provide:
1. A short title
2. A concise summary
3. 3 to 5 key points
4. Related topics
5. Suggested follow-up questions

Return valid JSON only, matching the schema exactly. Never wrap in markdown fences.`;

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
  return `Explore the related topic "${concept}" in the context of "${parentContext}".
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
  // Strip markdown fences if present (```json ... ``` or bare ``` ... ```).
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end >= start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        throw new AshnaAIError('AI returned invalid JSON', 'invalid');
      }
    }
    throw new AshnaAIError('AI returned invalid JSON', 'invalid');
  }
}

export class AshnaAIClient {
  constructor(private settings: ProviderSettings) {}

  async analyzeTopic(context: SelectionContext): Promise<TopicResponse> {
    const prompt = buildTopicPrompt(context, this.settings);
    const raw = await this.request(prompt);
    const parsed = extractJson(raw);
    const result = sanitizeTopicResponse(parsed);
    if (!result) throw new AshnaAIError('AI response failed schema validation', 'invalid');
    return result;
  }

  async exploreTopic(concept: string, parentContext: string): Promise<TopicResponse> {
    const prompt = buildExplorePrompt(concept, parentContext);
    const raw = await this.request(prompt);
    const parsed = extractJson(raw);
    const result = sanitizeTopicResponse(parsed);
    if (!result) throw new AshnaAIError('AI response failed schema validation', 'invalid');
    return result;
  }

  async askQuestion(question: string, topic: string, summary: string): Promise<AnswerResponse> {
    const prompt = buildAskPrompt(question, topic, summary);
    const raw = await this.request(prompt);
    const parsed = extractJson(raw);
    const result = sanitizeAnswerResponse(parsed);
    if (!result) throw new AshnaAIError('AI response failed schema validation', 'invalid');
    return result;
  }

  private async request(prompt: string): Promise<string> {
    const endpoint = buildChatEndpoint(this.settings.apiEndpoint);
    if (!endpoint) {
      throw new AshnaAIError('AshnaAI base URL is missing. Set it in Options or .env.', 'config');
    }
    if (isPlaceholderEndpoint(this.settings.apiEndpoint)) {
      throw new AshnaAIError(
        'AshnaAI endpoint is not configured. Set your API base URL and key in Options or .env.',
        'config',
      );
    }
    if (!this.settings.apiKey) {
      throw new AshnaAIError('AshnaAI API key is missing. Set it in Options or .env.', 'config');
    }
    if (!this.settings.model) {
      throw new AshnaAIError('AshnaAI model is missing. Set it in Options or .env.', 'config');
    }

    console.log('[AshnaAI] Base URL:', this.settings.apiEndpoint);
    console.log('[AshnaAI] Endpoint:', endpoint);
    console.log('[AshnaAI] Model:', this.settings.model);
    console.log('[AshnaAI] Request sent');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: this.settings.model,
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
        throw new AshnaAIError('Authentication failed. Check your AshnaAI API key in Options.', 'auth');
      }
      if (res.status === 429) {
        throw new AshnaAIError('Rate limited. Try again shortly.', 'rate');
      }
      if (!res.ok) {
        throw new AshnaAIError(`AshnaAI API error ${res.status}: ${responseText.slice(0, 300)}`, 'unknown');
      }

      let data: { choices?: { message?: { content?: string } }[]; content?: string };
      try {
        data = JSON.parse(responseText) as { choices?: { message?: { content?: string } }[]; content?: string };
      } catch {
        throw new AshnaAIError('AshnaAI returned a non-JSON response', 'invalid');
      }

      const content = data.choices?.[0]?.message?.content ?? data.content;
      console.log('[LunaAI] Parsed content:', content);
      if (!content) throw new AshnaAIError('AshnaAI returned an empty response', 'invalid');
      return content;
    } catch (err) {
      if (err instanceof AshnaAIError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new AshnaAIError('Request timed out', 'timeout');
      }
      throw new AshnaAIError('Network error reaching AshnaAI', 'network');
    } finally {
      clearTimeout(timeout);
    }
  }
}
