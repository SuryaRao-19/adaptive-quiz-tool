import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-[var(--theme-primary-light,#F4F6F1)] text-[var(--theme-primary,#173E2B)] border-[var(--theme-primary-border,#416B50)] dark:bg-[#101E17] dark:text-emerald-400 dark:border-emerald-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    error: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    purple: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    cyan: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-[#173E2B]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    purple: 'bg-[#416B50]',
    cyan: 'bg-[#D9A441]'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizes[size]} ${variants[variant] || variants.default} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'}`} />}
      {children}
    </span>
  );
};
