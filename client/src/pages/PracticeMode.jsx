import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  RotateCcw,
  Trophy,
  Brain,
  Award,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MathRenderer } from '../components/ui/MathRenderer';
import { STEMDiagram } from '../components/ui/STEMDiagram';
import { QuizRibbon } from '../components/QuizRibbon';
import { SpeechButton } from '../components/ui/SpeechButton';
import { useAssessmentKeyboardShortcuts } from '../hooks/useAssessmentKeyboardShortcuts';
import { MOCK_QUESTIONS_POOL } from '../services/mockData';
import { getAdaptiveQuestion, submitQuizAnswers, getQuestions } from '../services/quizService';
import { recordAttempt } from '../services/progressService';
import { saveOfflineAttempt, syncPendingAttempts } from '../services/offlineStorage';
import api from '../services/api';

export const PracticeMode = () => {
  const { user } = useContext(AuthContext);
  const { currentTheme } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subject = searchParams.get('subject') || 'Math';
  const topic = searchParams.get('topic') || (subject === 'Math' ? 'Fractions' : 'Photosynthesis');

  // Level configuration
  const LEVEL_CONFIG = {
    easy: { level: 1, name: "Level 1: Novice", tier: "Foundational", xpReward: 50, nextReq: 150 },
    medium: { level: 2, name: "Level 2: Apprentice", tier: "Procedural", xpReward: 75, nextReq: 300 },
    hard: { level: 3, name: "Level 3: Adept", tier: "Multi-Step", xpReward: 100, nextReq: 500 },
    very_hard: { level: 4, name: "Level 4: Master", tier: "Conceptual", xpReward: 150, nextReq: 800 }
  };

  const [questionsList, setQuestionsList] = useState(() => {
    return MOCK_QUESTIONS_POOL[topic] || (subject === 'Math' ? MOCK_QUESTIONS_POOL.Fractions : MOCK_QUESTIONS_POOL.Photosynthesis) || [];
  });

  // Fetch real questions from server if available
  useEffect(() => {
    getQuestions({ subject, topic }).then((res) => {
      if (res.success && res.questions && res.questions.length > 0) {
        setQuestionsList(res.questions);
      }
    }).catch(() => {});
  }, [subject, topic]);

  // State
  const [currentLevelKey, setCurrentLevelKey] = useState('medium'); // 'easy' | 'medium' | 'hard' | 'very_hard'
  const [currentXP, setCurrentXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [questionCount, setQuestionCount] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [confidence, setConfidence] = useState('somewhat_sure'); // 'guessing' | 'somewhat_sure' | 'very_sure'
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingAttempts(api).then(res => {
        if (res?.pending !== undefined) setPendingSyncCount(res.pending);
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch question matching current level
  const levelFiltered = questionsList.filter(q => q.difficulty === currentLevelKey);
  const currentQ = levelFiltered[(questionCount - 1) % (levelFiltered.length || 1)] || questionsList[0] || {
    questionText: "What is 1/3 + 1/6?",
    options: ["2/9", "1/2", "2/6", "3/6"],
    correctIndex: 1,
    correctAnswerIndex: 1,
    explanation: "Convert 1/3 to 2/6. 2/6 + 1/6 = 3/6 = 1/2."
  };

  const activeLevelData = LEVEL_CONFIG[currentLevelKey] || LEVEL_CONFIG.medium;

  const handleSelectOption = (idx) => {
    if (!isAnswerChecked) {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null) return;

    const correctIdx = currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 1;
    const isCorrect = selectedOption === correctIdx;
    setIsAnswerChecked(true);

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 1. Persist locally first (Phase 8.2 Offline Resilience)
    try {
      await saveOfflineAttempt({
        eventId,
        questionId: currentQ._id || `q_${questionCount}`,
        selectedAnswerIndex: selectedOption,
        confidence,
        mode: 'practice',
        subject,
        topic,
        difficulty: currentLevelKey,
        isCorrect,
        timeTaken: 15
      });
    } catch (e) {
      console.warn('Local offline save notice:', e);
    }

    // 2. Transmit to server if online
    if (isOnline && currentQ._id) {
      recordAttempt({
        eventId,
        questionId: currentQ._id,
        selectedAnswerIndex: selectedOption,
        confidence,
        mode: 'practice',
        subject,
        topic,
        difficulty: currentLevelKey,
        timeTaken: 15
      }).catch(() => {
        setPendingSyncCount(prev => prev + 1);
      });
    } else {
      setPendingSyncCount(prev => prev + 1);
    }

    const xpEarned = isCorrect ? activeLevelData.xpReward * streakMultiplier : 0;
    const newXP = currentXP + xpEarned;
    setCurrentXP(newXP);

    setFeedback({
      isCorrect,
      explanation: currentQ.explanation,
      steps: currentQ.steps || [],
      conceptSummary: currentQ.conceptSummary || '',
      misconception: currentQ.misconception || '',
      xpEarned
    });

    const newHistory = [...sessionHistory, { qId: questionCount, isCorrect, level: currentLevelKey }];
    setSessionHistory(newHistory);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newMult = newStreak >= 3 ? 3 : (newStreak >= 2 ? 2 : 1);
      setStreakMultiplier(newMult);

      // Adaptive Level Up Threshold (3 streak promotes level)
      if (newStreak >= 3) {
        if (currentLevelKey === 'easy') {
          triggerLevelUp('medium');
        } else if (currentLevelKey === 'medium') {
          triggerLevelUp('hard');
        } else if (currentLevelKey === 'hard') {
          triggerLevelUp('very_hard');
        }
      }
    } else {
      setStreak(0);
      setStreakMultiplier(1);

      // Adaptive Level Down on repeated failure
      if (currentLevelKey === 'very_hard') {
        setCurrentLevelKey('hard');
      } else if (currentLevelKey === 'hard') {
        setCurrentLevelKey('medium');
      }
    }
  };

  const triggerLevelUp = (nextLevelKey) => {
    // Only celebrate on milestone level-up and respect reduced-motion
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }
    setCurrentLevelKey(nextLevelKey);
    setLevelUpModal(LEVEL_CONFIG[nextLevelKey]);
    setStreak(1);
    setStreakMultiplier(1);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setFeedback(null);
    setQuestionCount(prev => prev + 1);
  };

  // Phase 3: Keyboard-Driven Assessment Flow Hook
  useAssessmentKeyboardShortcuts({
    optionCount: currentQ?.options?.length || 4,
    selectedOption,
    onSelectOption: handleSelectOption,
    isAnswerChecked,
    onCheckAnswer: handleCheckAnswer,
    canCheckAnswer: selectedOption !== null && !isAnswerChecked,
    onNextQuestion: handleNextQuestion,
    canNextQuestion: isAnswerChecked
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Quiz Ribbon with connectivity and sync indicators */}
      <QuizRibbon 
        currentIndex={((questionCount - 1) % 10) + 1}
        totalQuestions={10}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        streakCount={streak}
        difficulty={currentLevelKey}
      />

      {/* ========================================================================= */}
      {/* 1. TOP LEVELING & XP HUD (Heads-Up Display) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Level Badge & Topic */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xl shadow-glow-primary">
              L{activeLevelData.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {activeLevelData.name}
                </h2>
                <DifficultyBadge difficulty={currentLevelKey} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Topic: {topic} ({subject})
              </span>
            </div>
          </div>

          {/* XP & Streak Multiplier Status */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Streak Multiplier */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${
              streakMultiplier >= 3 
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 animate-pulse' 
                : streakMultiplier === 2
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
            }`}>
              <Flame className="w-4 h-4 fill-current" />
              <span>{streakMultiplier}x XP Multiplier</span>
            </div>

            {/* Total XP Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>{currentXP} XP</span>
            </div>
          </div>

        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Level {activeLevelData.level} Mastery Progress</span>
            <span>XP to Next Milestone: {currentXP} / {activeLevelData.nextReq} XP</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentXP / activeLevelData.nextReq) * 100)}%` }}
            />
          </div>
        </div>

        {/* Manual Level Quick-Select Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Jump Level:
          </span>
          {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => {
            const isCurrent = currentLevelKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setCurrentLevelKey(key);
                  setSelectedOption(null);
                  setIsAnswerChecked(false);
                  setFeedback(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isCurrent 
                    ? 'bg-indigo-600 text-white shadow-subtle' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                L{cfg.level}: {cfg.tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. QUESTION CARD */}
      {/* ========================================================================= */}
      <Card className="p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-card">
        
        {/* Question Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span>Question #{questionCount}</span>
            <SpeechButton 
              text={`Question ${questionCount}. ${currentQ?.questionText || ''}. Options: ${(currentQ?.options || []).map((o, i) => `Option ${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`}
              label="Listen to question"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Difficulty Tier:</span>
            <DifficultyBadge difficulty={currentLevelKey} showLevel />
          </div>
        </div>

        {/* Question Text with KaTeX STEM Math Support */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-8">
          <MathRenderer content={currentQ.questionText} />
        </h3>

        {/* Optional STEM Diagram */}
        {currentQ.diagram && (
          <STEMDiagram 
            type={currentQ.diagram.type} 
            data={currentQ.diagram.data} 
            caption={currentQ.diagram.caption} 
          />
        )}

        {/* Options */}
        <div className="space-y-3">
          {(currentQ?.options || []).map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === (currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 1);
            
            let optionStyles = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';
            
            if (isAnswerChecked) {
              if (isCorrectOption) {
                optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrectOption) {
                optionStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-300 font-bold ring-2 ring-rose-500/20';
              } else {
                optionStyles = 'border-slate-200 dark:border-slate-800 opacity-50 text-slate-400';
              }
            } else if (isSelected) {
              optionStyles = 'border-indigo-600 dark:border-cyan-400 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-cyan-200 font-bold ring-2 ring-indigo-500/20';
            }

            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={!isAnswerChecked ? { scale: 1.01 } : {}}
                whileTap={!isAnswerChecked ? { scale: 0.98 } : {}}
                disabled={isAnswerChecked}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-base sm:text-lg min-h-[58px] ${optionStyles}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center font-bold text-sm shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>
                    <MathRenderer content={option} />
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-400 border border-slate-200 dark:border-slate-600">
                    {idx + 1}
                  </span>
                  {isAnswerChecked && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Confidence-Based Marking (Phase 6.2) */}
        {!isAnswerChecked && selectedOption !== null && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 animate-fadeIn">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              How confident are you in this answer?
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'guessing', label: '🤔 Just Guessing', desc: 'Isolates lucky guesses' },
                { key: 'somewhat_sure', label: '💡 Somewhat Sure', desc: 'Developing concept' },
                { key: 'very_sure', label: '🎯 Very Sure', desc: 'Solid certainty' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setConfidence(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    confidence === item.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. STEP-BY-STEP CONCEPTUAL FEEDBACK CARD (Revealed upon Check) */}
        {/* ========================================================================= */}
        {isAnswerChecked && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-5 rounded-2xl border ${
              feedback.isCorrect 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm flex items-center gap-2">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Correct! +{feedback.xpEarned} XP Earned
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Needs Focus: Learning Gap Identified
                    </>
                  )}
                </span>
                <SpeechButton 
                  text={`${feedback.isCorrect ? 'Correct!' : 'Incorrect.'} ${feedback.explanation}. ${feedback.misconception ? `Common pitfall: ${feedback.misconception}` : ''}`}
                  label="Listen to explanation"
                />
              </div>

              <button
                onClick={() => navigate(`/tutor?topic=${encodeURIComponent(topic)}&problem=${encodeURIComponent(currentQ.questionText)}`)}
                className="text-xs font-bold text-indigo-700 dark:text-cyan-400 underline flex items-center gap-1 hover:text-indigo-900"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Tutor Why →
              </button>
            </div>

            <div className="text-xs sm:text-sm leading-relaxed mt-2 text-slate-800 dark:text-slate-200">
              <strong className="block text-slate-900 dark:text-white mb-1">Pedagogical Explanation:</strong>
              <MathRenderer content={feedback.explanation} />
            </div>

            {feedback.steps && feedback.steps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Derivation Steps:
                </span>
                {feedback.steps.map((st, i) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{st.step}: </span>
                    <MathRenderer content={st.desc} />
                  </div>
                ))}
              </div>
            )}

            {feedback.misconception && (
              <div className="mt-2.5 p-2 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 text-xs text-amber-900 dark:text-amber-200">
                <strong>Pitfall Watch: </strong>
                <MathRenderer content={feedback.misconception} />
              </div>
            )}
          </motion.div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/select')}
          >
            Switch Subject
          </Button>

          {!isAnswerChecked ? (
            <Button
              variant="primary"
              size="lg"
              disabled={selectedOption === null}
              onClick={handleCheckAnswer}
            >
              Verify Answer & Gain XP
            </Button>
          ) : (
            <Button
              variant="glow"
              size="lg"
              onClick={handleNextQuestion}
              iconRight={ArrowRight}
            >
              Next Leveled Challenge →
            </Button>
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 4. LEVEL UP CELEBRATORY POPUP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {levelUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLevelUpModal(null)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-elevated border border-indigo-200 dark:border-indigo-800 z-10 space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto shadow-glow-primary">
                🔥
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                LEVEL UP UNLOCKED!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You've graduated to <strong>{levelUpModal.name}</strong> ({levelUpModal.tier})! Questions will now introduce multi-step problem solving.
              </p>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => setLevelUpModal(null)}
              >
                Continue to Level {levelUpModal.level} →
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
