import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

export const GrowthCertificateModal = ({
  isOpen,
  onClose,
  studentName = 'Student Learner',
  rollNumber = '001',
  subject = 'Math',
  preScore = 40,
  postScore = 85,
  normalizedGain = '75.0%',
  grade = 7,
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden"
        >
          {/* Action Bar (Hidden when printing) */}
          <div className="no-print p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Official Student Growth Certificate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" icon={Printer} onClick={handlePrint}>
                Print Certificate
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Printable Body */}
          <div className="p-8 sm:p-12 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 relative">
            <div className="border-4 border-double border-indigo-600/60 dark:border-cyan-500/60 p-8 sm:p-10 rounded-2xl relative text-center space-y-6">
              
              {/* Seal & Institution Header */}
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md">
                  🎓
                </div>
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-cyan-400 pt-2">
                  AdaptIQ STEM Learning Initiative • UN SDG 4.1
                </h3>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-wide">
                  Certificate of Academic Growth
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Documenting empirical mastery acceleration across standardized curriculum tiers.
                </p>
              </div>

              {/* Recipient Details */}
              <div className="py-2 space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
                  This official growth verification is awarded to
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white underline decoration-indigo-400 underline-offset-8">
                  {studentName}
                </h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                  Student Roll Number: <strong className="text-slate-800 dark:text-slate-200">{rollNumber}</strong> • Grade {grade}
                </p>
              </div>

              {/* Assessment Telemetry Verification Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto py-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pre-Test Diagnostic</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{preScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Baseline</span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400 block">Post-Test Summative</span>
                  <span className="text-2xl font-extrabold text-indigo-700 dark:text-cyan-300">{postScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Mastery Outcome</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Normalized Gain (g)</span>
                  <span className="text-2xl font-extrabold text-emerald-600">{normalizedGain}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Empirical Growth</span>
                </div>
              </div>

              {/* Descriptive Growth Statement */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Demonstrated verified competency progression in <strong className="text-slate-900 dark:text-white">{subject}</strong>, advancing through Foundational, Procedural, Multi-Step, and Conceptual Mastery tiers with active error analysis and BKT mastery stabilization.
              </p>

              {/* Signatures & Verification Stamp */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-end justify-between text-left text-xs text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800 dark:text-slate-200">Date of Verification</span>
                  <span className="text-xs text-slate-500">{date}</span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Officially Verified Record</span>
                </div>

                <div className="text-right">
                  <div className="w-32 border-b border-slate-400 dark:border-slate-600 mb-1" />
                  <span className="block font-bold text-slate-800 dark:text-slate-200">Instructor Signature</span>
                  <span className="text-[10px] text-slate-400">Classroom Administrator</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
