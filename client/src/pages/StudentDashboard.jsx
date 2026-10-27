import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  Trophy, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  Clock,
  BookOpen,
  Sparkles,
  Award,
  Play,
  School,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AuthContext } from '../context/AuthContext';
import { getAttemptsAnalytics } from '../services/progressService';
import { joinClass as apiJoinClass } from '../services/classService';

const CURRICULUM_SYLLABUS = {
  Math: [
    { topic: "Fractions", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Decimals", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Algebra Basics", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Ratios & Proportions", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Geometry & Triangles", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" }
  ],
  Science: [
    { topic: "Photosynthesis", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Forces & Motion", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Cell Structure", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "Acids, Bases & Salts", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" },
    { topic: "States of Matter", attempted: 0, correct: 0, mastery: 0, status: "needs_practice" }
  ]
};

export const StudentDashboard = () => {
  const { user, enrolledClasses, joinClass } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSubject = searchParams.get('subject') || 'Math';

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [overviewJoinCode, setOverviewJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAttemptsAnalytics(activeSubject)
      .then((data) => {
        if (isMounted) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Analytics fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeSubject]);

  const handleOverviewJoin = async (e) => {
    e.preventDefault();
    const code = overviewJoinCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await apiJoinClass(code);
      if (res.success) {
        joinClass(code);
        setJoinMsg({ text: `Enrolled in ${res.class?.name || 'Class'}!`, type: 'success' });
        setOverviewJoinCode('');
      } else {
        setJoinMsg({ text: res.message || 'Unable to join', type: 'error' });
      }
    } catch {
      joinClass(code);
      setJoinMsg({ text: `Enrolled in class (${code})!`, type: 'success' });
      setOverviewJoinCode('');
    }
  };

  const displayName = user?.name || user?.fullName || 'Student';
  const displayGrade = user?.gradeLevel || user?.grade || 7;

  const hasData = analytics?.hasData === true && (analytics?.totalAttempts || 0) > 0;
  const topicMastery = (hasData && analytics?.topicMastery?.length > 0)
    ? analytics.topicMastery
    : (CURRICULUM_SYLLABUS[activeSubject] || CURRICULUM_SYLLABUS.Math);
  const weakTopics = hasData ? topicMastery.filter(t => t.status === 'needs_practice') : [];
  const masteredTopics = hasData ? topicMastery.filter(t => t.status === 'mastered') : [];
  const totalAttempts = hasData ? (analytics?.totalAttempts || 0) : 0;
  const currentStreak = hasData ? (analytics?.currentStreak || 0) : 0;
  const overallMastery = hasData ? (analytics?.overallMastery || 0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-16 w-full overflow-hidden">
      {/* Top Welcome & Subject Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(1.25rem,3.2vw,1.875rem)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Learning Mastery Dashboard
            </h1>
            <Badge variant="primary" size="sm">Live Cohort</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Student: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{displayName}</strong> • Grade {displayGrade}
          </p>
        </div>

        {/* Subject Switcher Pills */}
        <div className="flex items-center self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto justify-center">
          {['Math', 'Science'].map(s => (
            <button
              key={s}
              onClick={() => setSearchParams({ subject: s })}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                activeSubject === s
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-cyan-400 shadow-card'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s === 'Math' ? '📐 Mathematics' : '🔬 Science'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading student analytics...</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Fresh Learner Onboarding Notice */}
          {!hasData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-teal-50/90 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200/90 dark:border-indigo-800/80 rounded-3xl p-5 sm:p-8 shadow-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  0%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-black text-slate-900 dark:text-white leading-snug">
                      Welcome, {displayName}! 0% Baseline in {activeSubject}
                    </h2>
                    <Badge variant="cyan" size="sm">New Learner</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                    All curriculum competencies are initialized at 0%. Practice adaptive questions or join a classroom cohort to calibrate real-time mastery!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="primary"
                  iconRight={Play}
                  onClick={() => navigate(`/practice?subject=${activeSubject}`)}
                  className="flex-1 sm:flex-initial"
                >
                  Start Practice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  iconRight={ArrowRight}
                  onClick={() => navigate(`/select?subject=${activeSubject}`)}
                  className="flex-1 sm:flex-initial"
                >
                  Take Diagnostic
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  iconRight={School}
                  onClick={() => navigate('/classes')}
                  className="w-full sm:w-auto"
                >
                  Join Classroom
                </Button>
              </div>
            </motion.div>
          )}

          {/* Quick Option to Join Classroom Cohort (Shown in Overview) */}
          <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Join a School Classroom Cohort
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Have a 6-character code from your teacher? Enter it below or explore recommended cohorts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOverviewJoin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="e.g. MATH-7B"
                  value={overviewJoinCode}
                  onChange={(e) => setOverviewJoinCode(e.target.value.toUpperCase())}
                  className="px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-36"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="primary" type="submit" icon={UserCheck} className="flex-1 sm:flex-initial">
                    Join
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => navigate('/classes')} className="flex-1 sm:flex-initial">
                    View Classes →
                  </Button>
                </div>
              </form>
            </div>
            {joinMsg.text && (
              <p className={`text-xs mt-2 font-semibold ${joinMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {joinMsg.text}
              </p>
            )}
          </Card>

          {/* 4 Real Metric Cards: 1 column on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-5 bg-gradient-to-br from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Practice Volume</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-slate-900 dark:text-white font-mono block leading-none">
                {totalAttempts}
              </span>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold mt-2">Questions Answered</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/30">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Consecutive Streak</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-slate-900 dark:text-white font-mono block leading-none">
                {currentStreak}
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-2">Active correct streak 🔥</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/30">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mastery Ratio</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-slate-900 dark:text-white font-mono block leading-none">
                {masteredTopics.length} / {topicMastery.length || 5}
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-2">Topics Mastered (&ge;80%)</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-cyan-50/40 dark:from-slate-900 dark:to-cyan-950/30">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Accuracy</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-cyan-700 dark:text-cyan-400 font-mono block leading-none">
                {overallMastery}%
              </span>
              <p className="text-xs text-slate-500 mt-2">Overall Session Accuracy</p>
            </Card>
          </div>

          {/* Recommended Practice Banner for Weak Areas */}
          {weakTopics.length > 0 && weakTopics[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-subtle"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Action Required: Learning Gaps Detected
                  </span>
                </div>
                <h3 className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-bold text-slate-900 dark:text-white">
                  Focus Practice Recommended on: <strong className="text-indigo-700 dark:text-cyan-400 font-extrabold">{weakTopics[0]?.topic || 'Foundational Topic'}</strong>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Your accuracy on {weakTopics[0]?.topic || 'this topic'} is currently {weakTopics[0]?.mastery || 0}%. A quick adaptive session will target this foundational gap.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <Button
                  size="lg"
                  variant="glow"
                  iconRight={ArrowRight}
                  onClick={() => navigate(`/practice?subject=${activeSubject}&topic=${encodeURIComponent(weakTopics[0]?.topic || 'Fractions')}`)}
                  className="shadow-glow-primary font-bold text-xs sm:text-sm w-full sm:w-auto"
                >
                  Practice {weakTopics[0]?.topic || 'Topic'} Now
                </Button>
              </div>
            </motion.div>
          )}

          {/* TOPIC MASTERY HEATMAP / GRID (Auto-fit/minmax cards) */}
          {topicMastery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-[clamp(1rem,2vw,1.25rem)] font-bold text-slate-900 dark:text-white">Curriculum Topic Mastery Matrix</h3>
                    <p className="text-xs text-slate-500">Live topics mapped from your attempts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicMastery.map((t, idx) => (
                    <motion.div
                      key={t.topic || idx}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        t.status === 'mastered'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800'
                          : t.status === 'needs_practice'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800'
                          : 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm break-words">{t.topic}</span>
                          <Badge
                            variant={t.status === 'mastered' ? 'success' : t.status === 'needs_practice' ? 'warning' : 'primary'}
                            size="sm"
                            className="shrink-0"
                          >
                            {t.status === 'mastered' ? 'Mastered' : t.status === 'needs_practice' ? 'Needs Practice' : 'Proficient'}
                          </Badge>
                        </div>

                        <ProgressBar
                          percentage={t.mastery || 0}
                          label={`Accuracy: ${t.correct || 0}/${t.attempted || 0}`}
                          color={t.status === 'mastered' ? 'emerald' : t.status === 'needs_practice' ? 'amber' : 'indigo'}
                          className="my-3"
                        />
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Mastery: {t.mastery || 0}%
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/practice?subject=${activeSubject}&topic=${encodeURIComponent(t.topic || 'Fractions')}`)}
                          className="text-xs px-3 py-1.5 min-h-[44px] min-w-[44px]"
                        >
                          Practice
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity Feed (Safely guarded against null analytics) */}
          {analytics?.recentActivity && Array.isArray(analytics.recentActivity) && analytics.recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Learning Activity</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analytics.recentActivity.map((act) => (
                    <div key={act.id || act._id || Math.random()} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{act.topic || act.subject}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(act.time || act.timestamp || Date.now()).toLocaleDateString()} at {new Date(act.time || act.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={act.isCorrect ? 'success' : 'danger'} size="sm">
                          {act.isCorrect ? 'Correct' : 'Needs Review'}
                        </Badge>
                        <span className="capitalize text-slate-500 font-mono text-xs">
                          {act.type || 'Practice'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
