import React from 'react';
import { Button } from './ui/Button';
import { MathRenderer } from './ui/MathRenderer';
import { SpeechButton } from './ui/SpeechButton';
import { CheckCircle2, XCircle, Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react';

/**
 * Pedagogical Explanation Experience (Phase 3.4)
 * Presents:
 * 1. Result (Correct / Incorrect)
 * 2. Step-by-step derivation
 * 3. Foundational concept tested
 * 4. Likely misconception diagnosis (when provided)
 * 5. Actionable next-step continue button
 */
export const FeedbackModal = ({ 
  isCorrect, 
  explanation, 
  steps = [], 
  conceptSummary = '', 
  misconception = '',
  onNext, 
  isLastQuestion = false 
}) => {
  const feedbackSpeechText = `${isCorrect ? 'Correct.' : 'Incorrect.'} ${explanation || ''}. ${
    conceptSummary ? `Key concept: ${conceptSummary}.` : ''
  } ${misconception ? `Common pitfall to avoid: ${misconception}.` : ''}`;

  return (
    <div 
      role="region"
      aria-live="polite"
      aria-label="Answer feedback and explanation"
      className={`rounded-2xl border p-6 my-6 shadow-card transition-all ${
        isCorrect 
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
          : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${
              isCorrect ? 'text-emerald-950 dark:text-emerald-200' : 'text-rose-950 dark:text-rose-200'
            }`}>
              {isCorrect ? 'Correct! Strong understanding demonstrated.' : 'Not quite right. Let\'s unpack why:'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {isCorrect ? 'Review the concise derivation below to lock in the method.' : 'Every mistake is a learning opportunity.'}
            </p>
          </div>
        </div>
        <SpeechButton text={feedbackSpeechText} label="Read explanation aloud" />
      </div>

      {/* Main Plain-English Explanation */}
      {explanation && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 my-3 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <span>Explanation:</span>
          </p>
          <div className="text-slate-700 dark:text-slate-300">
            <MathRenderer content={explanation} />
          </div>
        </div>
      )}

      {/* Structured Step-by-Step Derivation */}
      {steps && steps.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 my-3 space-y-3">
          <p className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step-by-Step Solution
          </p>
          <div className="space-y-2.5">
            {steps.map((st, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {st.step || `Step ${i + 1}`}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    <MathRenderer content={st.desc || ''} />
                  </p>
                  {st.math && (
                    <div className="mt-1 font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 p-1.5 rounded border border-indigo-100 dark:border-indigo-900/60 inline-block">
                      <MathRenderer content={st.math} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Likely Student Misconception Diagnosis */}
      {misconception && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 my-3 flex items-start gap-2.5 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">Common Pitfall: </span>
            <span className="text-amber-800 dark:text-amber-300">
              <MathRenderer content={misconception} />
            </span>
          </div>
        </div>
      )}

      {/* Core Foundational Concept Summary */}
      {conceptSummary && (
        <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3.5 my-3 flex items-start gap-2.5 text-xs sm:text-sm">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-200">Core Takeaway: </span>
            <span className="text-blue-800 dark:text-blue-300">
              <MathRenderer content={conceptSummary} />
            </span>
          </div>
        </div>
      )}

      {/* Actionable Next Step Button */}
      <div className="mt-5 flex justify-end">
        <Button 
          onClick={onNext} 
          variant={isCorrect ? 'success' : 'primary'} 
          size="md"
          iconRight={ArrowRight}
          className="px-7"
        >
          {isLastQuestion ? 'Complete Assessment' : 'Continue Practice'}
        </Button>
      </div>
    </div>
  );
};
