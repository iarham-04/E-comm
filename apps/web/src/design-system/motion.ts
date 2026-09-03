/**
 * Corazonetouch Design System — Motion Specifications
 *
 * Framer Motion animation presets for consistent micro-interactions.
 */
import type { Variants, Transition } from 'framer-motion';

// ── Timing Constants ─────────────────────────────────────────────────────────
export const duration = {
  instant: 0.1,
  fast:    0.15,
  normal:  0.3,
  slow:    0.4,
  slower:  0.6,
} as const;

export const easing = {
  easeOut:    [0.0, 0.0, 0.2, 1.0] as any,
  easeIn:     [0.4, 0.0, 1.0, 1.0] as any,
  easeInOut:  [0.4, 0.0, 0.2, 1.0] as any,
  spring:     { type: 'spring' as const, stiffness: 400, damping: 30 },
};

// ── Fade ─────────────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.normal, ease: easing.easeOut } },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden:  { opacity: 0, transition: { duration: duration.fast, ease: easing.easeIn } },
};

// ── Slide Up ─────────────────────────────────────────────────────────────────
export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.easeOut } },
};

// ── Slide In (Drawer) ────────────────────────────────────────────────────────
export const slideInRight: Variants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { duration: duration.normal, ease: easing.easeOut } },
  exit:    { x: '100%', transition: { duration: duration.fast, ease: easing.easeIn } },
};

export const slideInLeft: Variants = {
  hidden:  { x: '-100%' },
  visible: { x: 0, transition: { duration: duration.normal, ease: easing.easeOut } },
  exit:    { x: '-100%', transition: { duration: duration.fast, ease: easing.easeIn } },
};

// ── Scale In (Modal) ─────────────────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.fast, ease: easing.easeOut } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: duration.instant, ease: easing.easeIn } },
};

// ── Stagger Container ────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.easeOut } },
};

// ── Hover Presets ─────────────────────────────────────────────────────────────
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: duration.fast } },
  whileTap:   { scale: 0.98, transition: { duration: duration.instant } },
};

export const hoverGlow = {
  whileHover: { boxShadow: '0 0 20px rgba(200, 164, 85, 0.2)', transition: { duration: duration.fast } },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: duration.fast } },
  whileTap:   { scale: 0.98, transition: { duration: duration.instant } },
};

// ── Toast Slide ──────────────────────────────────────────────────────────────
export const toastSlideIn: Variants = {
  hidden:  { opacity: 0, x: 50, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: duration.normal, ease: easing.easeOut } },
  exit:    { opacity: 0, x: 50, scale: 0.95, transition: { duration: duration.fast, ease: easing.easeIn } },
};

// ── Page Transition ──────────────────────────────────────────────────────────
export const pageTransition: Transition = {
  duration: duration.slow,
  ease: easing.easeInOut,
};
