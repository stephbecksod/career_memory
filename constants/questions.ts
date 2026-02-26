export const QUESTION_KEYS = {
  HEADLINE: 'headline',
  SITUATION: 'situation',
  ACTION: 'action',
  RESULT: 'result',
  METRICS: 'metrics',
  SKILLS: 'skills',
  FREEFORM: 'freeform',
} as const;

export type QuestionKey = typeof QUESTION_KEYS[keyof typeof QUESTION_KEYS];

export const SYSTEM_QUESTIONS = [
  {
    key: QUESTION_KEYS.HEADLINE,
    text: 'What did you accomplish?',
    helperText: 'Think about what you were working on, why it mattered, what you specifically did, and what the outcome was',
    displayOrder: 1,
  },
  {
    key: QUESTION_KEYS.SITUATION,
    text: 'What was the situation or challenge?',
    helperText: 'What context or problem led to this work?',
    displayOrder: 2,
  },
  {
    key: QUESTION_KEYS.ACTION,
    text: 'What did you specifically do?',
    helperText: 'Focus on your individual contribution',
    displayOrder: 3,
  },
  {
    key: QUESTION_KEYS.RESULT,
    text: 'What was the result or impact?',
    helperText: 'What changed because of your work?',
    displayOrder: 4,
  },
  {
    key: QUESTION_KEYS.METRICS,
    text: 'Do you have any numbers or data to support this?',
    helperText: 'Percentages, time saved, revenue, users — anything quantifiable',
    displayOrder: 5,
  },
  {
    key: QUESTION_KEYS.SKILLS,
    text: 'What skills or strengths did this highlight?',
    helperText: 'Used to generate your tags automatically',
    displayOrder: 6,
  },
  {
    key: QUESTION_KEYS.FREEFORM,
    text: 'Anything else worth capturing?',
    helperText: 'Any additional context or color',
    displayOrder: 7,
  },
] as const;
