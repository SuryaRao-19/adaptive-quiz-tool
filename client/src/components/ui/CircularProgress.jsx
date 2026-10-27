import React from 'react';
import { motion } from 'framer-motion';

export const CircularProgress = ({
  percentage = 75,
  size = 140,
  strokeWidth = 12,
  label = 'Score',
  sublabel = 'Baseline',
  color = 'indigo'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    indigo: '#4F46E5',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E'
  };

  const strokeColor = colorMap[color] || (
    percentage >= 80 ? '#10B981' : percentage >= 60 ? '#4F46E5' : '#F59E0B'
  );

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {percentage}%
        </span>
        {label && <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
};
