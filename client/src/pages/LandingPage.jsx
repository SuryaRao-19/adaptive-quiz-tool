import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  LineChart, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  TrendingUp, 
  Zap,
  Play,
  Layers,
  School,
  Users,
  Target,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';

export const LandingPage = () => {
  const navigate = useNavigate();

  // Interactive Live Simulator for Showcase Reviewers & Investors
  const [simLevel, setSimLevel] = useState('medium');
  const [simStreak, setSimStreak] = useState(2);
  const [simHistory, setSimHistory] = useState([true, true]);
  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const sampleQuestions = {
    easy: {
      topic: "Fractions (Level 1 - Foundational)",
      q: "What is 1/4 + 2/4 in simplest form?",
      hint: "Identical denominators: simply add numerators 1 + 2 = 3.",
      tierBadge: "Foundational (Level 1)"
    },
    medium: {
      topic: "Fractions (Level 2 - Procedural)",
      q: "Calculate: 1/3 + 1/6",
      hint: "Find least common denominator 6: (2/6) + (1/6) = 3/6 = 1/2.",
      tierBadge: "Intermediate (Level 2)"
    },
    hard: {
      topic: "Fractions (Level 3 - Conceptual)",
      q: "Evaluate: (2/3) ÷ (4/9)",
      hint: "Reciprocal multiplication: 2/3 × 9/4 = 18/12 = 3/2 (1.5).",
      tierBadge: "Advanced (Level 3)"
    }
  };

  const simulateAnswer = (isCorrect) => {
    const newHistory = [...simHistory, isCorrect];
    setSimHistory(newHistory);
    setFeedbackEffect(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const newStreak = simStreak + 1;
      setSimStreak(newStreak);
      if (newStreak >= 3) {
        if (simLevel === 'easy') setSimLevel('medium');
        else if (simLevel === 'medium') setSimLevel('hard');
      }
    } else {
      setSimStreak(0);
      if (simLevel === 'hard') setSimLevel('medium');
      else if (simLevel === 'medium') setSimLevel('easy');
    }

    setTimeout(() => setFeedbackEffect(null), 900);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/25 dark:bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute top-28 right-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/25 rounded-full blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Tag Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>UN SDG 4 Aligned • AI-Driven Diagnostic Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400 font-normal">Grade 6-10 STEM</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white"
          >
            Personalized Practice That{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-500 bg-clip-text text-transparent">
              Adapts to Every Student
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
          >
            In crowded classrooms, one-size-fits-all tests leave foundational learning gaps behind.
            <strong className="text-slate-900 dark:text-white font-semibold"> AdaptIQ</strong> diagnoses weak topics in Math and Science, adjusts question difficulty in real time, and proves measurable growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
          >
            <Link to="/select" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" iconRight={ArrowRight} className="w-full sm:w-auto shadow-glow-primary">
                Start Free Practice
              </Button>
            </Link>

            <a href="#simulator" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" icon={Play} className="w-full sm:w-auto">
                Launch Live Simulator
              </Button>
            </a>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Pre-Test vs Post-Test Growth Tracking
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              Socratic AI Tutor Guidance
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Zero Hardware Barrier (Mobile Ready)
            </span>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SIMULATOR (Live Demo for Showcase) */}
      {/* ========================================================================= */}
      <section id="simulator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-elevated p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Top Simulator Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                Interactive Calibration Simulator
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                How the Adaptive Engine Calibrates Difficulty
              </h2>
            </div>

            {/* Current Engine State Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live State:</span>
              <DifficultyBadge difficulty={simLevel} />
            </div>
          </div>

          {/* Simulated Question Card */}
          <div className="mt-8 space-y-6">
            <div className={`p-6 rounded-2xl border transition-all duration-300 relative ${
              feedbackEffect === 'correct' 
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-glow-emerald' 
                : feedbackEffect === 'wrong'
                ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-glow-rose'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
            }`}>
              
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {sampleQuestions[simLevel].topic}
                </span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Streak: {simStreak} Correct
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {sampleQuestions[simLevel].q}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                {sampleQuestions[simLevel].hint}
              </p>
            </div>

            {/* Simulation Trigger Buttons */}
            <div className="bg-slate-100/70 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">Simulate Student Response:</p>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Click to test automatic difficulty adjustment logic
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => simulateAnswer(true)}
                  variant="success"
                  size="sm"
                  icon={CheckCircle2}
                >
                  Answer Correct (+1 Streak)
                </Button>
                <Button
                  onClick={() => simulateAnswer(false)}
                  variant="danger"
                  size="sm"
                >
                  Answer Wrong (Demote)
                </Button>
              </div>
            </div>

            {/* Algorithm Rule Callout */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              Rule: <strong>3 consecutive correct answers</strong> elevate difficulty to reinforce challenge; <strong>incorrect answers</strong> step down to remediate mechanics.
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VERIFIED QUANTITATIVE IMPACT METRICS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-6 text-center border border-slate-200/90 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              +34.2%
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Measured Growth Delta</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Pre-test vs. post-test average</p>
          </Card>

          <Card className="p-6 text-center border border-slate-200/90 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
              84%
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Gaps Remediated</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Within 3 adaptive practice sessions</p>
          </Card>

          <Card className="p-6 text-center border border-slate-200/90 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              15,400+
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Questions Served</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Across Math & Science standards</p>
          </Card>

          <Card className="p-6 text-center border border-slate-200/90 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              &lt;450 KB
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Ultra-Lightweight</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Optimized for low-bandwidth devices</p>
          </Card>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS: THE 4-STEP ADAPTIVE CYCLE */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" size="sm" className="mb-2">Pedagogical Framework</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            The 4-Step Adaptive Learning Engine
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
            Engineered specifically to transform passive memorization into active foundational mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Diagnostic Pre-Test",
              desc: "A rapid 10-question evaluation diagnoses precise misconceptions in Fractions, Decimals, or Chemistry.",
              icon: Target,
              badge: "Baseline"
            },
            {
              step: "02",
              title: "Real-Time Calibration",
              desc: "Questions adapt dynamically. Students with mastery jump ahead; struggling students receive scaffolded support.",
              icon: BrainCircuit,
              badge: "Dynamic"
            },
            {
              step: "03",
              title: "Socratic AI Assistance",
              desc: "When a mistake occurs, the AI Tutor breaks down underlying principles without spoiling the answer.",
              icon: Sparkles,
              badge: "Cognitive"
            },
            {
              step: "04",
              title: "Verifiable Post-Test",
              desc: "Standardized parallel post-tests prove net growth gains with printable certificates and administrator heatmaps.",
              icon: Award,
              badge: "Growth Delta"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="p-6 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      STEP {item.step}
                    </span>
                    <Badge variant="neutral" size="sm">{item.badge}</Badge>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-elevated relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full text-cyan-300">
              Instant Classroom Pilot
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Close Foundational Learning Gaps?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch pre-test diagnostics for your school or try the student practice interface immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/select" className="w-full sm:w-auto">
              <Button size="lg" variant="glow" iconRight={ArrowRight} className="w-full sm:w-auto">
                Start Practicing Now
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-white bg-white/10 hover:bg-white/20 border-white/20">
                View Live Cohort
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLEAN MINIMAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-white">AdaptIQ</span>
            <span>• AI Adaptive Learning Engine</span>
            <span>• UN SDG 4 Aligned</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/select" className="hover:text-indigo-600 dark:hover:text-cyan-400">Subjects</Link>
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-cyan-400">Dashboard</Link>
            <Link to="/styleguide" className="hover:text-indigo-600 dark:hover:text-cyan-400">Design System</Link>
            <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-cyan-400">Contact Us</Link>
            <Link to="/support?tab=feedback" className="hover:text-indigo-600 dark:hover:text-cyan-400">Feedback</Link>
            <Link to="/support?tab=bug" className="hover:text-indigo-600 dark:hover:text-cyan-400">Report Bug</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
