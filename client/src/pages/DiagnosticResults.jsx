import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Target 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CircularProgress } from '../components/ui/CircularProgress';
import { MOCK_TOPICS_MATH, MOCK_TOPICS_SCIENCE } from '../services/mockData';

export const DiagnosticResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';
  const scoreParam = searchParams.get('score');
  const overallScore = scoreParam ? Number(scoreParam) : 48;

  const topicsList = (subject || '').toLowerCase() === 'science' ? MOCK_TOPICS_SCIENCE : MOCK_TOPICS_MATH;

  // Chart data for topic-by-topic proficiency
  const chartData = topicsList.map(t => ({
    name: t.topic,
    accuracy: t.initialScore,
    status: t.status
  }));

  const weakTopics = topicsList.filter(t => t.status === 'needs_focus');

  React.useEffect(() => {
    if (overallScore >= 60) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  }, [overallScore]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <Badge variant="primary" size="md" className="mb-3">
          Diagnostic Assessment Complete
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Your {subject} Baseline Diagnosis
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
          We analyzed your answers across key curriculum areas. Here is exactly where you stand and what needs focused practice.
        </p>
      </div>

      {/* Hero Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-6 md:pb-0">
          <CircularProgress percentage={overallScore} size={150} label="Diagnostic Score" color="indigo" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">Baseline Calibration Score</p>
        </div>

        <div className="md:col-span-8">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diagnostic Summary</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
            You demonstrated foundational competence in some units, but have identified learning gaps in <strong className="text-slate-900 dark:text-white font-bold">{weakTopics.length > 0 ? weakTopics.map(w => w.topic).join(', ') : 'Foundational Topics'}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Identified {weakTopics.length} Focus Areas</span>
              <span>Our adaptive algorithm will now serve targeted practice starting at your foundational level.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic-by-Topic Breakdown (Recharts Horizontal Bar Chart) */}
      <Card className="p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Topic-by-Topic Accuracy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scores below 60% are flagged for priority practice</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &ge;80% Strong
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt;60% Focus Needed
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} width={110} />
              <Tooltip
                formatter={(val) => [`${val}% Accuracy`, 'Score']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.accuracy >= 80 ? '#10B981' : entry.accuracy >= 60 ? '#6366F1' : '#F59E0B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Call to Action: Start Practice */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card-hover">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
            Personalized Intervention Ready
          </span>
          <h3 className="text-2xl font-extrabold mt-1 mb-2">
            Ready to close your gap in {weakTopics[0]?.topic || 'Fractions'}?
          </h3>
          <p className="text-indigo-200 text-xs sm:text-sm">
            Practice 10 adaptive questions with instant step-by-step help.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            variant="glow"
            iconRight={ArrowRight}
            onClick={() => navigate(`/practice?subject=${subject}&topic=${encodeURIComponent(weakTopics[0]?.topic || 'Fractions')}`)}
            className="w-full sm:w-auto shadow-glow-primary font-bold"
          >
            Start Practice ({weakTopics[0]?.topic || 'Fractions'}) →
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(`/dashboard?subject=${subject}`)}
            className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
