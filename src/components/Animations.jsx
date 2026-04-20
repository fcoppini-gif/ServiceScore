// =============================================================================
// ANIMATIONS - Framer Motion animations for premium feel
// =============================================================================
import { motion, AnimatePresence } from 'framer-motion';

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Fade in up animation
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

// Scale in animation (for cards)
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Stagger children for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Individual stagger item
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Card hover animation
export const cardHover = {
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 }
};

// Pulse animation for emphasis
export const pulseOnce = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 1] },
  transition: { duration: 0.3, repeat: 0 }
};

// Slide in from right
export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Haptic feedback helper
export const haptic = (type = 'light') => {
  if (navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 40,
      success: [10, 50, 10],
      error: [40, 20, 40]
    };
    navigator.vibrate(patterns[type] || 10);
  }
};

// Animated counter
export function AnimatedCounter({ value, duration = 1 }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  );
}

// Animated number counter with count up
export function CountUpNumber({ from = 0, to, duration = 1.5, prefix = '', suffix = '' }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {to.toLocaleString()}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Skeleton loader
export function Skeleton({ className = '', count = 1 }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-white/10 rounded-lg ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="h-4 bg-slate-300 dark:bg-white/5 rounded mb-2" />
      ))}
    </div>
  );
}

export default {
  pageTransition,
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  cardHover,
  haptic
};