import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { 
  Calculator, 
  Atom, 
  ArrowRight, 
  BrainCircuit, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Award,
  Zap,
  Layers,
  GraduationCap,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export const SubjectSelection = () => {
  const { user } = useContext(AuthContext);
  const { currentTheme, themes } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Animated Tab Switcher
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'practice' | 'test' | 'levels'

  const subjects = [
    {
      id: 'Math',
      title: 'Mathematics',
      icon: Calculator,
      gradient: 'from-blue-600 via-indigo-600 to-indigo-800',
      badgeColor: 'primary',
      description: 'Master Fractions, Decimals, Algebraic Equations, and Geometry through step-by-step 4-level adaptive practice.',
      topics: ['Fractions', 'Decimals', 'Algebra Basics', 'Ratios & Proportions', 'Geometry'],
      status: 'Diagnostic Ready',
      practiceUrl: '/practice?subject=Math&topic=Fractions',
      testUrl: '/test?id=test-01',
      totalLevels: 'Levels 1 - 4 (Easy to Very Hard)'
    },
    {
      id: 'Science',
      title: 'Science',
      icon: Atom,
      gradient: 'from-teal-600 via-cyan-600 to-emerald-700',
      badgeColor: 'cyan',
      description: 'Explore Photosynthesis, Forces & Motion, Cell Biology, and Matter with real-time feedback & step-by-step solutions.',
      topics: ['Photosynthesis', 'Forces & Motion', 'Cell Structure', 'States of Matter', 'Acids & Bases'],
      status: 'Diagnostic Ready',
      practiceUrl: '/practice?subject=Science&topic=Photosynthesis',
      testUrl: '/test?id=test-02',
      totalLevels: 'Levels 1 - 4 (Easy to Very Hard)'
    }
  ];

  // Theme-aware accent styling
  const activeThemeConfig = themes[currentTheme] || themes['student-indigo'];
  const isDark = currentTheme === 'midnight';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 transition-colors">
      {/* Top Banner with Active Theme Pill */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-primary-light,#EEF2FF)] dark:bg-slate-800 border border-[var(--theme-primary-border,#C7D2FE)] dark:border-slate-700 text-xs font-semibold text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curriculum Learning Hub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="capitalize">{activeThemeConfig.name.split(' (')[0]} Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Select Your Subject & Learning Mode
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Choose self-paced leveled practice, an official 4-tier timed assessment, or inspect step-by-step solved methodology.
        </p>

        {/* Animated Segmented Tab Switcher */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-subtle text-xs font-bold">
            {[
              { id: 'all', label: 'All Portals' },
              { id: 'practice', label: 'Adaptive Practice' },
              { id: 'test', label: 'Timed Tests' },
              { id: 'levels', label: '4-Tier Level System' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'text-[var(--theme-primary,#4F46E5)] dark:text-cyan-400 font-extrabold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="subTabHighlight"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* TAB CONTENT WITH ANIMATED TRANSITIONS */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* 1. ALL & PRACTICE & TEST MODES */}
        {(activeTab === 'all' || activeTab === 'practice' || activeTab === 'test') && (
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* TWO PROMINENT MODE SWITCHER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Practice Mode Card */}
              {(activeTab === 'all' || activeTab === 'practice') && (
                <motion.div variants={itemVariants}>
                  <Card
                    hoverEffect
                    onClick={() => navigate('/practice')}
                    className="p-6 sm:p-8 border-2 border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 flex flex-col justify-between h-full group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary,#4F46E5)] text-white flex items-center justify-center font-bold text-xl shadow-glow-primary group-hover:scale-105 transition-transform">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Self-Paced Leveling
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--theme-primary,#4F46E5)] dark:group-hover:text-cyan-400 transition-colors">
                        Adaptive Practice Mode
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                        Zero timer stress. Dynamic Level 1 to Level 4 progression staircase with immediate step-by-step explanations and streak multipliers.
                      </p>

                      <div className="space-y-2 text-xs mb-6">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>4 Levels: Novice (Easy) → Master (Very Hard)</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Earn XP points, unlock streak bonuses, and level up dynamically</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Context-aware Socratic AI Tutor on standby</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="primary" size="lg" fullWidth iconRight={ArrowRight}>
                      Enter Leveled Practice
                    </Button>
                  </Card>
                </motion.div>
              )}

              {/* Timed Test Mode Card */}
              {(activeTab === 'all' || activeTab === 'test') && (
                <motion.div variants={itemVariants}>
                  <Card
                    hoverEffect
                    onClick={() => navigate('/test')}
                    className="p-6 sm:p-8 border-2 border-slate-300/80 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800/40 dark:to-slate-900 flex flex-col justify-between h-full group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-105 transition-transform border border-slate-700">
                          <Clock className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          4-Tier Assessment
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Timed Test Mode
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                        Evaluations with active countdown clock. Balanced across Easy, Medium, Hard, and Very Hard tiers, with post-test solved answers and conceptual notes!
                      </p>

                      <div className="space-y-2 text-xs mb-6">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Questions graded across all 4 difficulty tiers</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Post-test review: Solved Steps + Concept & Misconception Notes</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Strict anti-cheating mode with timer auto-submit</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="secondary" size="lg" fullWidth iconRight={ArrowRight}>
                      View 4-Tier Assessments
                    </Button>
                  </Card>
                </motion.div>
              )}

            </div>

            {/* CURRICULUM SUBJECT PORTALS */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Curriculum Subject Portals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grade 6-10 STEM standards with leveled questions & diagnostic baseline tests.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subj) => {
                  const Icon = subj.icon;
                  return (
                    <motion.div key={subj.id} variants={itemVariants}>
                      <Card hoverEffect className="p-6 sm:p-8 flex flex-col justify-between h-full border border-slate-200/90 dark:border-slate-800">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${subj.gradient} flex items-center justify-center text-white shadow-md`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {subj.totalLevels}
                            </span>
                          </div>

                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{subj.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">{subj.description}</p>

                          <div className="mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                              Diagnostic Topics:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {subj.topics.map((t, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
                          <Button
                            variant="primary"
                            fullWidth
                            size="sm"
                            onClick={() => navigate(subj.practiceUrl)}
                          >
                            Leveled Practice
                          </Button>
                          <Button
                            variant="outline"
                            fullWidth
                            size="sm"
                            onClick={() => navigate(subj.testUrl)}
                          >
                            Subject Assessment
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. LEVEL SYSTEM OVERVIEW TAB */}
        {activeTab === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                The 4-Tier Difficulty & Leveling Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
                AdaptIQ uses an automated 4-tier calibration system. Students gain XP and level up dynamically during practice, while tests evaluate balanced mastery across all four tiers:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    tier: "Level 1: Foundational",
                    badge: "easy",
                    xp: "+50 XP",
                    desc: "Core definitions, simple single-step fraction addition, basic vocabulary recall.",
                    rule: "Entry level for new topics; ensures zero foundational gaps."
                  },
                  {
                    tier: "Level 2: Procedural",
                    badge: "medium",
                    xp: "+75 XP",
                    desc: "Common denominators, cross-multiplication, multi-variable procedural execution.",
                    rule: "Calibrates here when 2 consecutive answers are correct."
                  },
                  {
                    tier: "Level 3: Multi-Step",
                    badge: "hard",
                    xp: "+100 XP",
                    desc: "Reciprocal division, word problems, rate conversions, two-step balancing.",
                    rule: "Unlocked on 3 consecutive correct answers."
                  },
                  {
                    tier: "Level 4: Conceptual Mastery",
                    badge: "very_hard",
                    xp: "+150 XP",
                    desc: "Real-world algebraic constraints, Olympiad-tier synthesis, complex reasoning.",
                    rule: "Mastery milestone; proves deep curriculum retention."
                  }
                ].map((lvl, index) => (
                  <div key={index} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <DifficultyBadge difficulty={lvl.badge} />
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-cyan-400">{lvl.xp}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{lvl.tier}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{lvl.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500 font-medium">
                      {lvl.rule}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Ready to test your current mastery tier?
                </span>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => navigate('/practice')}>
                    Start Leveled Practice
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/test')}>
                    Take 4-Tier Test
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
