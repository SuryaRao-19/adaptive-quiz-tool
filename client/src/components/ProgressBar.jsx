import React from 'react';

export const ProgressBar = ({ current, total, percentage, label }) => {
  const calcPercent = percentage !== undefined ? percentage : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full my-3">
      {label && (
        <div className="flex justify-between text-xs sm:text-sm font-medium text-slate-600 mb-1">
          <span>{label}</span>
          <span>{calcPercent}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${calcPercent}%` }}
        ></div>
      </div>
    </div>
  );
};
