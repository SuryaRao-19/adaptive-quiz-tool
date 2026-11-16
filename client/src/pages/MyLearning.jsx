import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Volume2,
  TrendingUp,
  Target
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { speechHelper } from '../utils/speechSynthesis';

export const MyLearning = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [speakingChapter, setSpeakingChapter] = useState(null);

  const gradeLevel = user?.gradeLevel || user?.grade || 10;

  // Curriculum Units aligned with Asian Public School CBSE Class 7 standards
  const curriculumData = {
    Mathematics: [
      {
        id: 'math_ch1',
        number: 1,
        title: 'Integers & Operational Sign Rules',
        mastery: 86,
        status: 'MASTERED',
        questionsCount: 45,
        objectives: [
          'Properties of addition, subtraction, multiplication and division of integers',
          'Multiplication and division sign propagation rules',
          'Solving real-world word problems using positive and negative integers'
        ]
      },
      {
        id: 'math_ch2',
        number: 2,
        title: 'Fractions, Decimals & Reciprocals',
        mastery: 78,
        status: 'DEVELOPING',
        questionsCount: 40,
        objectives: [
          'Multiplication of proper, improper, and mixed fractions',
          'Reciprocal division algorithm and lowest-terms reduction',
          'Decimal multiplication and division by powers of ten'
        ]
      },
      {
        id: 'math_ch3',
        number: 3,
        title: 'Simple Linear Equations in One Variable',
        mastery: 72,
        status: 'DEVELOPING',
        questionsCount: 42,
        objectives: [
          'Setting up algebraic equations from real-world statements',
          'Solving equations using the transposition method',
          'Verifying solutions through LHS = RHS substitution'
        ]
      },
      {
        id: 'math_ch4',
        number: 4,
        title: 'Lines, Angles & Transversal Properties',
        mastery: 65,
        status: 'DEVELOPING',
        questionsCount: 38,
        objectives: [
          'Complementary and supplementary angle pair calculations',
          'Vertically opposite angles and linear pairs on straight lines',
          'Alternate interior and corresponding angles formed by a transversal'
        ]
      }
    ],
    Science: [
      {
        id: 'sci_ch1',
        number: 1,
        title: 'Nutrition in Plants & Photosynthesis',
        mastery: 84,
        status: 'MASTERED',
        questionsCount: 38,
        objectives: [
          'Autotrophic vs heterotrophic modes of plant nutrition',
          'Photosynthesis mechanism: light capture, water splitting, and glucose synthesis',
          'Role of stomata, chlorophyll, and guard cells in gas exchange'
        ]
      },
      {
        id: 'sci_ch2',
        number: 2,
        title: 'Heat & Thermal Energy Transfer',
        mastery: 76,
        status: 'DEVELOPING',
        questionsCount: 42,
        objectives: [
          'Comparison of clinical and laboratory thermometers',
          'Conduction, convection, and radiation heat transfer modes',
          'Sea breeze and land breeze convection currents'
        ]
      },
      {
        id: 'sci_ch3',
        number: 3,
        title: 'Acids, Bases & Natural Indicators',
        mastery: 70,
        status: 'DEVELOPING',
        questionsCount: 36,
        objectives: [
          'Natural indicators: litmus paper, turmeric paste, and china rose',
          'Neutralisation reaction and salt/water formation',
          'Daily-life applications: treating ant stings and acidity'
        ]
      },
      {
        id: 'sci_ch4',
        number: 4,
        title: 'Physical and Chemical Changes',
        mastery: 68,
        status: 'DEVELOPING',
        questionsCount: 35,
        objectives: [
          'Distinguishing physical (reversible) from chemical (irreversible) changes',
          'Rusting of iron and methods of prevention (galvanisation)',
          'Crystallisation process for obtaining pure copper sulphate'
        ]
      }
    ]
  };

  const chapters = curriculumData[activeSubject] || [];
  const averageMastery = Math.round(
    chapters.reduce((acc, c) => acc + c.mastery, 0) / (chapters.length || 1)
  );

  const handleReadAloud = (chapter) => {
    if (speakingChapter === chapter.id) {
      speechHelper.stop();
      setSpeakingChapter(null);
    } else {
      setSpeakingChapter(chapter.id);
      const text = `Chapter ${chapter.number}: ${chapter.title}. Key learning objectives: ${chapter.objectives.join('. ')}.`;
      speechHelper.speak(text, () => setSpeakingChapter(null));
    }
  };

  const handleStartPractice = (chapter) => {
    navigate('/practice', {
      state: {
        subject: activeSubject,
        topic: chapter.title,
        grade: gradeLevel
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-elevated">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="indigo" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Asian Public School, Sohna
              </Badge>
              <Badge variant="neutral" className="bg-white/10 text-white border-white/20">
                Grade {gradeLevel} CBSE
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <span>My Learning Roadmap</span>
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Track chapter-wise competency mastery calibrated with Bayesian Knowledge Tracing. Focus on highlighted learning gaps to advance your grade standing.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[180px]">
            <span className="text-xs font-semibold text-cyan-200 uppercase tracking-wider block">Overall Mastery</span>
            <span className="text-4xl font-black text-white my-1 block">{averageMastery}%</span>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${averageMastery}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {['Mathematics', 'Science'].map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSubject === sub
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{sub}</span>
          </button>
        ))}
      </div>

      {/* Chapters Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chapters.map((ch) => (
          <Card key={ch.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shrink-0">
                  {ch.number}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      ch.status === 'MASTERED'
                        ? 'success'
                        : ch.status === 'DEVELOPING'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {ch.status.replace('_', ' ')}
                  </Badge>
                  <button
                    onClick={() => handleReadAloud(ch)}
                    title="Listen to chapter overview"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      speakingChapter === ch.id
                        ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                {ch.title}
              </h3>

              {/* Progress bar */}
              <div className="my-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">BKT Mastery Estimate</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{ch.mastery}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      ch.mastery >= 80 ? 'bg-emerald-500' : (ch.mastery >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                    }`}
                    style={{ width: `${ch.mastery}%` }}
                  />
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Curriculum Objectives</span>
                {ch.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {ch.questionsCount} bank questions available
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartPractice(ch)}
                className="flex items-center gap-1.5"
              >
                <span>Adaptive Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
