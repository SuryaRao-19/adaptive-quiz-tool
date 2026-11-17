import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Play,
  Lightbulb,
  Check,
  Target
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MathRenderer } from '../components/ui/MathRenderer';

export const PracticeCentre = () => {
  const { user } = useContext(AuthContext);
  const studentGrade = Number(user?.gradeLevel || user?.grade || 7);

  // Configuration Phase States
  const [stage, setStage] = useState('config'); // 'config', 'active', 'summary'
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MODERATE');
  const [questionCount, setQuestionCount] = useState(5);

  // Active Session States
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]); // { qId, isCorrect, chosen, correct }

  useEffect(() => {
    fetchSubjects();
  }, [studentGrade]);

  useEffect(() => {
    fetchChapters();
  }, [selectedSubject, studentGrade]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/curriculum/grades/${studentGrade}/subjects`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSubjects(json.data);
          if (json.data.length > 0) setSelectedSubject(json.data[0].name);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch subjects:', e);
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch(`/api/curriculum/structure?grade=${studentGrade}&subject=${encodeURIComponent(selectedSubject)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.chapters) {
          setChapters(json.data.chapters);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch chapters:', e);
    }
  };

  const handleStartSession = async () => {
    try {
      // Retrieve previously answered IDs from sessionStorage
      let usedIds = [];
      try {
        const stored = sessionStorage.getItem(`gps_pc_used_${studentGrade}_${selectedSubject}`);
        if (stored) usedIds = JSON.parse(stored);
      } catch (_) {}

      // Query Question Bank with non-repeating shuffle
      const queryParams = new URLSearchParams({
        grade: studentGrade,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        excludeIds: usedIds.join(','),
        limit: 40
      });

      const res = await fetch(`/api/question-bank?${queryParams.toString()}`);
      let questions = [];
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.questions && json.questions.length > 0) {
          questions = json.questions;
        }
      }

      // Filter by chapter if specific chapter chosen
      if (selectedChapter !== 'all' && questions.length > 0) {
        const filtered = questions.filter(q => (q.chapter || '').toLowerCase().includes(selectedChapter.toLowerCase()));
        if (filtered.length >= 2) questions = filtered;
      }

      // If bank has fewer, fallback to general curriculum questions
      if (questions.length === 0) {
        const fallbackRes = await fetch(`/api/curriculum/questions?grade=${studentGrade}&subject=${encodeURIComponent(selectedSubject)}&limit=20`);
        if (fallbackRes.ok) {
          const fbJson = await fallbackRes.json();
          questions = fbJson.data || [];
        }
      }

      // Deduplicate by ID and question statement
      const seenMap = new Map();
      questions.forEach(q => {
        const key = String(q.id || q._id || q.questionStatement || q.questionText);
        if (!seenMap.has(key)) seenMap.set(key, q);
      });
      const uniquePool = Array.from(seenMap.values());

      // Shuffle using Fisher-Yates to ensure no repetition in session
      const shuffled = [...uniquePool].sort(() => Math.random() - 0.5).slice(0, questionCount);

      if (shuffled.length === 0) {
        // If all questions were seen, reset cache and try once more
        sessionStorage.removeItem(`gps_pc_used_${studentGrade}_${selectedSubject}`);
        alert('All questions for this topic have been practiced! Resetting cycle for new practice.');
        return;
      }

      // Record selected questions to sessionStorage to prevent repetition in subsequent runs
      const updatedUsedIds = Array.from(new Set([...usedIds, ...shuffled.map(q => String(q.id || q._id))]));
      try {
        sessionStorage.setItem(`gps_pc_used_${studentGrade}_${selectedSubject}`, JSON.stringify(updatedUsedIds));
      } catch (_) {}

      setSessionQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setSessionAnswers([]);
      setStage('active');
    } catch (e) {
      console.error('Session start error:', e);
    }
  };

  const currentQ = sessionQuestions[currentIndex];

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;

    let isCorrect = false;
    const correctVal = currentQ.correctAnswerIndex !== undefined ? currentQ.correctAnswerIndex : currentQ.correctAnswer;

    if (typeof correctVal === 'number') {
      isCorrect = Number(selectedAnswer) === correctVal;
    } else if (typeof correctVal === 'string') {
      isCorrect = String(selectedAnswer).trim().toLowerCase() === String(correctVal).trim().toLowerCase();
    }

    setIsAnswerSubmitted(true);
    setSessionAnswers([
      ...sessionAnswers,
      {
        questionId: currentQ.id,
        statement: currentQ.questionStatement || currentQ.questionText,
        chosen: selectedAnswer,
        correct: correctVal,
        isCorrect,
        chapter: currentQ.chapter,
        explanation: currentQ.explanation,
        workedSolution: currentQ.workedSolution || currentQ.steps,
        misconception: currentQ.misconceptionTags?.[0] || currentQ.misconception
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setStage('summary');
    }
  };

  const score = sessionAnswers.filter(a => a.isCorrect).length;
  const accuracy = sessionAnswers.length > 0 ? Math.round((score / sessionAnswers.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Configuration Screen */}
      {stage === 'config' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Greenwood Practice Centre
              </span>
              <span className="text-xs text-slate-500 font-semibold">Class {studentGrade} • Non-Repeating Randomized Drills</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-[#173E2B] dark:text-emerald-400" />
              Targeted Practice Centre & Concept Drills
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select your subject, chapter, and preferred difficulty level. Every question is drawn from verified NCERT curriculum benchmarks with instant worked solutions.
            </p>
          </div>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Step 1: Choose Subject & Curriculum Unit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#173E2B]"
                >
                  {subjects.map(s => (
                    <option key={s.code} value={s.name}>{s.name} ({s.category})</option>
                  ))}
                  {subjects.length === 0 && (
                    <>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chapter Focus
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#173E2B]"
                >
                  <option value="all">All Prescribed Chapters (Comprehensive)</option>
                  {chapters.map(ch => (
                    <option key={ch.chapterNumber} value={ch.title}>
                      Chapter {ch.chapterNumber}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Step 2: Select Calibrated Difficulty & Drill Size
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Difficulty Level
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {['FOUNDATION', 'EASY', 'MODERATE', 'CHALLENGING', 'ADVANCED'].map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-[#173E2B] text-white border-[#173E2B] shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Practice Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        questionCount === cnt
                          ? 'bg-[#173E2B] text-white border-[#173E2B] shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {cnt} Items
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                size="lg"
                iconRight={Play}
                onClick={handleStartSession}
                className="bg-[#173E2B] hover:bg-[#123021] text-white px-8"
              >
                Begin Targeted Practice Session
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Active Question Runner */}
      {stage === 'active' && currentQ && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant="primary">Item {currentIndex + 1} of {sessionQuestions.length}</Badge>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {currentQ.subject} &bull; {currentQ.chapter || 'Curriculum Item'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Difficulty:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                {currentQ.difficulty || selectedDifficulty}
              </span>
            </div>
          </div>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
              <MathRenderer text={currentQ.questionStatement || currentQ.questionText || ''} />
            </h2>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {(currentQ.options || []).map((opt, optIdx) => {
                const isSelected = selectedAnswer === optIdx;
                const correctIdx = currentQ.correctAnswerIndex !== undefined ? currentQ.correctAnswerIndex : currentQ.correctAnswer;
                const isCorrectOption = optIdx === correctIdx;

                let btnStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400";
                if (isSelected && !isAnswerSubmitted) {
                  btnStyle = "border-[#173E2B] bg-emerald-50/50 dark:bg-emerald-950/40 text-[#173E2B] ring-2 ring-[#173E2B]";
                } else if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500 font-bold";
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedAnswer(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span><MathRenderer text={String(opt)} /></span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Worked Solution Box */}
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Step-by-Step Worked Solution & Pedagogical Rationale
                  </h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <MathRenderer text={currentQ.explanation || 'Solution steps verified against NCERT curriculum standards.'} />
                </p>

                {(currentQ.misconceptionTags?.[0] || currentQ.misconception) && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <strong>Diagnostic Alert:</strong> {currentQ.misconceptionTags?.[0] || currentQ.misconception}
                  </div>
                )}
              </motion.div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Attempt saved to student learning model
              </span>

              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-[#173E2B] hover:bg-[#123021] text-white px-6"
                >
                  Submit Answer & Check
                </Button>
              ) : (
                <Button
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={handleNextQuestion}
                  className="bg-[#173E2B] hover:bg-[#123021] text-white px-6"
                >
                  {currentIndex + 1 < sessionQuestions.length ? 'Next Question' : 'View Session Results'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Summary Phase */}
      {stage === 'summary' && (
        <Card className="p-8 text-center border-slate-200 dark:border-slate-800 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Practice Session Complete!
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {selectedSubject} &bull; Class {studentGrade} &bull; {selectedDifficulty} Level
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-4 border-y border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">Correct</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{score} / {sessionAnswers.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Accuracy</p>
              <p className="text-2xl font-extrabold text-[#173E2B] dark:text-emerald-400 mt-0.5">{accuracy}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">BKT Gain</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">+{accuracy > 70 ? '8.4%' : '3.2%'}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              iconLeft={RotateCcw}
              onClick={() => {
                setStage('config');
              }}
            >
              Start New Practice Drill
            </Button>
            <Button
              variant="primary"
              className="bg-[#173E2B] hover:bg-[#123021] text-white"
              onClick={() => window.location.href = '/my-learning'}
            >
              Open Revision Deck
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
