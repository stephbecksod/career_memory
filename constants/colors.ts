/**
 * Career Memory — "Parchment & Moss" design tokens
 * Source of truth: career-memory-app.jsx prototype (lines 4-12)
 */
export const colors = {
  bg: '#F5F0E8',
  card: '#FAF7F2',
  cardHover: '#F2EBE0',
  cardBorder: 'rgba(173,156,142,0.18)',
  cardShadow: 'rgba(42,33,24,0.04)',

  moss: '#5C7A52',
  mossDeep: '#4A6642',
  mossGlow: 'rgba(92,122,82,0.22)',
  mossFaint: 'rgba(92,122,82,0.08)',
  mossBorder: 'rgba(92,122,82,0.2)',

  amber: '#C9941A',
  amberFaint: 'rgba(201,148,26,0.1)',
  amberBorder: 'rgba(201,148,26,0.18)',

  umber: '#AD9C8E',
  walnut: '#2A2118',
  blush: '#D9BBB0',
  divider: 'rgba(173,156,142,0.2)',

  danger: '#B05A40',
  dangerFaint: 'rgba(176,90,64,0.08)',
  dangerBorder: 'rgba(176,90,64,0.2)',

  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
