/**
 * Corazonetouch Design System — Design Tokens
 *
 * Single source of truth for colors, typography, spacing, grid,
 * border radii, shadows, and breakpoints.
 */

// ── Color Palette ────────────────────────────────────────────────────────────
export const colors = {
  obsidian:    '#0F0F0F',
  parchment:   '#FAF6F1',
  forgeGold:   '#C8A455',
  steel600:    '#475569',
  steel900:    '#0F172A',
  ember:       '#B45309',
  patina:      '#1B5E4F',
  ivory:       '#FFFFF0',

  // Semantic
  success:     '#059669',
  successLight:'#ECFDF5',
  error:       '#DC2626',
  errorLight:  '#FEF2F2',
  warning:     '#D97706',
  warningLight:'#FFFBEB',
  info:        '#2563EB',
  infoLight:   '#EFF6FF',

  // Neutrals (Slate scale)
  white:       '#FFFFFF',
  slate50:     '#F8FAFC',
  slate100:    '#F1F5F9',
  slate200:    '#E2E8F0',
  slate300:    '#CBD5E1',
  slate400:    '#94A3B8',
  slate500:    '#64748B',
  slate600:    '#475569',
  slate700:    '#334155',
  slate800:    '#1E293B',
  slate900:    '#0F172A',
  slate950:    '#020617',
} as const;

// ── Typography Scale ─────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    display: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body:    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSize: {
    xs:   ['0.75rem',  { lineHeight: '1rem' }],
    sm:   ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem',     { lineHeight: '1.5rem' }],
    lg:   ['1.125rem', { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
    '2xl':['1.5rem',   { lineHeight: '2rem' }],
    '3xl':['1.875rem', { lineHeight: '2.25rem' }],
    '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
    '5xl':['3rem',     { lineHeight: '1' }],
    '6xl':['3.75rem',  { lineHeight: '1' }],
  },
  fontWeight: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
    black:     900,
  },
  letterSpacing: {
    tight:   '-0.025em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const;

// ── Spacing Scale ────────────────────────────────────────────────────────────
export const spacing = {
  0:    '0px',
  0.5:  '2px',
  1:    '4px',
  1.5:  '6px',
  2:    '8px',
  2.5:  '10px',
  3:    '12px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  16:   '64px',
  20:   '80px',
  24:   '96px',

  // Semantic aliases
  section: '64px',  // Vertical spacing between homepage sections
  card:    '24px',  // Internal card padding
  stack:   '16px',  // Vertical stack spacing between elements
  inline:  '8px',   // Horizontal inline spacing
} as const;

// ── Grid System ──────────────────────────────────────────────────────────────
export const grid = {
  maxWidth:         '1280px',
  columns:          12,
  gap:              '24px',
  containerPadding: {
    sm: '16px',
    md: '24px',
    lg: '32px',
  },
} as const;

// ── Border Radius ────────────────────────────────────────────────────────────
export const radii = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'24px',
  full: '9999px',
} as const;

// ── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm:  '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md:  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg:  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl:  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;

// ── Breakpoints ──────────────────────────────────────────────────────────────
export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl':'1536px',
} as const;

// ── Z-Index ──────────────────────────────────────────────────────────────────
export const zIndex = {
  dropdown:  10,
  sticky:    20,
  overlay:   30,
  modal:     40,
  toast:     50,
} as const;
