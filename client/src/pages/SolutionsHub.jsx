import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { MOCK_SOLUTIONS } from '../services/mockData';

export const SolutionsHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Currently viewed solution (defaults to none or matched from query param if available)
  const initialId = searchParams.get('id');
  const [activeSolution, setActiveSolution] = useState(
    initialId ? MOCK_SOLUTIONS.find((s) => s.id === initialId) || null : null
  );

  // Filter solutions
  const filteredSolutions = MOCK_SOLUTIONS.filter((sol) => {
    const matchesSubject = selectedSubject === 'All' || sol.subject === selectedSubject;
    const matchesTopic = selectedTopic === 'All' || sol.topic === selectedTopic;
    const matchesSearch = sol.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sol.problemText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesTopic && matchesSearch;
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
              Pedagogical
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Step-by-step mathematical reasoning, conceptual frameworks, and instant Socratic AI tutor guidance.
          </p>
        </div>

        {activeSolution && (
          <Button
            onClick={() => setActiveSolution(null)}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by equation, concept, or problem statement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            {/* Subject and Topic Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {['All', 'Math', 'Science'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSubject === subj
                        ? 'bg-white text-indigo-600 shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-subtle"
              >
                <option value="All">All Topics</option>
                <option value="Fractions">Fractions</option>
                <option value="Algebra Basics">Algebra Basics</option>
                <option value="Forces & Motion">Forces & Motion</option>
              </select>
            </div>
          </div>

          {/* Solutions Cards Grid or Empty State */}
          {filteredSolutions.length === 0 ? (
            <Card className="p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No worked solutions matched your query</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms or switch subject / topic filters.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                  setSelectedTopic('All');
                }}
                className="text-xs font-semibold"
              >
                Reset Search & Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolutions.map((sol, idx) => (
                <motion.div
                  key={sol.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  <Card
                    onClick={() => setActiveSolution(sol)}
                    className="h-full hover:shadow-card-hover transition-all border border-slate-200/90 dark:border-slate-800 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={sol.subject === 'Math' ? 'primary' : 'success'} size="sm">
                          {sol.subject}
                        </Badge>
                        <DifficultyBadge difficulty={sol.difficulty} />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                        {sol.title}
                      </h3>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                        {sol.problemText}
                      </div>

                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          {sol.steps.length} Methodical Steps
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                          Core Concept Formula
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Step-by-Step Solution <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. DETAIL VIEW: DEEP STEP-BY-STEP & CONCEPTUAL EXPLANATION */
        /* ========================================================================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Problem Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="primary" size="sm">
                {activeSolution.subject}
              </Badge>
              <Badge variant="neutral" size="sm">
                Topic: {activeSolution.topic}
              </Badge>
              <DifficultyBadge difficulty={activeSolution.difficulty} />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {activeSolution.title}
            </h2>

            <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 font-mono text-sm sm:text-base text-cyan-200">
              {activeSolution.problemText}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step-by-step Breakdown (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Methodological Breakdown ({activeSolution.steps.length} Steps)
                </h3>
                <span className="text-xs text-slate-400 font-medium">Scaffolded Logic</span>
              </div>

              {activeSolution.steps.map((step) => (
                <Card key={step.stepNumber} className="p-5 border-l-4 border-l-indigo-600">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {step.explanation}
                  </p>

                  <div className="mt-3 ml-8 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-indigo-700">
                    {step.math}
                  </div>
                </Card>
              ))}
            </div>

            {/* Concept Formula & AI Tutor Deep Link (Right 1 col) */}
            <div className="space-y-6">
              {/* Conceptual Principles & Formula Canvas */}
              <Card className="p-5 border border-slate-200/90 dark:border-slate-800 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--theme-primary,#4F46E5)]" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Core Principle & Formula</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Verified Proof
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-cyan-400 block">
                    Mathematical Identity:
                  </span>
                  <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 text-center shadow-subtle">
                    {activeSolution.subject === 'Math' ? 'a/b ÷ c/d = a/b × d/c = (a × d)/(b × c)' : '6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    💡 Avoid Common Traps:
                  </span>
                  <p className="leading-relaxed text-[11px]">
                    Always verify your final expression by reducing numerators and denominators by their Greatest Common Divisor (GCD) before final submission.
                  </p>
                </div>
              </Card>

              {/* Still Confused? Ask AI Tutor Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-cyan-50 to-white border border-indigo-200/80 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-glow-primary">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Still Stuck on this Step?</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Context-Aware AI Tutor</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Our Socratic AI Tutor will break down this exact problem statement with a simpler analogy or custom practice variant.
                </p>

                <Button
                  onClick={() => navigate(`/tutor?topic=${encodeURIComponent(activeSolution.topic)}&problem=${encodeURIComponent(activeSolution.problemText)}`)}
                  variant="primary"
                  size="sm"
                  className="w-full mt-4"
                  icon={MessageSquareText}
                >
                  Ask AI Tutor About This
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
