import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  PlusCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  Layers,
  Award,
  Zap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { MathRenderer } from '../components/ui/MathRenderer';
import { QuizRibbon } from '../components/QuizRibbon';
import { SpeechButton } from '../components/ui/SpeechButton';
import { useAssessmentKeyboardShortcuts } from '../hooks/useAssessmentKeyboardShortcuts';
import { MOCK_TESTS, MOCK_CLASSES } from '../services/mockData';
import { recordAttempt } from '../services/progressService';
import { submitQuizAnswers } from '../services/quizService';
import confetti from 'canvas-confetti';

export const TestMode = () => {
  const { user, role } = useContext(AuthContext);
  const { currentTheme } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Test catalog state
  const [testsList, setTestsList] = useState(MOCK_TESTS);

  // Active Test State
  const activeTestId = searchParams.get('id');
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testScore, setTestScore] = useState(null);

  // Post-Test Review State
  const [reviewQuestionIdx, setReviewQuestionIdx] = useState(0);
  const [reviewActiveTab, setReviewActiveTab] = useState('steps'); // 'steps' | 'explanation'

  // Teacher "Assign Test" Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    subject: 'Math',
    classId: 'MATH-7B',
    duration: 15,
    dueDate: '2026-09-28'
  });

  useEffect(() => {
    if (activeTestId) {
      const found = testsList.find((t) => t.id === activeTestId) || testsList[0];
      setTestData(found);
      setSecondsRemaining((found.durationMinutes || 15) * 60);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTestCompleted(false);
      setTestScore(null);
    }
  }, [activeTestId]);

  // Countdown Timer
  useEffect(() => {
    if (activeTestId && !testCompleted && secondsRemaining > 0) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            calculateScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTestId, testCompleted, secondsRemaining]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx
    });
  };

  const calculateScore = () => {
    const questions = testData?.questions || MOCK_TESTS[0].questions;
    let correct = 0;
    const avgTimePerQuestion = Math.max(
      5,
      Math.round(((testData?.durationMinutes || 15) * 60 - secondsRemaining) / (questions.length || 1))
    );

    questions.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      if (selectedIdx === q.correctIndex) {
        correct++;
      }
      if (selectedIdx !== undefined) {
        recordAttempt({
          questionId: q.id,
          selectedAnswerIndex: selectedIdx,
          subject: testData?.subject || 'Math',
          topic: q.topic || 'Assessment',
          difficulty: q.difficulty || 'medium',
          timeSpentSeconds: avgTimePerQuestion
        }).catch(() => {});
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setTestScore({ correct, total: questions.length, percentage });
    setTestCompleted(true);
    setConfirmModalOpen(false);
    setReviewQuestionIdx(0);

    // Server-authoritative post-test submission
    submitQuizAnswers({
      quizType: 'post_test',
      subject: testData?.subject || 'Math',
      topic: 'Assessment',
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: selectedAnswers[q.id],
        isCorrect: selectedAnswers[q.id] === q.correctIndex
      }))
    }).catch((err) => console.warn('Could not record official post_test:', err));

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && percentage >= 70) {
      confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
    }
  };

  // Phase 3: Keyboard-Driven Assessment Shortcuts for Timed Tests
  const activeQuestions = testData?.questions || MOCK_TESTS[0].questions;
  const currentActiveQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];
  const isLastActiveQuestion = currentQuestionIndex === activeQuestions.length - 1;

  useAssessmentKeyboardShortcuts({
    optionCount: currentActiveQ?.options?.length || 4,
    selectedOption: selectedAnswers[currentActiveQ?.id] ?? null,
    onSelectOption: (idx) => {
      if (currentActiveQ) handleSelectOption(currentActiveQ.id, idx);
    },
    isAnswerChecked: false,
    canCheckAnswer: true,
    onCheckAnswer: () => {
      if (!isLastActiveQuestion) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setConfirmModalOpen(true);
      }
    },
    canNextQuestion: !isLastActiveQuestion,
    onNextQuestion: () => setCurrentQuestionIndex((prev) => prev + 1),
    isDisabled: !activeTestId || !testData || testCompleted || confirmModalOpen
  });

  // ==========================================
  // VIEW 1: ACTIVE TIMED TEST EXECUTION SCREEN
  // ==========================================
  if (activeTestId && testData && !testCompleted) {
    const questions = testData.questions || MOCK_TESTS[0].questions;
    const currentQ = questions[currentQuestionIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 pb-16 transition-colors">
        {/* Visually Distinguished Test Banner (Solid Dark Navy / Amber) */}
        <div className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 shadow-md sticky top-0 z-30 border-b border-slate-800">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block">
                  4-Tier Standardized Assessment
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {testData.title}
                </h2>
              </div>
            </div>

            {/* Countdown Clock Display */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border ${
              secondsRemaining < 180
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-slate-800 text-white border-slate-700'
            }`}>
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatCountdown(secondsRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Progress & Disclaimer Bar */}
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} Answered</span>
          </div>

          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            color="indigo"
          />

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Answers locked per submission. Solved step-by-step answers and conceptual notes available immediately after test completion.</span>
          </div>

          {/* Test Question Card with Difficulty Level Badge */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card p-6 sm:p-10">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span>Section: {currentQ.topic || 'Assessment'}</span>
                <SpeechButton 
                  text={`Question ${currentQuestionIndex + 1}. ${currentQ?.questionText || ''}. Options: ${(currentQ?.options || []).map((o, i) => `Option ${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`}
                  label="Listen to question"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">Level Tier:</span>
                <DifficultyBadge difficulty={currentQ.difficulty || 'medium'} showLevel />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-8">
              <MathRenderer content={currentQ.questionText} />
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3" role="radiogroup" aria-label="Assessment options">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    whileHover={{ scale: 1.012 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-base sm:text-lg min-h-[58px] ${
                      isSelected
                        ? 'border-indigo-600 dark:border-cyan-400 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-cyan-200 font-bold ring-2 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center font-bold text-sm shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span><MathRenderer content={opt} /></span>
                    </div>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-400 border border-slate-200 dark:border-slate-600">
                      {idx + 1}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              variant="outline"
              size="lg"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                iconRight={ArrowRight}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="glow"
                size="lg"
                onClick={() => setConfirmModalOpen(true)}
              >
                Review & Submit Test ✓
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Submit Assessment?"
          subtitle="Are you ready to submit your test for official grading?"
        >
          <div className="my-6 space-y-3">
            {unansweredCount > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  You have <strong className="font-bold">{unansweredCount} unanswered questions</strong>. Once submitted, answers are sealed.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All {questions.length} questions answered across 4 difficulty tiers. Ready for grading.</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={calculateScore}
            >
              Confirm Submission & View Solutions
            </Button>
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => setConfirmModalOpen(false)}
            >
              Return to Review
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: POST-TEST RESULTS & COMPREHENSIVE SOLVED ANSWERS / EXPLANATION
  // =========================================================================
  if (activeTestId && testCompleted && testScore) {
    const questions = testData?.questions || MOCK_TESTS[0].questions;
    const currentReviewQ = questions[reviewQuestionIdx] || questions[0];
    const userSelectedIdx = selectedAnswers[currentReviewQ.id];
    const isCorrect = userSelectedIdx === currentReviewQ.correctIndex;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
        
        {/* Top Score Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-glow-primary">
            🎓
          </div>
          <Badge variant="primary" size="md" className="mb-2">Official Timed Assessment Results</Badge>
          
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {testScore.percentage >= 70 ? 'Proficiency Milestone Achieved!' : 'Assessment Complete - Learning Gaps Identified'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 mb-6">
            {testData?.title} • Standardized across Easy, Medium, Hard, and Very Hard questions.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-cyan-400">{testScore.percentage}%</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Correct</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{testScore.correct} / {testScore.total}</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Status</span>
              <span className="text-3xl font-extrabold text-emerald-600">{testScore.percentage >= 70 ? 'PASS' : 'RETRY'}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/report?subject=Math')}
            >
              View Official Growth Certificate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/select')}
            >
              Back to Subject Portals
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE QUESTION-BY-QUESTION REVIEW TABS */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Detailed Solutions & Concept Explanations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any question below to inspect step-by-step solved methodology, pedagogical rules, and Socratic AI guidance.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-100 dark:border-slate-700">
              4-Tier Difficulty Graded
            </span>
          </div>

          {/* Question Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {questions.map((q, idx) => {
              const qSelected = selectedAnswers[q.id];
              const qCorrect = qSelected === q.correctIndex;
              const isCurrent = reviewQuestionIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setReviewQuestionIdx(idx);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shrink-0 ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-slate-800 text-indigo-900 dark:text-cyan-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {qCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({q.difficulty.toUpperCase().replace('_', ' ')})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Question Display Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400">
                  Question #{reviewQuestionIdx + 1} • {currentReviewQ.topic}
                </span>
                <SpeechButton 
                  text={`Review Question ${reviewQuestionIdx + 1}. ${currentReviewQ.questionText}. Correct answer: ${currentReviewQ.options[currentReviewQ.correctIndex]}. Explanation: ${currentReviewQ.explanation || ''}`}
                  label="Listen to solution"
                />
              </div>
              <DifficultyBadge difficulty={currentReviewQ.difficulty} showLevel />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              <MathRenderer content={currentReviewQ.questionText} />
            </h3>

            {/* Answer Comparison Chip */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                isCorrect 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}>
                {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Your Answer: {userSelectedIdx !== undefined ? currentReviewQ.options[userSelectedIdx] : 'None'}
              </span>

              {!isCorrect && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                  Correct Answer: {currentReviewQ.options[currentReviewQ.correctIndex]}
                </span>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* THE 2 SUB-TABS: Solved Steps | Concept Explanation */}
          {/* =================================================================== */}
          <div className="space-y-4 pt-2">
            
            {/* Tab Selector Bar */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
              <button
                onClick={() => setReviewActiveTab('steps')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  reviewActiveTab === 'steps'
                    ? 'border-[var(--theme-primary,#4F46E5)] text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Solved Step-by-Step ({currentReviewQ.steps?.length || 3} Steps)</span>
              </button>

              <button
                onClick={() => setReviewActiveTab('explanation')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  reviewActiveTab === 'explanation'
                    ? 'border-[var(--theme-primary,#4F46E5)] text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>2. Concept & Misconception Notes</span>
              </button>
            </div>

            {/* TAB 1: SOLVED STEPS */}
            {reviewActiveTab === 'steps' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2">
                {currentReviewQ.steps ? (
                  currentReviewQ.steps.map((s, sIdx) => (
                    <div key={sIdx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-l-[var(--theme-primary,#4F46E5)] border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                      <span className="font-bold text-xs text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400 block">
                        {s.step}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
                        {s.desc}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {currentReviewQ.explanation}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: CONCEPT EXPLANATION & MISCONCEPTIONS */}
            {reviewActiveTab === 'explanation' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400" />
                    <span>Underlying Core Theorem / Pedagogical Concept</span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
                    {currentReviewQ.conceptSummary || currentReviewQ.explanation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold block">💡 Common Misconception Avoidance:</span>
                  <p className="leading-relaxed">
                    Students commonly confuse adding numerators with cross-multiplying denominators. Remember to always reduce to the Least Common Denominator (LCD) before summing.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Socratic AI Tutor Prompt Link (Always Available in Review) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-cyan-50/80 dark:from-slate-800 dark:to-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Still confused about this problem?</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Our context-aware Socratic AI Tutor can walk you through an everyday analogy or similar practice question.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/tutor?topic=${encodeURIComponent(currentReviewQ.topic)}&problem=${encodeURIComponent(currentReviewQ.questionText)}`)}
              >
                Discuss with AI Tutor →
              </Button>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 3: TIMED TEST HUB & CATALOG
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Standardized Timed Assessments
            </h1>
            <Badge variant="warning" size="sm">4-Tier Levels</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Formal evaluations across Easy, Medium, Hard, and Very Hard tiers to measure pre/post growth deltas.
          </p>
        </div>

        {role === 'teacher' && (
          <Button
            onClick={() => setAssignModalOpen(true)}
            variant="primary"
            size="sm"
            icon={PlusCircle}
          >
            Create Timed Test
          </Button>
        )}
      </div>

      {/* Tests Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testsList.map((test) => (
          <Card key={test.id} hoverEffect className="p-6 sm:p-8 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={test.subject === 'Math' ? 'primary' : 'success'} size="sm">
                  {test.subject} Assessment
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {test.durationMinutes} Mins
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{test.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{test.description}</p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Questions Graded:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{test.questions?.length || 4} Questions (L1 - L4)</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned By:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{test.assignedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Status:</span>
                  <span className="font-bold text-amber-600">{test.dueDate}</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate(`/test?id=${test.id}`)}
              iconRight={ArrowRight}
            >
              Start 4-Tier Assessment →
            </Button>
          </Card>
        ))}
      </div>

      {/* Teacher Assign Assessment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Create & Assign Timed Assessment"
        subtitle="Provision a standardized 4-tier evaluation for your cohort."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!assignForm.title.trim()) return;
            const newTest = {
              id: `test_${Date.now()}`,
              title: assignForm.title.trim(),
              subject: assignForm.subject,
              description: `Teacher-assigned ${assignForm.subject} standardized benchmark test for cohort ${assignForm.classId}.`,
              assignedBy: user?.name || user?.fullName || 'Teacher',
              classId: assignForm.classId,
              questionCount: 4,
              durationMinutes: Number(assignForm.duration) || 15,
              dueDate: assignForm.dueDate || 'Next Class',
              status: 'active',
              questions: MOCK_TESTS[0].questions
            };
            setTestsList(prev => [newTest, ...prev]);
            setAssignModalOpen(false);
            setAssignForm({
              title: '',
              subject: 'Math',
              classId: 'MATH-7B',
              duration: 15,
              dueDate: '2026-09-28'
            });
          }}
          className="space-y-4 my-2"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assessment Title
            </label>
            <input
              type="text"
              required
              value={assignForm.title}
              onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
              placeholder="e.g. Unit 3 Diagnostic: Linear Equations"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Subject
              </label>
              <select
                value={assignForm.subject}
                onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Math">Math</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Cohort / Class
              </label>
              <select
                value={assignForm.classId}
                onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MOCK_CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={assignForm.duration}
                onChange={(e) => setAssignForm({ ...assignForm, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Assign to Cohort
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
