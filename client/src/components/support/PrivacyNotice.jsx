import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const PrivacyNotice = ({ compact = false }) => {
  if (compact) {
    return (
      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>Submissions are delivered securely to our verified support mailbox. Student PINs, passwords, and private academic records are never transmitted.</span>
      </p>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>Privacy & Student Data Protection Notice</span>
      </div>
      <p className="leading-relaxed">
        Submitted inquiries, feedback, and bug reports are transmitted via Web3Forms directly to the configured AdaptIQ academic support mailbox. In strict compliance with educational privacy principles and UN SDG 4 guidelines, this form never transmits passwords, student PINs, active authentication tokens, or private classroom assessment responses.
      </p>
    </div>
  );
};
