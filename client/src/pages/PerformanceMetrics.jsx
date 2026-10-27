import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Clock, 
  Target, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Filter, 
  Flame, 
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AuthContext } from '../context/AuthContext';
import { 
  MOCK_STUDENT_WEEKLY_HOURS, 
  MOCK_SCORE_TREND, 
  MOCK_HISTOGRAM_DISTRIBUTION, 
  MOCK_CLASS_HEATMAP,
  MOCK_TOPICS_MATH,
  MOCK_TOPICS_SCIENCE
} from '../services/mockData';

export const PerformanceMetrics = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSubject, setActiveSubject] = useState('Math');
  const [timeframe, setTimeframe] = useState('30d');
  const [activePerspective, setActivePerspective] = useState(role === 'teacher' ? 'teacher' : 'student');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const topics = activeSubject === 'Math' ? MOCK_TOPICS_MATH : MOCK_TOPICS_SCIENCE;
  const weakTopics = topics.filter((t) => t.status === 'needs_focus');
  const strongTopics = topics.filter((t) => t.status === 'mastered');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-elevated flex items-center gap-2 text-xs font-semibold border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Performance & Mastery Analytics
            </h1>
            <Badge variant="primary" size="sm">
              Real-time
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized learning telemetry, longitudinal growth tracking, and gap discovery.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['Math', 'Science'].map((subj) => (
              <button
                key={subj}
                onClick={() => setActiveSubject(subj)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeSubject === subj
                    ? 'bg-white text-indigo-600 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Timeframe */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-subtle"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All-Time Cohort</option>
          </select>

          {/* Perspective Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActivePerspective('student')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePerspective === 'student'
                  ? 'bg-indigo-600 text-white shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student View
            </button>
            <button
              onClick={() => setActivePerspective('teacher')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePerspective === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teacher View
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT METRICS PERSPECTIVE */}
      {/* ========================================================================= */}
      {activePerspective === 'student' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200/90">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Overall Mastery</span>
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">76%</span>
                <span className="text-xs font-bold text-emerald-600">+19% gain</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tier 3: Proficient Practitioner</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200/90">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Weekly Study Time</span>
                <Clock className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">8.5 hrs</span>
                <span className="text-xs font-bold text-emerald-600">On Target</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Avg 1.2 hrs daily engagement</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200/90">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Adaptive Accuracy</span>
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">84%</span>
                <span className="text-xs font-bold text-indigo-600">Level 3 (Hard)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">156 total practice questions</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200/90">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Class Percentile</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">Top 15%</span>
                <span className="text-xs font-bold text-slate-400">Class 7-B</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">+14 pts above class average</p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Accuracy Progression Trend */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Accuracy Trend Over Time
                  </h3>
                  <p className="text-xs text-slate-400">Weekly progression as adaptive difficulty calibrated</p>
                </div>
                <Badge variant="primary" size="sm">6 Weeks</Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_SCORE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[40, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                      formatter={(val) => [`${val}% Accuracy`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#06B6D4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Weekly Hours Bar Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    Weekly Learning Hours Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">Time spent practicing and reviewing solutions</p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  Total: 8.5h
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_STUDENT_WEEKLY_HOURS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                      formatter={(val) => [`${val} hours`, 'Study Time']}
                    />
                    <Bar dataKey="hours" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Benchmark Comparison & Topic Mastery Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Benchmark Card */}
            <Card className="p-6 lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cohort Benchmark</h3>
                <p className="text-xs text-slate-400 mt-1">Comparison against class and district cohorts</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-indigo-600 font-bold">Rahul Sharma (You)</span>
                      <span className="text-slate-900 font-bold">82%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Class 7-B Average</span>
                      <span className="text-slate-700">67%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">District Standard Baseline</span>
                      <span className="text-slate-500">54%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-300 h-full rounded-full" style={{ width: '54%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-indigo-900 font-medium leading-relaxed block">
                  ✨ <strong>Remarkable Improvement:</strong> You've outperformed the district benchmark by <span className="font-bold text-indigo-700">+28%</span> following adaptive recommendations.
                </span>
              </div>
            </Card>

            {/* Gap Topics Callouts */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900">Topic-Specific Focus Areas</h3>
              <p className="text-xs text-slate-400 mt-1">Priority concepts requiring targeted reinforcement</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Weak Topics */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-amber-900">Foundational Learning Gaps</h4>
                  </div>
                  {weakTopics.slice(0, 2).map((t) => (
                    <div key={t.topic} className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{t.topic}</span>
                        <span className="text-[11px] text-amber-600 font-semibold">{t.mastery}% mastery ({t.correct}/{t.attempted})</span>
                      </div>
                      <Button
                        onClick={() => navigate(`/practice?topic=${t.topic}`)}
                        variant="primary"
                        size="sm"
                        className="text-xs px-2.5 py-1"
                      >
                        Practice
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Strong Topics */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-900">Mastered Competencies</h4>
                  </div>
                  {strongTopics.slice(0, 2).map((t) => (
                    <div key={t.topic} className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{t.topic}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold">{t.mastery}% accuracy</span>
                      </div>
                      <Badge variant="success" size="sm">Mastered 🔥</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER COHORT PERSPECTIVE */}
      {/* ========================================================================= */}
      {activePerspective === 'teacher' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Actions & Summary */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cohort Diagnostics & Gap Distribution</h2>
              <p className="text-xs text-slate-500">Aggregate statistics for Class 7-B Mathematics (28 Students)</p>
            </div>
            <Button
              onClick={() => triggerToast("Cohort performance summary PDF generated!")}
              variant="outline"
              size="sm"
              icon={Download}
            >
              Export Summary Report
            </Button>
          </div>

          {/* Histogram & Heatmap Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution Histogram */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Score Distribution Histogram</h3>
                  <p className="text-xs text-slate-400">Cohort mastery bracket clustering</p>
                </div>
                <Badge variant="primary" size="sm">28 Students</Badge>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_HISTOGRAM_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px' }}
                      formatter={(val, name, props) => [`${val} students (${props.payload.label})`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {MOCK_HISTOGRAM_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>🔴 Foundational Gap (2 students)</span>
                <span>🟡 Needs Practice (6 students)</span>
                <span>🟢 Proficient/Mastered (20 students)</span>
              </div>
            </Card>

            {/* Cohort Topic Heatmap Matrix */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Cohort Topic Heatmap Matrix</h3>
                    <p className="text-xs text-slate-400">Classwide accuracy across key curriculum standards</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {MOCK_CLASS_HEATMAP.map((item) => {
                    const isRed = item.avgAccuracy < 60;
                    const isYellow = item.avgAccuracy >= 60 && item.avgAccuracy < 75;

                    return (
                      <div
                        key={item.topic}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{item.topic}</span>
                            {isRed && <Badge variant="danger" size="sm">Critical Gap</Badge>}
                            {isYellow && <Badge variant="warning" size="sm">Developing</Badge>}
                            {!isRed && !isYellow && <Badge variant="success" size="sm">Proficient</Badge>}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {item.strugglingCount} students needing remedial support
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-extrabold ${isRed ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.avgAccuracy}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">class avg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Classwide action recommendation:</span>
                <Button
                  onClick={() => triggerToast("Assigned Fractions scaffolding worksheet to 14 students!")}
                  variant="primary"
                  size="sm"
                >
                  Remediate Fractions (14 Students)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
