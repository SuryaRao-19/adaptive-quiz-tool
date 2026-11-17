import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizes = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[38px]',
    md: 'text-sm px-5 py-3 gap-2 min-h-[48px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[52px]'
  };

  const variants = {
    primary: 'bg-[var(--theme-primary,#173E2B)] hover:bg-[var(--theme-primary-hover,#123021)] text-white shadow-sm hover:shadow-md focus:ring-[var(--theme-accent,#D9A441)] border border-transparent',
    secondary: 'bg-[#173E2B] hover:bg-[#123021] text-white shadow-sm focus:ring-[#D9A441] border border-transparent',
    teal: 'bg-[#416B50] hover:bg-[#173E2B] text-white shadow-sm focus:ring-[#D9A441]',
    outline: 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#416B50] shadow-subtle focus:ring-[#D9A441]',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
    glow: 'bg-gradient-to-r from-[#173E2B] via-[#416B50] to-[#173E2B] hover:opacity-95 text-white shadow-md border border-[#D9A441]/40'
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={disabled || loading ? {} : { scale: 1.015 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${sizes[size]} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span>{children}</span>
          {IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </motion.button>
  );
};
