import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Zap,
  Maximize2,
  Lock,
  ShieldCheck
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

  // Helper: Retrieve client-persisted teacher assessments from localStorage
  const getStoredCustomAssessments = () => {
    try {
      const raw = localStorage.getItem('adaptiq_custom_assessments');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  };

  const normalizeCategory = (assessmentType, category) => {
    if (assessmentType === 'PRE_TEST' || assessmentType === 'POST_TEST') return 'Diagnostic Assessments';
    if (assessmentType === 'PRACTICE') return 'Topic Quizzes';
    if (assessmentType === 'FORMATIVE_TEST') return 'Chapter Assessments';
    if (category) return category;
    return 'Classroom Assessments';
  };

  // Test catalog state - initialized with locally created teacher assessments + standard catalogue
  const [testsList, setTestsList] = useState(() => {
    const custom = getStoredCustomAssessments();
    if (custom.length > 0) {
      const customIds = new Set(custom.map(c => c.id));
      return [...custom, ...MOCK_TESTS.filter(t => !customIds.has(t.id))];
    }
    return MOCK_TESTS;
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Test State
  const activeTestId = searchParams.get('id');
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testScore, setTestScore] = useState(null);

  // Proctoring & Anti-Cheat State
  const [testStarted, setTestStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState('');
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastViolationTimeRef = useRef(0);

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

  // Fetch dynamically published teacher assessments from backend
  useEffect(() => {
    let isMounted = true;
    const fetchPublishedAssessments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/assessments', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.assessments) && data.assessments.length > 0) {
          const apiTests = data.assessments
            .filter(a => a.status !== 'DRAFT')
            .map(a => ({
              id: a.id,
              title: a.title,
              subject: a.subject || 'Mathematics',
              gradeLevel: a.gradeLevel || 7,
              durationMinutes: a.durationMinutes || 20,
              questionCount: a.questions?.length || a.questionCount || a.questionIds?.length || 10,
              totalMarks: a.totalMarks || a.maxScore || 100,
              category: normalizeCategory(a.assessmentType, a.category),
              type: a.assessmentType === 'PRE_TEST' || a.assessmentType === 'POST_TEST' ? 'Diagnostic' : (a.type || 'Summative'),
              instructions: a.instructions || 'Standard school assessment.',
              questions: a.questions || (a.items ? a.items.map(item => item.question) : []),
              isLive: Boolean(a.isLive),
              isFeatured: Boolean(a.isLive || a.assessmentType === 'PRE_TEST'),
              status: a.status || 'PUBLISHED',
              assignedBy: a.teacherName || 'Mrs. Ananya Sharma'
            }));

          setTestsList(prev => {
            const custom = getStoredCustomAssessments();
            const mergedMap = new Map();
            custom.forEach(t => mergedMap.set(t.id, t));
            apiTests.forEach(t => {
              if (mergedMap.has(t.id)) {
                const existing = mergedMap.get(t.id);
                mergedMap.set(t.id, {
                  ...t,
                  questions: (existing.questions && existing.questions.length > 0) ? existing.questions : t.questions
                });
              } else {
                mergedMap.set(t.id, t);
              }
            });
            prev.forEach(t => {
              if (!mergedMap.has(t.id)) mergedMap.set(t.id, t);
            });
            return Array.from(mergedMap.values());
          });
        }
      } catch (err) {
        console.warn('[TestMode] Error fetching dynamic assessments:', err);
      }
    };

    fetchPublishedAssessments();
    return () => { isMounted = false; };
  }, []);

  // Real-time synchronization across browser tabs for teacher-authored assessments
  useEffect(() => {
    const handleStorageChange = () => {
      const custom = getStoredCustomAssessments();
      if (custom.length > 0) {
        setTestsList(prev => {
          const customMap = new Map(custom.map(c => [c.id, c]));
          const remaining = prev.filter(t => !customMap.has(t.id));
          return [...custom, ...remaining];
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Only launch test execution when a test id is specified (e.g. /test?id=...)
    if (activeTestId) {
      const found = testsList.find((t) => t.id === activeTestId);
      if (found) {
        // Guarantee deduplicated non-repeating questions
        const seenQKeys = new Set();
        const uniqueQList = (found.questions || []).filter(q => {
          const key = String(q.id || q._id || q.questionText || '');
          if (!key || seenQKeys.has(key)) return false;
          seenQKeys.add(key);
          return true;
        });

        setTestData({
          ...found,
          questions: uniqueQList
        });
        const savedAnswers = JSON.parse(localStorage.getItem(`adaptiq_test_answers_${found.id}`) || '{}');
        setSelectedAnswers(savedAnswers);
        setSecondsRemaining((found.durationMinutes || 20) * 60);
        setCurrentQuestionIndex(0);
        setTestCompleted(false);
        setTestScore(null);
        setTestStarted(false);
        setViolationCount(0);
        setViolationModalOpen(false);
        setLastViolationReason('');
        setIsAutoSubmitted(false);
        isSubmittingRef.current = false;
      } else {
        // Fetch single assessment by id from backend
        fetch(`/api/assessments/${activeTestId}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.assessment) {
              const a = data.assessment;
              const rawQuestions = a.questions || (a.items ? a.items.map(item => item.question) : []);
              const seenQKeys = new Set();
              const uniqueQuestions = rawQuestions.filter(q => {
                const key = String(q.id || q._id || q.questionText || '');
                if (!key || seenQKeys.has(key)) return false;
                seenQKeys.add(key);
                return true;
              });

              const formatted = {
                id: a.id,
                title: a.title,
                subject: a.subject || 'Mathematics',
                gradeLevel: a.gradeLevel || 7,
                durationMinutes: a.durationMinutes || 20,
                questionCount: uniqueQuestions.length || a.questionCount || 10,
                totalMarks: a.totalMarks || a.maxScore || 100,
                category: a.assessmentType || 'Classroom Assessment',
                type: a.assessmentType || 'Summative',
                instructions: a.instructions || 'Standard school assessment.',
                questions: uniqueQuestions,
                isLive: Boolean(a.isLive),
                status: a.status || 'PUBLISHED',
                assignedBy: a.teacherName || 'Mrs. Ananya Sharma'
              };
              setTestData(formatted);
              setSecondsRemaining((formatted.durationMinutes || 20) * 60);
              setCurrentQuestionIndex(0);
              setTestCompleted(false);
              setTestScore(null);
              setTestStarted(false);
            }
          })
          .catch(() => { });
      }
    } else {
      setTestData(null);
      setTestCompleted(false);
      setTestScore(null);
      setTestStarted(false);
      setViolationCount(0);
      setViolationModalOpen(false);
      setLastViolationReason('');
      setIsAutoSubmitted(false);
      isSubmittingRef.current = false;
    }
  }, [activeTestId, testsList]);

  // Countdown Timer
  useEffect(() => {
    if (activeTestId && testData && testStarted && !testCompleted && secondsRemaining > 0) {
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
  }, [activeTestId, testData, testStarted, testCompleted, secondsRemaining]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    const updated = {
      ...selectedAnswers,
      [qId]: optionIdx
    };
    setSelectedAnswers(updated);
    if (testData?.id) {
      try {
        localStorage.setItem(`adaptiq_test_answers_${testData.id}`, JSON.stringify(updated));
      } catch (_) { }
    }
  };

  const handleStartExam = async () => {
    try {
      if (typeof document !== 'undefined' && document.documentElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
    }
    setTestStarted(true);
    isSubmittingRef.current = false;
  };

  const handleResumeFullscreen = async () => {
    try {
      if (typeof document !== 'undefined' && document.documentElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Fullscreen resume error:', err);
    }
    setViolationModalOpen(false);
  };

  const handleAutoSubmit = async (violations, reason) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsAutoSubmitted(true);
    setViolationModalOpen(false);

    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (_) { }
    }

    await calculateScore({
      autoSubmitted: true,
      violationCount: violations,
      violationReason: reason
    });
  };

  const calculateScore = async (submissionMeta = {}) => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (_) { }
    }

    const questions = testData?.questions || testsList[0]?.questions || [];
    let correct = 0;
    const avgTimePerQuestion = Math.max(
      5,
      Math.round(((testData?.durationMinutes || 20) * 60 - secondsRemaining) / (questions.length || 1))
    );

    const topicStats = {};
    questions.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correctAnswerIndex;
      const isCorrect = selectedIdx !== undefined && Number(selectedIdx) === Number(correctIdx);
      if (isCorrect) correct++;

      const t = q.topic || 'General Mathematics';
      if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
      topicStats[t].total++;
      if (isCorrect) topicStats[t].correct++;

      if (selectedIdx !== undefined) {
        recordAttempt({
          questionId: q.id,
          selectedAnswerIndex: selectedIdx,
          isCorrect,
          correctIndex: correctIdx,
          subject: testData?.subject || 'Mathematics',
          topic: q.topic || 'Assessment',
          difficulty: q.difficulty || 'medium',
          timeSpentSeconds: avgTimePerQuestion
        }).catch(() => { });
      }
    });

    // Identify weak topic (lowest accuracy)
    let weakestTopic = 'Fractions & Decimals';
    let lowestAcc = 1.0;
    Object.entries(topicStats).forEach(([top, stats]) => {
      const acc = stats.total > 0 ? (stats.correct / stats.total) : 0;
      if (acc < lowestAcc) {
        lowestAcc = acc;
        weakestTopic = top;
      }
    });

    const weakTopicsList = Object.entries(topicStats)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.70)
      .map(([top]) => top);

    const percentage = Math.round((correct / (questions.length || 1)) * 100);
    const scoreResult = {
      correct,
      total: questions.length,
      percentage,
      weakTopic: weakestTopic,
      weakTopics: weakTopicsList.length > 0 ? weakTopicsList : [weakestTopic],
      reason: `Your diagnostic results show that ${weakestTopic} needs more practice. Let's begin with foundational questions.`,
      autoSubmitted: Boolean(submissionMeta?.autoSubmitted),
      violationCount: submissionMeta?.violationCount || 0,
      violationReason: submissionMeta?.violationReason || null
    };

    setTestScore(scoreResult);
    setTestCompleted(true);
    setConfirmModalOpen(false);
    setViolationModalOpen(false);
    setReviewQuestionIdx(0);

    // Clear local cache for completed test
    if (testData?.id) {
      try {
        localStorage.removeItem(`adaptiq_test_answers_${testData.id}`);
      } catch (_) { }
    }

    // Submit attempt to server
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/assessments/${testData?.id || 'gps-g7-math-diag-2026'}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studentId: user?.id || user?._id || 'stu-g7-001',
          studentName: user?.name || user?.fullName || 'Aarav Patel',
          rollNumber: user?.rollNumber || 'GPS-07-001',
          answers: selectedAnswers,
          score: correct,
          maxScore: questions.length,
          scorePercentage: percentage,
          weakTopic: weakestTopic,
          weakTopics: weakTopicsList,
          autoSubmitted: Boolean(submissionMeta?.autoSubmitted),
          violationCount: submissionMeta?.violationCount || 0,
          violationReason: submissionMeta?.violationReason || null
        })
      });
    } catch (err) {
      console.warn('Assessment submit server notification warning:', err);
    }

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && percentage >= 70 && !submissionMeta?.autoSubmitted) {
      confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
    }
  };

  // Proctoring & Anti-Cheat Enforcement Listeners
  useEffect(() => {
    if (!activeTestId || !testData || !testStarted || testCompleted) return;

    const triggerViolation = (reason) => {
      if (isSubmittingRef.current || testCompleted) return;
      const now = Date.now();
      // Debounce by 1500ms to prevent double strikes from simultaneous events (blur + visibilitychange)
      if (now - lastViolationTimeRef.current < 1500) return;
      lastViolationTimeRef.current = now;

      setViolationCount((prev) => {
        const next = prev + 1;
        setLastViolationReason(reason);

        if (next >= 3) {
          handleAutoSubmit(3, reason);
          return 3;
        } else {
          setViolationModalOpen(true);
          return next;
        }
      });
    };

    // 1. Tab switch or window minimize
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Browser tab switched or window minimized');
      }
    };

    // 2. Application switch / window blur
    const handleWindowBlur = () => {
      if (!isSubmittingRef.current) {
        triggerViolation('Application switch or window focus lost');
      }
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      const isFS = Boolean(document.fullscreenElement);
      setIsFullscreen(isFS);
      if (!isFS && !isSubmittingRef.current) {
        triggerViolation('Exited full-screen examination mode');
      }
    };

    // 4. Block context menu, cut/copy/paste
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();

    // 5. Block devtools & inspector key combinations
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        triggerViolation('Restricted developer shortcut attempted');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTestId, testData, testStarted, testCompleted]);

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
    isDisabled: !testData || !testStarted || testCompleted || confirmModalOpen || violationModalOpen
  });

  // =========================================================================
  // VIEW 0: PRE-FLIGHT INSTITUTIONAL PROCTORING TERMINAL & FULLSCREEN LAUNCH
  // =========================================================================
  if (testData && !testCompleted && !testStarted) {
    const questions = testData.questions || MOCK_TESTS[0].questions;
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8">
        {/* Top Institutional Header */}
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-glow-primary">
              GPS
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                Greenwood Public School, Gurugram
              </h1>
              <p className="text-[11px] font-mono text-cyan-300">
                CBSE Affiliation No. 530649 • Digital Examination Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Proctored CBT Mode
            </span>
          </div>
        </div>

        {/* Center Terminal Box */}
        <div className="max-w-2xl mx-auto w-full my-6 bg-slate-950/80 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-elevated space-y-6">
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
              CBSE Class VII • Standardized Academic Evaluation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {testData.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
              {testData.description || 'Institutional baseline diagnostic evaluation.'}
            </p>
          </div>

          {/* Candidate & Paper Verification Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Candidate</span>
              <span className="font-bold text-white truncate block">{user?.name || user?.fullName || 'Aarav Patel'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Roll Number</span>
              <span className="font-bold text-cyan-300 font-mono block">{user?.rollNumber || 'GPS-07-001'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Duration</span>
              <span className="font-bold text-amber-400 font-mono block">{testData.durationMinutes || 20} Minutes</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Questions</span>
              <span className="font-bold text-emerald-400 font-mono block">{questions.length} Items</span>
            </div>
          </div>

          {/* Mandatory Anti-Cheat & Examination Protocol */}
          <div className="space-y-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Mandatory Anti-Cheat & Examination Protocol</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span><strong>Exclusive Fullscreen Mode:</strong> Starting the test locks your screen into fullscreen. Exiting fullscreen is recorded as an infraction.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span><strong>Zero-Tolerance Window Switching:</strong> Navigating away from this tab, opening other applications, or minimizing the browser immediately registers a violation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span><strong className="text-rose-300">3-Strike Auto-Submission:</strong> You receive a maximum of 2 warnings. On the <span className="underline decoration-rose-500 font-bold">3rd violation</span>, your exam will automatically submit and lock.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                <span><strong>Clipboard & Inspection Guard:</strong> Right-click, copy-paste, and developer shortcuts are locked during this test.</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <Button
              variant="glow"
              size="lg"
              fullWidth
              onClick={handleStartExam}
              className="py-4 text-sm font-black tracking-wide"
            >
              Begin Proctored Examination (Enter Fullscreen) ▶
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/test')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Assessment Catalog
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto w-full text-center text-[11px] text-slate-500 border-t border-slate-800 pt-3">
          Greenwood Public School, Sector-9, Gurugram • Institutional CBT Security Engine • Zero External APIs
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: ACTIVE TIMED TEST EXECUTION SCREEN
  // ==========================================
  if (testData && !testCompleted && testStarted) {
    const questions = testData.questions || MOCK_TESTS[0].questions;
    const currentQ = questions[currentQuestionIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 pb-16 transition-colors select-none">
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

            {/* Right side controls: Proctoring Status & Countdown Clock */}
            <div className="flex items-center gap-3">
              {/* Proctoring Status Pill */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${violationCount === 0
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/60'
                  : violationCount === 1
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse'
                    : 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                }`}>
                {violationCount === 0 ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {violationCount === 0
                    ? 'Proctoring Secure • 0/3 Strikes'
                    : `⚠️ Strike ${violationCount}/3 (${violationCount === 2 ? 'FINAL WARNING' : 'Warning'})`}
                </span>
              </div>

              {/* Countdown Clock Display */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border ${secondsRemaining < 180
                  ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-slate-800 text-white border-slate-700'
                }`}>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatCountdown(secondsRemaining)}</span>
              </div>
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
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-base sm:text-lg min-h-[58px] ${isSelected
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

        {/* Anti-Cheat Proctoring Violation Warning Modal (Strikes 1 & 2) */}
        {violationModalOpen && violationCount < 3 && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-500 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Academic Integrity Monitor
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {violationCount === 1 ? 'Proctoring Warning (1 of 3)' : 'CRITICAL FINAL WARNING (2 of 3)'}
                  </h3>
                </div>
              </div>

              {/* Strike Visual Indicator */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl text-center text-xs font-bold bg-rose-500 text-white shadow">
                  Strike 1 ⚠️
                </div>
                <div className={`p-2 rounded-xl text-center text-xs font-bold ${violationCount >= 2 ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                  Strike 2 🚨
                </div>
                <div className="p-2 rounded-xl text-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                  Strike 3 🛑 Auto-Submit
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                <p className="font-bold">Incident Detected: {lastViolationReason}</p>
                <p className="text-[11px] leading-relaxed">
                  {violationCount === 1
                    ? 'Leaving the examination window or exiting full-screen mode is strictly recorded by the assessment server. Please return to fullscreen immediately.'
                    : 'You have committed 2 out of 3 allowed infractions. Any further attempt to switch tabs, minimize the window, or lose focus will IMMEDIATELY auto-submit your exam.'}
                </p>
              </div>

              <Button
                variant="glow"
                fullWidth
                size="lg"
                onClick={handleResumeFullscreen}
              >
                Return to Fullscreen & Resume Assessment ▶
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: POST-TEST RESULTS & COMPREHENSIVE SOLVED ANSWERS / EXPLANATION
  // =========================================================================
  if (testCompleted && testScore) {
    const questions = testData?.questions || MOCK_TESTS[0].questions;
    const currentReviewQ = questions[reviewQuestionIdx] || questions[0];
    const userSelectedIdx = selectedAnswers[currentReviewQ.id];
    const isCorrect = userSelectedIdx === currentReviewQ.correctIndex;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">

        {/* Academic Integrity Infraction Alert (If auto-submitted due to 3 violations) */}
        {testScore.autoSubmitted && (
          <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 border-2 border-rose-500 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                  Academic Integrity Monitor • System Auto-Submission
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Examination Terminated on 3rd Proctoring Violation
                </h3>
              </div>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              This examination was forcibly sealed and auto-submitted after 3 consecutive proctoring infractions ({testScore.violationReason || 'Excessive Window/Tab Switching'}). Answers completed up to the moment of termination have been sealed and forwarded for administrative evaluation.
            </p>
          </div>
        )}

        {/* Top Score Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-glow-primary">
            🎓
          </div>
          <Badge variant={testScore.autoSubmitted ? "danger" : "primary"} size="md" className="mb-2">
            {testScore.autoSubmitted ? 'Auto-Submitted • Proctoring Lock' : 'Official Timed Assessment Results'}
          </Badge>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {testScore.autoSubmitted
              ? 'Assessment Locked & Auto-Submitted'
              : testScore.percentage >= 70
                ? 'Proficiency Milestone Achieved!'
                : 'Assessment Complete - Learning Gaps Identified'}
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
            <div className={`p-4 rounded-2xl border ${testScore.autoSubmitted
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600'
              }`}>
              <span className="text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xl sm:text-2xl font-extrabold">
                {testScore.autoSubmitted ? 'VIOLATION' : testScore.percentage >= 70 ? 'PASS' : 'RETRY'}
              </span>
            </div>
          </div>

          {/* Diagnostic Weakness & Adaptive Practice Remediation Banner */}
          {testScore.weakTopic && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/40 text-left space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Targeted Learning Gap Identified: {testScore.weakTopic}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                "{testScore.reason || `Your diagnostic results show that ${testScore.weakTopic} needs more practice. Let's begin with foundational questions.`}"
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Adaptive practice calibrated with 10 questions adjusting in difficulty.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate(`/practice?subject=Mathematics&topic=${encodeURIComponent(testScore.weakTopic)}&autostart=true&reason=${encodeURIComponent(testScore.reason)}`)}
                  className="font-extrabold text-xs shadow-md"
                >
                  Launch Adaptive Practice ({testScore.weakTopic}) →
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {testScore.weakTopic && (
              <Button
                variant="primary"
                size="sm"
                icon={Zap}
                onClick={() => navigate(`/practice?subject=Mathematics&topic=${encodeURIComponent(testScore.weakTopic)}&autostart=true&reason=${encodeURIComponent(testScore.reason)}`)}
                className="font-bold text-xs"
              >
                Start Adaptive Practice ({testScore.weakTopic})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/report?subject=Math')}
            >
              View Official Growth Certificate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
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
                Select any question below to inspect step-by-step solved methodology, pedagogical rules, and conceptual breakdown.
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
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shrink-0 ${isCurrent
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
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${isCorrect
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
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${reviewActiveTab === 'steps'
                    ? 'border-[var(--theme-primary,#173E2B)] text-[var(--theme-primary,#173E2B)] dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Solved Step-by-Step ({currentReviewQ.steps?.length || 3} Steps)</span>
              </button>

              <button
                onClick={() => setReviewActiveTab('explanation')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${reviewActiveTab === 'explanation'
                    ? 'border-[var(--theme-primary,#173E2B)] text-[var(--theme-primary,#173E2B)] dark:text-emerald-400'
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
                    <div key={sIdx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-l-[var(--theme-primary,#173E2B)] border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                      <span className="font-bold text-xs text-[var(--theme-primary,#173E2B)] dark:text-emerald-400 block">
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
                    <Sparkles className="w-4 h-4 text-[var(--theme-primary,#173E2B)] dark:text-emerald-400" />
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

            {/* Targeted Practice on This Topic */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-cyan-50/80 dark:from-slate-800 dark:to-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Strengthen Concept Mastery in {currentReviewQ.topic}</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Launch a 10-question adaptive practice session calibrated to your current performance.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/practice?subject=Mathematics&topic=${encodeURIComponent(currentReviewQ.topic)}&autostart=true`)}
              >
                Practice This Topic →
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
  const CATEGORIES = [
    'All',
    'Classroom Assessments',
    'Diagnostic Assessments',
    'Chapter Assessments',
    'Topic Quizzes',
    'Periodic Assessments',
    'Half-Yearly Examinations',
    'Annual Examinations',
    'Adaptive Tests',
    'Olympiad / Competitive Prep',
    'Board / Pre-Board Mock Exams'
  ];

  const studentGrade = user?.gradeLevel || user?.grade || 7;

  const filteredTests = testsList.filter((t) => {
    // Lock tests to student's enrolled grade (allow teacher-created custom assessments and matching grades)
    if (role === 'student' && t.gradeLevel && parseInt(t.gradeLevel, 10) !== parseInt(studentGrade, 10) && !t.isCustom && !t.id?.startsWith('custom-') && !t.id?.startsWith('asm-')) {
      return false;
    }
    const matchesCategory =
      selectedCategory === 'All' ||
      t.category === selectedCategory ||
      (selectedCategory === 'Classroom Assessments' && (t.isCustom || t.assignedBy?.includes('Sharma') || t.status === 'PUBLISHED')) ||
      (selectedCategory === 'Diagnostic Assessments' && (t.type === 'Diagnostic' || t.category?.includes('Diagnostic') || t.assessmentType === 'PRE_TEST' || t.assessmentType === 'POST_TEST')) ||
      (selectedCategory === 'Chapter Assessments' && (t.category?.includes('Chapter') || t.assessmentType === 'FORMATIVE_TEST')) ||
      (selectedCategory === 'Topic Quizzes' && (t.category?.includes('Topic') || t.assessmentType === 'PRACTICE'));

    const matchesSubject = selectedSubject === 'All' || (t.subject || '').includes(selectedSubject);
    const textTarget = `${t.title} ${t.description || ''} ${t.subject || ''} ${t.assignedBy || ''}`.toLowerCase();
    const matchesSearch = textTarget.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubject && matchesSearch;
  });

  const featuredTest = testsList.find(t => t.gradeLevel === studentGrade && t.isFeatured)
    || testsList.find(t => t.gradeLevel === studentGrade)
    || testsList.find(t => t.id === 'gps-g7-diagnostic-pre')
    || testsList[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              School Assessment Centre
            </h1>
            <Badge variant="primary" size="sm">
              {role === 'student' ? `Class ${studentGrade} Catalog` : '9 Test Catalogs'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized evaluations for Greenwood Public School across Diagnostic, Chapter, Periodic, Board Mocks, and Olympiad tiers.
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

      {/* Featured Institutional Assessment: Dynamically adapted to current grade */}
      {featuredTest && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated border-2 border-indigo-500/40 relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 text-cyan-300 border border-indigo-400/40">
                Institutional Demonstration Feature
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/20">
                CBSE 2026–2027 • Class {featuredTest.gradeLevel === 3 ? 'III (Primary)' : featuredTest.gradeLevel === 7 ? 'VII (Middle)' : featuredTest.gradeLevel === 10 ? 'X (Secondary)' : featuredTest.gradeLevel || 'VII'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-cyan-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {featuredTest.durationMinutes || 25} Minutes
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {featuredTest.questions?.length || 12} Balanced Questions
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {featuredTest.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {featuredTest.description}
            </p>
          </div>

          {/* Competencies Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-indigo-300 font-bold block">
                {featuredTest.gradeLevel === 3 ? '📚 Primary Literacy & Numeracy' : '📐 Mathematics Competencies'}
              </span>
              <span className="text-slate-300">
                {featuredTest.gradeLevel === 3 ? 'Arithmetic, shapes, sight words, grammar' : 'Integers, Fractions, Angles, Algebra, Ratios'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-cyan-300 font-bold block">
                {featuredTest.gradeLevel === 3 ? '🌿 Environmental Awareness' : '🔬 Science Competencies'}
              </span>
              <span className="text-slate-300">
                {featuredTest.gradeLevel === 3 ? 'Living things, habitats, seasons, plants' : 'Plants, Heat, Acids, Motion, Current, Light'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-amber-300 font-bold block">⚡ 3 Difficulty Tiers</span>
              <span className="text-slate-300">Easy (4), Medium (4), Hard (4)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-emerald-300 font-bold block">📈 Real-Time Calibration</span>
              <span className="text-slate-300">Rasch Ability & BKT Mastery Profiling</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-300">
              Assigned By: <strong>{featuredTest.assignedBy}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="glow"
                size="md"
                onClick={() => navigate(`/test?id=${featuredTest.id}`)}
                iconRight={ArrowRight}
              >
                Launch Class {featuredTest.gradeLevel || 7} Assessment →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Category Filters */}
      <div className="space-y-4">
        {/* Search & Subject Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search assessment title, topic, or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {['All', 'Math', 'Science', 'STEM'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSubject === subj
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-subtle'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tests Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} hoverEffect className="p-6 sm:p-7 flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={test.subject?.includes('Math') ? 'primary' : 'success'} size="sm">
                    {test.subject}
                  </Badge>
                  {test.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {test.type || test.category}
                    </span>
                  )}
                  {test.isCustom && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      ★ Assigned by Teacher
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {test.durationMinutes} Mins
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">{test.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{test.description}</p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Questions Graded:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{test.questions?.length || test.questionCount || 10} Questions</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned By:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{test.assignedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status / Schedule:</span>
                  <span className="font-bold text-amber-600">{test.dueDate}</span>
                </div>
              </div>
            </div>

            <Button
              variant={test.isFeatured ? "glow" : "primary"}
              size="md"
              fullWidth
              onClick={() => navigate(`/test?id=${test.id}`)}
              iconRight={ArrowRight}
            >
              Start Assessment →
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
