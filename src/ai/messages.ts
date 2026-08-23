import type { AnswerResponse, SelectionContext, TopicResponse } from './types';

// Messages sent from the explorer iframe to the background service worker.
export type BackgroundRequest =
  | { type: 'ANALYZE_TOPIC'; payload: SelectionContext }
  | { type: 'EXPLORE_TOPIC'; payload: { concept: string; parentContext: string } }
  | { type: 'ASK_QUESTION'; payload: { question: string; topic: string; summary: string } };

export type BackgroundResponse =
  | { success: true; data: TopicResponse | AnswerResponse }
  | { success: false; error: string; kind?: string };

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
