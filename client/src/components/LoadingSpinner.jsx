import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-600 font-medium text-sm">{message}</p>
    </div>
  );
};
