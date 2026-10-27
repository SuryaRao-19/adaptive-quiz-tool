import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({
  current = 0,
  total = 100,
  percentage,
  label,
  valueText,
  color = 'indigo',
  size = 'md',
  className = ''
}) => {
  const calcPercent = percentage !== undefined
    ? Math.min(100, Math.max(0, percentage))
    : Math.min(100, Math.max(0, Math.round((current / (total || 1)) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const gradients = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    cyan: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-r from-amber-400 to-amber-500',
    rose: 'bg-gradient-to-r from-rose-500 to-rose-600',
    adaptive: calcPercent < 60
      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
      : calcPercent < 80
      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500'
      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>{label}</span>
          <span className="font-mono text-slate-900">{valueText || `${calcPercent}%`}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size] || heights.md} border border-slate-200/50`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${calcPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${gradients[color] || gradients.indigo}`}
        />
      </div>
    </div>
  );
};
