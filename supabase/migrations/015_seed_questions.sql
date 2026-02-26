-- 015: Seed system questions
INSERT INTO questions (question_text, question_key, section_type, is_system, is_active, display_order, helper_text)
VALUES
  (
    'What did you accomplish?',
    'headline',
    'professional',
    true,
    true,
    1,
    'Think about what you were working on, why it mattered, what you specifically did, and what the outcome was'
  ),
  (
    'What was the situation or challenge?',
    'situation',
    'professional',
    true,
    true,
    2,
    'What context or problem led to this work?'
  ),
  (
    'What did you specifically do?',
    'action',
    'professional',
    true,
    true,
    3,
    'Focus on your individual contribution'
  ),
  (
    'What was the result or impact?',
    'result',
    'professional',
    true,
    true,
    4,
    'What changed because of your work?'
  ),
  (
    'Do you have any numbers or data to support this?',
    'metrics',
    'professional',
    true,
    true,
    5,
    'Percentages, time saved, revenue, users — anything quantifiable'
  ),
  (
    'What skills or strengths did this highlight?',
    'skills',
    'professional',
    true,
    true,
    6,
    'Used to generate your tags automatically'
  ),
  (
    'Anything else worth capturing?',
    'freeform',
    'professional',
    true,
    true,
    7,
    'Any additional context or color'
  );
