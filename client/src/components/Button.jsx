import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'min-h-[48px] px-6 py-3 rounded-lg font-semibold text-base transition-all duration-150 flex items-center justify-center select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary: 'bg-blue-900 hover:bg-blue-950 text-white shadow-sm',
    teal: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
    outline: 'border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
