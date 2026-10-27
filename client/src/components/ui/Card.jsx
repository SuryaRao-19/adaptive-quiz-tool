import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  gradient = false
}) => {
  const Component = hoverEffect ? motion.div : 'div';
  const motionProps = hoverEffect
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
        className: `cursor-pointer transition-shadow duration-200 hover:shadow-card-hover`
      }
    : {};

  return (
    <Component
      onClick={onClick}
      {...motionProps}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 relative overflow-hidden ${
        gradient ? 'bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
};
