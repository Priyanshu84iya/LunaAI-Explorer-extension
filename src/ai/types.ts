export type Category =
  | 'Biology'
  | 'Medicine'
  | 'Physics'
  | 'Chemistry'
  | 'Geography'
  | 'Astronomy'
  | 'History'
  | 'Computer Science'
  | 'Mathematics'
  | 'Engineering'
  | 'Business'
  | 'General Knowledge';

/**
 * The result of turning highlighted text into an understandable topic.
 * This is a pure text/knowledge model - no images, diagrams, or 3D.
 */
export interface TopicResponse {
  topic: string;
  category: Category;
  summary: string;
  keyConcepts: string[];
  relatedTopics: string[];
  suggestedQuestions: string[];
  explorationOptions: string[];
}

/** The result of asking LunaAI a contextual question about the topic. */
export interface AnswerResponse {
  answer: string;
  relatedTopics?: string[];
  suggestedQuestions?: string[];
}

export interface SelectionContext {
  text: string;
  pageTitle?: string;
  heading?: string;
  nearbyContext?: string;
  domain?: string;
  url?: string;
}

export interface ProviderSettings {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  privacyMode: 'minimal' | 'standard';
  includeContext: boolean;
  cacheEnabled: boolean;
}

export interface StageUpdate {
  stage: string;
  message: string;
}
