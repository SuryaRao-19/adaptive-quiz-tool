import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Pause, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Flame, 
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { Modal } from '../components/ui/Modal';
import { MathRenderer } from '../components/ui/MathRenderer';
import { QuizRibbon } from '../components/QuizRibbon';
import { SpeechButton } from '../components/ui/SpeechButton';
import { useAssessmentKeyboardShortcuts } from '../hooks/useAssessmentKeyboardShortcuts';
import { MOCK_QUESTIONS_POOL } from '../services/mockData';
import { getPreTestQuestions, submitQuizAnswers } from '../services/quizService';

export const QuizInterface = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answersLog, setAnswersLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Difficulty & Adaptive Engine Simulation
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [correctStreak, setCorrectStreak] = useState(0);

  // Subtle non-stressful timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  useEffect(() => {
    let timerInterval = null;
    if (!pauseModalOpen) {
      timerInterval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [pauseModalOpen]);

  // Load questions (from API or rich mock pool)
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await getPreTestQuestions(subject);
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setAlreadyCompleted(true);
          setLoading(false);
          return;
        }
        console.warn("API offline or error, falling back to rich mock questions pool.");
      }

      // Standalone Fallback Pool
      const pool = subject === 'Math'
        ? MOCK_QUESTIONS_POOL.Fractions
        : MOCK_QUESTIONS_POOL.Photosynthesis;
      setQuestions(pool);
      setLoading(false);
    };

    fetchQuestions();
  }, [subject]);

  const currentQ = questions[currentIndex] || {
    questionText: "What is 1/4 + 2/4?",
    options: ["3/8", "3/4", "2/8", "1/2"],
    correctIndex: 1,
    correctAnswerIndex: 1,
    explanation: "Add the numerators directly: 1 + 2 = 3. The common denominator remains 4, yielding 3/4."
  };

  // Phase 3: Keyboard-driven assessment shortcuts (1-4 / A-D, Enter, Space)
  useAssessmentKeyboardShortcuts({
    optionCount: currentQ?.options?.length || 4,
    selectedOption,
    onSelectOption: handleSelectOption,
    isAnswerChecked,
    onCheckAnswer: checkAnswer,
    canCheckAnswer: selectedOption !== null,
    onNextQuestion: handleNextQuestion,
    canNextQuestion: isAnswerChecked,
    isDisabled: pauseModalOpen || alreadyCompleted
  });

  const handleSelectOption = (idx) => {
    if (!isAnswerChecked) {
      setSelectedOption(idx);
    }
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;

    // Check correctness (mock or evaluation)
    const isCorrect = selectedOption === (currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 1);
    const explanation = currentQ.explanation || "Review fundamental concepts of fractions and common denominators.";

    setIsAnswerChecked(true);
    setFeedback({ isCorrect, explanation });

    // Adaptive Engine Adjustment
    if (isCorrect) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);
      if (nextStreak >= 3) {
        if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
        else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
      }
    } else {
      setCorrectStreak(0);
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }

    setAnswersLog([
      ...answersLog,
      {
        questionId: currentQ._id || currentQ.id || currentIndex,
        selectedOptionIndex: selectedOption,
        isCorrect
      }
    ]);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setFeedback(null);
    } else {
      // Completed! Persist authoritative submission online or handle gracefully
      const totalCount = Math.max(1, questions.length);
      const currentAnswer = {
        questionId: currentQ._id || currentQ.id || currentIndex,
        selectedOptionIndex: selectedOption,
        isCorrect: feedback?.isCorrect
      };
      const finalAnswers = [...answersLog, currentAnswer];
      const correctTotal = finalAnswers.filter(a => a.isCorrect).length;
      const calcScore = Math.min(100, Math.max(0, Math.round((correctTotal / totalCount) * 100)));

      try {
        await submitQuizAnswers({
          quizType: 'pre_test',
          subject,
          topic: 'Diagnostic',
          answers: finalAnswers
        });
      } catch (err) {
        console.warn("Could not submit diagnostic attempt to server:", err);
      }

      navigate(`/results?subject=${encodeURIComponent(subject)}&score=${calcScore}`);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (alreadyCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-subtle">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="primary" size="md">Diagnostic Calibrated</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {subject} Diagnostic Assessment Completed
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Your foundational baseline is already calibrated! You can jump straight into leveling up in Adaptive Practice Mode or inspect your topic breakdown.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate(`/practice?subject=${encodeURIComponent(subject)}`)}
          >
            Start Adaptive Practice →
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(`/results?subject=${encodeURIComponent(subject)}`)}
          >
            View Diagnostic Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Quiz Ribbon for Question, Difficulty, Batch Progress, & Connection status */}
      <QuizRibbon
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length || 6}
        subject={subject}
        difficulty={currentDifficulty}
        isTestMode={false}
      />

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            {subject} Diagnostic
          </Badge>
          <DifficultyBadge difficulty={currentDifficulty} />
        </div>

        <div className="flex items-center gap-3">
          {/* Subtle Timer */}
          {showTimer && (
            <div className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>
          )}

          <button
            onClick={() => setPauseModalOpen(true)}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Pause Quiz"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        current={currentIndex + 1}
        total={questions.length || 6}
        label={`Question ${currentIndex + 1} of ${questions.length || 6}`}
        className="mb-8"
      />

      {/* Question Card (Centerpiece) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-card p-6 sm:p-10 mb-6 relative">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">
          <div className="flex items-center gap-2">
            <span>Topic: {currentQ.topic || 'Foundational'}</span>
            <SpeechButton 
              text={`${currentQ.questionText || ''}. Options: ${currentQ.options?.map((o, i) => `Option ${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`} 
              label="Listen to question" 
            />
          </div>
          {correctStreak >= 2 && (
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Streak: {correctStreak}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-8">
          <MathRenderer content={currentQ.questionText} />
        </h2>

        {/* Large Accessible Option Buttons */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === (currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 1);

            let optionStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';

            if (!isAnswerChecked) {
              if (isSelected) {
                optionStyle = 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 font-bold ring-2 ring-indigo-600/30';
              }
            } else {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30 animate-pulseGreen';
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 font-bold ring-2 ring-rose-500/30 animate-shake';
              } else {
                optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 opacity-60';
              }
            }

            return (
              <motion.button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isAnswerChecked}
                whileHover={isAnswerChecked ? {} : { scale: 1.01 }}
                whileTap={isAnswerChecked ? {} : { scale: 0.99 }}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-base sm:text-lg min-h-[58px] ${optionStyle}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span><MathRenderer content={option} /></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Key {idx + 1}
                  </span>
                  {isAnswerChecked && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Check Answer Button (Pre-Submit) */}
      {!isAnswerChecked && (
        <Button
          size="lg"
          variant="primary"
          fullWidth
          disabled={selectedOption === null}
          onClick={checkAnswer}
          className="text-base font-bold shadow-glow-primary min-h-[48px]"
        >
          Check Answer
        </Button>
      )}

      {/* Immediate Pedagogical Feedback Card (Post-Submit) */}
      <AnimatePresence>
        {isAnswerChecked && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`rounded-3xl border p-6 sm:p-8 mb-6 shadow-card ${
              feedback.isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                feedback.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {feedback.isCorrect ? '✓' : '✗'}
              </div>
              <h3 className="text-xl font-bold">
                {feedback.isCorrect ? 'Excellent! Correct answer.' : 'Not quite right. Let’s review why:'}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 my-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white mb-1">Step-by-Step Explanation:</p>
              <MathRenderer content={feedback.explanation} />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant={feedback.isCorrect ? 'success' : 'primary'}
                size="lg"
                iconRight={ArrowRight}
                onClick={handleNextQuestion}
                className="px-8 shadow-sm min-h-[48px]"
              >
                {currentIndex === questions.length - 1 ? 'Complete Assessment →' : 'Next Question →'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause / Exit Modal */}
      <Modal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        title="Assessment Paused"
        subtitle="Your answers so far are safely recorded in memory."
      >
        <div className="my-6 space-y-3">
          <p className="text-sm text-slate-600">
            You can take a quick break or return to the dashboard. You will not lose your place.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setPauseModalOpen(false)}
          >
            Resume Quiz
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/select')}
          >
            Exit to Subject Selection
          </Button>
        </div>
      </Modal>
    </div>
  );
};
