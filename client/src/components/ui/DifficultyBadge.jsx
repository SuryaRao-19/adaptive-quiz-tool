import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame, ShieldAlert, Award } from 'lucide-react';

export const DifficultyBadge = ({ difficulty = 'medium', className = '', showLevel = false }) => {
  const normalized = difficulty.toLowerCase().replace(/[\s-]/g, '_');

  const configs = {
    easy: {
      level: 'L1',
      label: 'Level 1: Foundational',
      short: 'Easy',
      color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 shadow-sm',
      icon: Sparkles,
      iconColor: 'text-sky-500'
    },
    medium: {
      level: 'L2',
      label: 'Level 2: Procedural',
      short: 'Medium',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm',
      icon: Zap,
      iconColor: 'text-indigo-500'
    },
    hard: {
      level: 'L3',
      label: 'Level 3: Multi-Step',
      short: 'Hard',
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-sm',
      icon: Flame,
      iconColor: 'text-amber-500'
    },
    very_hard: {
      level: 'L4',
      label: 'Level 4: Conceptual Mastery',
      short: 'Very Hard',
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-sm ring-1 ring-purple-400/30',
      icon: Award,
      iconColor: 'text-purple-500 animate-pulse'
    }
  };

  const current = configs[normalized] || configs.medium;
  const Icon = current.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={difficulty}
        initial={{ scale: 0.85, opacity: 0, y: -4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${current.color} ${className}`}
      >
        <Icon className={`w-3.5 h-3.5 ${current.iconColor}`} />
        <span>{showLevel ? current.label : current.short}</span>
      </motion.div>
    </AnimatePresence>
  );
};
