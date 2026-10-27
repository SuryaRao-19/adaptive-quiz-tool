import React from 'react';
import { STATUS_COLORS } from '../utils/constants';

export const TopicBadge = ({ status }) => {
  const conf = STATUS_COLORS[status] || STATUS_COLORS.in_progress;

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}>
      {conf.label}
    </span>
  );
};
