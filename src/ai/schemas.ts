import type { AnswerResponse, Category, TopicResponse } from './types';

const CATEGORIES: Category[] = [
  'Biology',
  'Medicine',
  'Physics',
  'Chemistry',
  'Geography',
  'Astronomy',
  'History',
  'Computer Science',
  'Mathematics',
  'Engineering',
  'Business',
  'General Knowledge',
];

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function sanitizeStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter(isString) : [];
}

export function sanitizeTopicResponse(raw: unknown): TopicResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const topic = isString(r.topic) ? r.topic.trim() : '';
  if (!topic) return null;

  const category: Category =
    isString(r.category) && CATEGORIES.includes(r.category as Category)
      ? (r.category as Category)
      : 'General Knowledge';

  const summary = isString(r.summary) ? r.summary : '';

  return {
    topic,
    category,
    summary,
    keyConcepts: sanitizeStringArray(r.keyConcepts),
    relatedTopics: sanitizeStringArray(r.relatedTopics),
    suggestedQuestions: sanitizeStringArray(r.suggestedQuestions),
    explorationOptions: sanitizeStringArray(r.explorationOptions),
  };
}

export function sanitizeAnswerResponse(raw: unknown): AnswerResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const answer = isString(r.answer) ? r.answer.trim() : '';
  if (!answer) return null;
  return {
    answer,
    relatedTopics: sanitizeStringArray(r.relatedTopics),
    suggestedQuestions: sanitizeStringArray(r.suggestedQuestions),
  };
}
