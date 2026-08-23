import type { Category, SelectionContext, TopicResponse } from './types';

interface TopicTemplate {
  category: Category;
  summary: string;
  keyConcepts: string[];
  relatedTopics: string[];
  suggestedQuestions: string[];
  explorationOptions: string[];
}

const TEMPLATES: Record<string, TopicTemplate> = {
  plant: {
    category: 'Biology',
    summary: 'A plant is a living organism that typically uses sunlight, water, and carbon dioxide to produce energy through photosynthesis.',
    keyConcepts: ['Photosynthesis', 'Chlorophyll', 'Roots', 'Vascular tissue'],
    relatedTopics: ['Photosynthesis', 'Ecosystems', 'Botany', 'Cellular respiration'],
    suggestedQuestions: [
      'How do plants make their own food?',
      'What role do roots play in a plant?',
      'Why are leaves green?',
    ],
    explorationOptions: [
      'Explain photosynthesis step by step',
      'Compare plants and animals',
      'How do plants grow in different climates?',
    ],
  },
  'human heart': {
    category: 'Medicine',
    summary: 'The human heart is a muscular organ that pumps blood through the circulatory system, delivering oxygen and nutrients to the body.',
    keyConcepts: ['Circulation', 'Atria', 'Ventricles', 'Valves'],
    relatedTopics: ['Circulatory system', 'Blood pressure', 'Cardiology', 'Oxygen transport'],
    suggestedQuestions: [
      'How does blood flow through the heart?',
      'What keeps blood moving in one direction?',
      'Why does the heart need its own blood supply?',
    ],
    explorationOptions: [
      'Explain the cardiac cycle',
      'How does exercise affect the heart?',
      'What causes high blood pressure?',
    ],
  },
  photosynthesis: {
    category: 'Biology',
    summary: 'Photosynthesis is the process by which green plants convert sunlight, water, and carbon dioxide into glucose and oxygen.',
    keyConcepts: ['Chlorophyll', 'Chloroplast', 'Light reaction', 'Calvin cycle'],
    relatedTopics: ['Plants', 'Cellular respiration', 'Ecosystems', 'Climate'],
    suggestedQuestions: [
      'Where does photosynthesis happen in a leaf?',
      'What are the inputs and outputs?',
      'Why is photosynthesis important for life?',
    ],
    explorationOptions: [
      'Explain the light and dark reactions',
      'How do plants survive without sunlight?',
      'What is cellular respiration?',
    ],
  },
  'solar system': {
    category: 'Astronomy',
    summary: 'The solar system consists of the Sun and the planets, moons, asteroids, and comets that orbit around it.',
    keyConcepts: ['Planets', 'Orbit', 'Gravity', 'Sun'],
    relatedTopics: ['Astronomy', 'Gravity', 'Planets', 'Space exploration'],
    suggestedQuestions: [
      'What keeps the planets in orbit?',
      'Which planet is the largest?',
      'Why is Earth the only known world with life?',
    ],
    explorationOptions: [
      'Explain how gravity works',
      'Compare the inner and outer planets',
      'How do we explore the solar system?',
    ],
  },
  'binary search tree': {
    category: 'Computer Science',
    summary: 'A binary search tree is a data structure where each node has at most two children, ordered so that left values are smaller and right values are larger.',
    keyConcepts: ['Recursion', 'Balancing', 'Traversal', 'Complexity'],
    relatedTopics: ['Algorithms', 'Data structures', 'Sorting', 'Trees'],
    suggestedQuestions: [
      'Why is search fast in a balanced tree?',
      'How do you insert a new value?',
      'What happens if the tree becomes unbalanced?',
    ],
    explorationOptions: [
      'Explain tree traversal',
      'How does balancing work?',
      'Compare trees and hash tables',
    ],
  },
};

function genericTemplate(topic: string): TopicTemplate {
  const base = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    category: 'General Knowledge',
    summary: `${base} is a topic worth exploring. Here is a basic overview of its core ideas and how they connect.`,
    keyConcepts: ['Definition', 'Characteristics', 'Examples', 'Applications'],
    relatedTopics: ['General knowledge', 'Concepts', 'Learning'],
    suggestedQuestions: [
      `What is ${base} in simple terms?`,
      `Why does ${base} matter?`,
      `What are some real examples of ${base}?`,
    ],
    explorationOptions: [
      `Explain ${base} step by step`,
      `How is ${base} used in real life?`,
      `What connects ${base} to other topics?`,
    ],
  };
}

function findTemplate(key: string): TopicTemplate | null {
  for (const [name, template] of Object.entries(TEMPLATES)) {
    if (key.includes(name) || name.includes(key)) return template;
  }
  return null;
}

/**
 * Produces a valid TopicResponse for any topic without
 * calling the network. This guarantees the explorer never gets stuck on
 * a loading screen when AshnaAI is unavailable, slow, or misconfigured.
 */
export function generateFallbackExploration(text: string, context?: SelectionContext): TopicResponse {
  const topic = text.trim().slice(0, 80) || 'Selected topic';
  const key = topic.toLowerCase();
  const template = findTemplate(key) ?? genericTemplate(topic);

  return {
    topic,
    category: template.category,
    summary: template.summary,
    keyConcepts: template.keyConcepts,
    relatedTopics: template.relatedTopics,
    suggestedQuestions: template.suggestedQuestions,
    explorationOptions: template.explorationOptions,
  };
}
