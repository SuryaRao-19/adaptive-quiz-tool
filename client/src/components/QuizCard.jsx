import React from 'react';
import { MathRenderer } from './ui/MathRenderer';
import { STEMDiagram } from './ui/STEMDiagram';
import { SpeechButton } from './ui/SpeechButton';

export const QuizCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  submitted = false,
  isCorrect = null,
  correctOptionIndex = null
}) => {
  if (!question) return null;

  const getOptionStyle = (index) => {
    const isSelected = selectedOption === index;

    if (!submitted) {
      if (isSelected) {
        return 'border-blue-900 bg-blue-50 text-blue-950 font-semibold ring-2 ring-blue-900 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-500';
      }
      return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';
    }

    // Post-Submission State
    if (index === correctOptionIndex) {
      return 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-500';
    }
    if (isSelected && !isCorrect) {
      return 'border-red-600 bg-red-50 text-red-950 font-semibold ring-2 ring-red-600 dark:bg-red-950/60 dark:text-red-100 dark:border-red-500';
    }
    return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-400 opacity-60';
  };

  const fullQuestionSpeechText = `${question.questionText || ''}. ${
    question.options ? `Option A: ${question.options[0]}. Option B: ${question.options[1]}. Option C: ${question.options[2]}. Option D: ${question.options[3]}.` : ''
  }`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-subtle border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6 transition-colors">
      <div className="flex justify-between items-center mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
        <span>Question {questionNumber} of {totalQuestions}</span>
        <div className="flex items-center gap-2">
          <SpeechButton text={fullQuestionSpeechText} label="Read question and options" />
          {question.difficulty && (
            <span className="uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Question Text with KaTeX STEM Math Support */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-snug">
        <MathRenderer content={question.questionText} />
      </h2>

      {/* Optional STEM Diagram if provided in question metadata */}
      {question.diagram && (
        <STEMDiagram 
          type={question.diagram.type} 
          data={question.diagram.data} 
          caption={question.diagram.caption} 
        />
      )}

      {/* Accessible Option Cards */}
      <div 
        className="space-y-3"
        role="radiogroup"
        aria-label="Quiz answer options"
      >
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={selectedOption === idx}
            disabled={submitted}
            onClick={() => onSelectOption(idx)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between text-base sm:text-lg min-h-[52px] focus-ring ${getOptionStyle(idx)}`}
          >
            <div className="flex items-center space-x-3.5">
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-current flex items-center justify-center font-bold text-sm">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-snug">
                <MathRenderer content={opt} />
              </span>
            </div>
            {submitted && idx === correctOptionIndex && (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-lg" aria-label="Correct answer">✓</span>
            )}
            {submitted && selectedOption === idx && !isCorrect && (
              <span className="text-red-700 dark:text-red-400 font-bold text-lg" aria-label="Incorrect answer">✗</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
