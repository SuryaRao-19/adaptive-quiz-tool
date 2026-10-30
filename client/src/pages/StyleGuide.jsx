import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Zap, 
  ArrowRight,
  RefreshCw,
  Home,
  Clock,
  BookOpen,
  MessageSquareText,
  Users,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Input } from '../components/ui/Input';
import { ThemeSelector } from '../components/ThemeSelector';

export const StyleGuide = () => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [testDifficulty, setTestDifficulty] = useState('medium');

  const colors = [
    { name: 'Indigo 600 (Primary Brand)', hex: '#4F46E5', bg: 'bg-indigo-600', text: 'text-white' },
    { name: 'Indigo 900 (Deep Authority)', hex: '#312E81', bg: 'bg-indigo-900', text: 'text-white' },
    { name: 'Cyan 500 (Accent)', hex: '#06B6D4', bg: 'bg-cyan-500', text: 'text-white' },
    { name: 'Emerald 500 (Mastery / Success)', hex: '#10B981', bg: 'bg-emerald-500', text: 'text-white' },
    { name: 'Amber 500 (Needs Focus / Warning)', hex: '#F59E0B', bg: 'bg-amber-500', text: 'text-white' },
    { name: 'Rose 500 (Error / Incorrect)', hex: '#F43F5E', bg: 'bg-rose-500', text: 'text-white' },
    { name: 'Slate 900 (Dark Neutral)', hex: '#0F172A', bg: 'bg-slate-900', text: 'text-white' },
    { name: 'Canvas (Off-White)', hex: '#F8FAFC', bg: 'bg-slate-100', text: 'text-slate-800' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Theme Switcher */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" size="md" className="mb-2">Living Design System</Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AdaptIQ Design System & Component Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            A living, documented specification of color tokens, multi-theme styles, typography scales, atomic UI components, and micro-interaction states.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-bold text-slate-500">Active Theme:</span>
          <ThemeSelector />
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">1. Color Palette Tokens</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colors.map((c) => (
            <div key={c.name} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle">
              <div className={`h-14 rounded-xl ${c.bg} ${c.text} flex items-end p-2 mb-3 shadow-inner`}>
                <span className="font-mono text-[11px] font-bold opacity-90">{c.hex}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Scale */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">2. Typography Scale (Plus Jakarta Sans)</h2>
        </div>
        <Card className="divide-y divide-slate-100 p-6">
          <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs font-mono text-slate-400 w-32">Display Heading (h1)</span>
            <span className="text-4xl font-extrabold text-slate-900">The Quick Brown Fox Jumps</span>
            <span className="text-xs text-slate-400 font-mono">36px / Bold 800</span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs font-mono text-slate-400 w-32">Section Heading (h2)</span>
            <span className="text-2xl font-bold text-slate-900">Adaptive Practice Diagnostics</span>
            <span className="text-xs text-slate-400 font-mono">24px / Bold 700</span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs font-mono text-slate-400 w-32">Quiz Question Text</span>
            <span className="text-xl font-bold text-slate-800">What is 1/4 + 2/4 in simplest form?</span>
            <span className="text-xs text-slate-400 font-mono">20px / Bold 700</span>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs font-mono text-slate-400 w-32">Body Text</span>
            <span className="text-base text-slate-600">High-contrast, legible body copy for student accessibility on low-cost LCD screens.</span>
            <span className="text-xs text-slate-400 font-mono">16px / Regular 400</span>
          </div>
        </Card>
      </section>

      {/* 3. Button Component Hierarchy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">3. Button Variants & Interactive States</h2>
        </div>
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Indigo</Button>
            <Button variant="glow" icon={Sparkles}>Glow Gradient</Button>
            <Button variant="secondary">Dark Neutral</Button>
            <Button variant="outline">Outline Card</Button>
            <Button variant="success" icon={CheckCircle2}>Success</Button>
            <Button variant="danger">Error / Destructive</Button>
            <Button variant="ghost">Ghost Link</Button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <Button
              variant="primary"
              loading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 2000);
              }}
            >
              {btnLoading ? 'Processing...' : 'Click to Test Loading State'}
            </Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>
        </Card>
      </section>

      {/* 4. Badges & Real-time Difficulty Tiers */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">4. Status Badges & Difficulty Indicators</h2>
        </div>
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default Neutral</Badge>
            <Badge variant="primary" dot>Primary Active</Badge>
            <Badge variant="success" dot>Mastered (&ge;80%)</Badge>
            <Badge variant="warning" dot>Needs Focus (&lt;60%)</Badge>
            <Badge variant="danger" dot>Action Required</Badge>
            <Badge variant="purple">Teacher Admin</Badge>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Adaptive Difficulty Badges:</span>
              <DifficultyBadge difficulty="easy" />
              <DifficultyBadge difficulty="medium" />
              <DifficultyBadge difficulty="hard" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Interactive Transition:</span>
              <button
                onClick={() => {
                  const tiers = ['easy', 'medium', 'hard'];
                  const next = tiers[(tiers.indexOf(testDifficulty) + 1) % 3];
                  setTestDifficulty(next);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
              >
                Cycle Level (Current: {testDifficulty})
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Progress Bars & Metric Rings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">5. Progress Indicators & Visual Score Rings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Animated Linear Progress Bars</h3>
            <ProgressBar percentage={40} label="Foundational Mastery (Amber Tier)" color="amber" />
            <ProgressBar percentage={68} label="Intermediate Practice (Indigo Tier)" color="indigo" />
            <ProgressBar percentage={92} label="Mastered Concept (Emerald Tier)" color="emerald" />
          </Card>
          <Card className="md:col-span-4 p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Circular Metric Ring</h3>
            <CircularProgress percentage={84} size={130} label="Diagnostic" color="emerald" />
          </Card>
        </div>
      </section>

      {/* 6. Showcase Components for New SaaS Capabilities */}
      <section className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">6. SaaS Architecture & Extension Components</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Component 1: Sidebar Navigation Item */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Sidebar Navigation Items</h3>
              <Badge variant="primary" size="sm">Active vs Inactive</Badge>
            </div>
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-subtle">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>Practice Mode</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  Adaptive
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Reference Library</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Component 2: Chat Bubble */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. AI Tutor Chat Bubble</h3>
              <Badge variant="success" size="sm">Socratic Flow</Badge>
            </div>
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-subtle">
                  Notice that the denominators 3 and 6 are multiples of each other. What is the common denominator?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] p-3 rounded-2xl bg-indigo-600 text-white rounded-tr-sm shadow-subtle">
                  Is it 6?
                </div>
              </div>
            </div>
          </Card>

          {/* Component 3: Resource Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Resource Card</h3>
              <Badge variant="purple" size="sm">Library</Badge>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary" size="sm">Math</Badge>
                <span className="text-[10px] font-semibold text-slate-400">6 min read</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Visual Guide to Adding Fractions</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Understand why we need common denominators using pizza slice visual models and step-by-step LCM finding.
              </p>
            </div>
          </Card>

          {/* Component 4: Test Mode Banner */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Test Mode Header Banner</h3>
              <Badge variant="warning" size="sm">Anti-Cheat</Badge>
            </div>
            <div className="bg-slate-950 text-white p-3.5 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Timed Exam in Progress</span>
              </div>
              <span className="font-mono text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg">
                14:59
              </span>
            </div>
          </Card>

          {/* Component 5: Mode Switcher Cards */}
          <Card className="p-5 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">5. Mode Switcher Cards</h3>
              <Badge variant="default" size="sm">Dual Entry</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white hover:shadow-card transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Adaptive Practice Mode</h4>
                <p className="text-xs text-slate-500 mt-1">Questions adjust difficulty dynamically with immediate feedback.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-card transition-all">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Timed Test Assessment</h4>
                <p className="text-xs text-slate-500 mt-1">Formal evaluations with locked answers and delayed post-test scoring.</p>
              </div>
            </div>
          </Card>

          {/* Component 6: Roster Row */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">6. Classroom Roster Row</h3>
              <Badge variant="success" size="sm">Table Spec</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Rahul Sharma</span>
                <span className="text-[10px] font-mono text-slate-400">G7-01</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block">Growth</span>
                <span className="font-bold text-emerald-600">+34%</span>
              </div>
              <Badge variant="success" size="sm">On Track</Badge>
            </div>
          </Card>

          {/* Component 7: Metric Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">7. Metric KPI Card</h3>
              <Badge variant="primary" size="sm">Analytics</Badge>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Overall Mastery</span>
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">76%</span>
                <span className="text-xs font-bold text-emerald-600">+19% gain</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Tier 3: Proficient Practitioner</p>
            </div>
          </Card>

          {/* Component 8: Web3Forms Email Integration */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">8. Web3Forms Support Hub</h3>
              <Badge variant="indigo" size="sm">Email API</Badge>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>3 Workflows Integrated</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Spam Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contact Enquiries, User Feedback & Bug Reports with client-side rate limiting and zero student PII leakage.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <a
                  href="/contact"
                  className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Support Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
