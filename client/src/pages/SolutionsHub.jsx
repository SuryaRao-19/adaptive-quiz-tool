import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  MessageSquareText, 
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Flame,
  Check,
  Eye,
  GraduationCap,
  Volume2,
  Brain
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { MathRenderer } from '../components/ui/MathRenderer';
import { MOCK_SOLUTIONS } from '../services/mockData';
import { speechHelper } from '../utils/speechSynthesis';

export const SolutionsHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Bookmarks state (saved in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('greenwood_bookmarked_solutions') || localStorage.getItem('adaptiq_bookmarked_solutions');
      return saved ? JSON.parse(saved) : ['sol-01'];
    } catch {
      return ['sol-01'];
    }
  });

  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('greenwood_bookmarked_solutions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Currently viewed solution
  const initialId = searchParams.get('id');
  const [activeSolution, setActiveSolution] = useState(
    initialId ? MOCK_SOLUTIONS.find((s) => s.id === initialId) || null : null
  );

  // Related practice state
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);

  // Filter solutions
  const filteredSolutions = MOCK_SOLUTIONS.filter((sol) => {
    const matchesSubject = selectedSubject === 'All' || sol.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || sol.topic === selectedTopic;
    const matchesGrade = selectedGrade === 'All' || String(sol.grade) === String(selectedGrade);
    const matchesDifficulty = selectedDifficulty === 'All' || sol.difficulty === selectedDifficulty;
    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(sol.id);
    const textTarget = `${sol.title} ${sol.problemStatement || sol.problemText || ''} ${sol.coreConcept || ''} ${sol.topic}`.toLowerCase();
    const matchesSearch = textTarget.includes(searchQuery.toLowerCase());
    return matchesSubject && matchesTopic && matchesGrade && matchesDifficulty && matchesBookmark && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Step-by-Step Solved Solutions
            </h1>
            <Badge variant="primary" size="sm">
              10-Step Pedagogical
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Canonical worked-example repository for Greenwood Public School with formal proofs, verification, and pedagogical step-by-step verification.
          </p>
        </div>

        {activeSolution && (
          <Button
            onClick={() => {
              setActiveSolution(null);
              setShowPracticeHint(false);
              setShowPracticeAnswer(false);
            }}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
          >
            Back to Solutions Index
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. LIST VIEW: BROWSABLE SOLUTIONS LIBRARY */}
      {/* ========================================================================= */}
      {!activeSolution ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by theorem, formula, topic, or question keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Bookmark Filter Toggle */}
              <button
                onClick={() => setShowBookmarksOnly(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  showBookmarksOnly 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-subtle' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                Bookmarked ({bookmarkedIds.length})
              </button>
            </div>

            {/* Subject, Grade & Difficulty Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {['All', 'Math', 'Science', 'English'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSubject === subj
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-subtle'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-subtle"
              >
                <option value="All">All Grades (1–12)</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-subtle"
              >
                <option value="All">All Difficulties</option>
                <option value="easy">Easy (Foundational)</option>
                <option value="medium">Medium (Procedural)</option>
                <option value="hard">Hard (Multi-Step)</option>
                <option value="very_hard">Very Hard (Mastery)</option>
              </select>
            </div>
          </div>

          {/* Solutions Cards Grid */}
          {filteredSolutions.length === 0 ? (
            <Card className="p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No worked solutions matched your query</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms or switch subject, grade, and topic filters.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                  setSelectedTopic('All');
                  setSelectedGrade('All');
                  setSelectedDifficulty('All');
                  setShowBookmarksOnly(false);
                }}
                className="text-xs font-semibold"
              >
                Reset Search & Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredSolutions.map((sol, idx) => {
                const isBookmarked = bookmarkedIds.includes(sol.id);
                return (
                  <motion.div
                    key={sol.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card
                      onClick={() => setActiveSolution(sol)}
                      className="h-full hover:shadow-card-hover transition-all border border-slate-200/90 dark:border-slate-800 group cursor-pointer flex flex-col justify-between p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={sol.subject === 'Math' ? 'primary' : 'success'} size="sm">
                              {sol.subject} • Grade {sol.grade || 7}
                            </Badge>
                            {sol.isExamFavorite && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                <Flame className="w-3 h-3 text-amber-500" />
                                Important Practice Question
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <DifficultyBadge difficulty={sol.difficulty} />
                            <button
                              onClick={(e) => toggleBookmark(sol.id, e)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isBookmarked 
                                  ? 'bg-amber-100 text-amber-600 border-amber-300' 
                                  : 'text-slate-400 hover:text-amber-500 border-transparent'
                              }`}
                              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Solution'}
                            >
                              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                          {sol.title}
                        </h3>

                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {sol.problemStatement || sol.problemText}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            {sol.steps?.length || 3} Scaffolded Steps
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                            Full Verification & Sanity Check
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          View 10-Step Pedagogical Solution <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. DETAIL VIEW: CANONICAL 10-STEP PEDAGOGICAL BREAKDOWN */
        /* ========================================================================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Problem Banner (Steps 1 & 2) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">
                  {activeSolution.subject} • Grade {activeSolution.grade || 7}
                </Badge>
                <Badge variant="neutral" size="sm">
                  Chapter: {activeSolution.chapter || activeSolution.topic}
                </Badge>
                <DifficultyBadge difficulty={activeSolution.difficulty} />
                {activeSolution.isExamFavorite && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Important Practice Question
                  </span>
                )}
              </div>

              <button
                onClick={(e) => toggleBookmark(activeSolution.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  bookmarkedIds.includes(activeSolution.id)
                    ? 'bg-amber-500 text-white border-amber-400 shadow-subtle'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(activeSolution.id) ? 'fill-current' : ''}`} />
                {bookmarkedIds.includes(activeSolution.id) ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {activeSolution.title}
            </h2>

            {/* Step 1: Problem Statement */}
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                1. Problem Statement
              </span>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sm sm:text-base text-cyan-100 font-medium">
                {activeSolution.problemStatement || activeSolution.problemText}
              </div>
            </div>

            {/* Steps 2 & 3: Given Information & What We Need to Find */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  2. Given Information
                </span>
                <ul className="space-y-1 text-xs text-slate-200">
                  {(activeSolution.given || ["All primary parameters explicitly stated in problem"]).map((g, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  3. What We Need to Find
                </span>
                <p className="text-xs text-slate-200">
                  {activeSolution.toFind || "Evaluate and simplify the expression to lowest terms"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Steps 4, 5, 6, 7 (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 4 & 5: Core Concept & Formula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-indigo-600 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                    4. Core Concept / Theorem
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeSolution.coreConcept || "Properties of rational numbers and equality transformations."}
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-cyan-600 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                    5. Relevant Formula
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center">
                    {activeSolution.formula || "F = m · a"}
                  </div>
                </Card>
              </div>

              {/* Step 6: Step-by-Step Derivation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    6. Step-by-Step Calculation & Derivation ({activeSolution.steps.length} Steps)
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Scaffolded Logic</span>
                </div>

                {activeSolution.steps.map((step) => (
                  <Card key={step.stepNumber} className="p-5 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                      </div>

                      {/* Listen to Step N via Web Speech API */}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Volume2}
                        className="text-xs text-indigo-600 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        onClick={() => {
                          speechHelper.speak(`Step ${step.stepNumber}: ${step.title}. ${step.explanation}. Mathematical expression: ${step.math}`);
                        }}
                      >
                        Listen to Step {step.stepNumber}
                      </Button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                      {step.explanation}
                    </p>

                    <div className="ml-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-mono text-xs font-bold text-indigo-700 dark:text-cyan-300">
                      {step.math}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Step 7: Final Answer with Units */}
              <Card className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-500/30 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  7. Final Answer (With Units)
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/20 text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono text-center shadow-subtle">
                  {activeSolution.finalAnswer || "Verified Output"}
                </div>
              </Card>

              {/* Step 8: Verification / Sanity Check */}
              <Card className="p-5 border-l-4 border-l-sky-500 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  8. Sanity Check / Verification Step
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeSolution.verification || "Back-substituting the calculated result confirms equality and validates physical dimension checks."}
                </p>
              </Card>
            </div>

            {/* Steps 9, 10 & AI Deep Link (Right 1 col) */}
            <div className="space-y-6">
              {/* Step 9: Common Mistakes to Avoid */}
              <Card className="p-5 border-l-4 border-l-amber-500 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  9. Common Mistakes to Avoid
                </span>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {(activeSolution.commonMistakes || [
                    "Sign errors during transposition.",
                    "Applying operations to only one side of the equation."
                  ]).map((m, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                      <span className="text-amber-600 font-bold">⚠️</span>
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Step 10: Related Practice Question */}
              <Card className="p-5 border-l-4 border-l-purple-500 space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  10. Related Practice Challenge
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {activeSolution.relatedPractice?.question || "Try solving a parallel problem with alternate coefficient values."}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPracticeHint(prev => !prev)}
                    className="text-xs"
                  >
                    {showPracticeHint ? 'Hide Hint' : '💡 Show Hint'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPracticeAnswer(prev => !prev)}
                    className="text-xs"
                  >
                    {showPracticeAnswer ? 'Hide Answer' : '👁️ Reveal Answer'}
                  </Button>
                </div>

                {showPracticeHint && activeSolution.relatedPractice?.hint && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
                    <strong>Hint:</strong> {activeSolution.relatedPractice.hint}
                  </div>
                )}

                {showPracticeAnswer && activeSolution.relatedPractice?.answer && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-mono font-bold">
                    <strong>Answer:</strong> {activeSolution.relatedPractice.answer}
                  </div>
                )}
              </Card>

              {/* Practice Similar Problem (Adaptive Drill) */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-cyan-50 to-white dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800 shadow-card space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-glow-primary">
                    <Brain className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Ready to Test Your Mastery?</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Adaptive Practice Drill</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Apply what you learned from this worked solution to solve an equivalent problem calibrated to your skill level.
                </p>

                <Button
                  onClick={() => {
                    navigate(`/practice?topic=${encodeURIComponent(activeSolution.topic)}&subject=${encodeURIComponent(activeSolution.subject)}`);
                  }}
                  variant="primary"
                  size="sm"
                  className="w-full"
                  icon={ArrowRight}
                >
                  Practice Similar Problem
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
