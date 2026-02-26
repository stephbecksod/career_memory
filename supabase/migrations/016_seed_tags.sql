-- 016: Seed system tags
INSERT INTO tags (name, slug, category, is_system)
VALUES
  ('Leadership',            'leadership',            'theme',   true),
  ('Cross-functional',      'cross_functional',      'theme',   true),
  ('Shipped product',       'shipped_product',       'outcome', true),
  ('Cost reduction',        'cost_reduction',        'outcome', true),
  ('Revenue impact',        'revenue_impact',        'outcome', true),
  ('Process improvement',   'process_improvement',   'outcome', true),
  ('Mentorship',            'mentorship',            'skill',   true),
  ('Communication',         'communication',         'skill',   true),
  ('Problem solving',       'problem_solving',       'skill',   true),
  ('Data analysis',         'data_analysis',         'skill',   true),
  ('Project management',    'project_management',    'skill',   true),
  ('Stakeholder management','stakeholder_management','skill',   true);
