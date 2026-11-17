import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Eye,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MathRenderer } from '../components/ui/MathRenderer';
import { speechHelper } from '../utils/speechSynthesis';

export const MyRevision = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dueToday');
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(null);

  useEffect(() => {
    fetchRevisionSchedule();
  }, []);

  const fetchRevisionSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adaptive/revision-schedule');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setScheduleData(json.data);
        }
      }
    } catch (err) {
      console.warn('Failed to load revision schedule from API, using fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data if API is loading or empty, customized per student grade
  const effectiveGrade = Number(user?.gradeLevel || user?.grade || 7);

  const defaultSchedule = useMemo(() => {
    if (effectiveGrade === 3) {
      return {
        summary: {
          totalCards: 12,
          dueTodayCount: 3,
          upcomingCount: 5,
          overdueCount: 1,
          masteredCount: 3,
          retentionRate: 90
        },
        boxDistribution: { 1: 3, 2: 3, 3: 2, 4: 1, 5: 3 },
        dueToday: [
          {
            id: 'rev_g3_1',
            questionText: 'What is the place value of 7 in the number 472?',
            topic: '3-Digit Numbers & Place Value',
            subject: 'Mathematics',
            difficulty: 'easy',
            box: 1,
            options: ['70', '7', '700', '72'],
            correctAnswer: '70',
            explanation: 'In 472, the digit 7 is in the tens place. Its place value is 7 × 10 = 70.'
          },
          {
            id: 'rev_g3_2',
            questionText: 'Which sense organ helps us hear sounds and music?',
            topic: 'Sense Organs',
            subject: 'Environmental Studies',
            difficulty: 'easy',
            box: 1,
            options: ['Ears', 'Eyes', 'Nose', 'Tongue'],
            correctAnswer: 'Ears',
            explanation: 'Ears are the sensory organs specialized for detecting auditory sound waves.'
          },
          {
            id: 'rev_g3_3',
            questionText: 'What is the past tense form of the verb "sing"?',
            topic: 'Past Tense Forms',
            subject: 'English',
            difficulty: 'medium',
            box: 2,
            options: ['sang', 'singed', 'singing', 'song'],
            correctAnswer: 'sang',
            explanation: '"Sing" is an irregular verb. Its past tense form is "sang".'
          }
        ],
        upcoming: [
          {
            id: 'rev_g3_4',
            questionText: 'How many centimeters are in 2 meters? (1 m = 100 cm)',
            topic: 'Length Conversion',
            subject: 'Mathematics',
            box: 2,
            options: ['200 cm', '20 cm', '2000 cm', '2 cm'],
            correctAnswer: '200 cm',
            dueInDays: 2
          },
          {
            id: 'rev_g3_5',
            questionText: 'What is solid water called?',
            topic: 'States of Water',
            subject: 'Environmental Studies',
            box: 3,
            options: ['Ice', 'Steam', 'Vapour', 'Dew'],
            correctAnswer: 'Ice',
            dueInDays: 4
          }
        ],
        overdue: [
          {
            id: 'rev_g3_6',
            questionText: 'Calculate: 125 + 45 with regrouping (carrying over):',
            topic: 'Addition with Regrouping',
            subject: 'Mathematics',
            box: 1,
            options: ['170', '160', '180', '150'],
            correctAnswer: '170',
            daysOverdue: 1
          }
        ],
        completed: [
          {
            id: 'rev_g3_7',
            questionText: 'How many sides does a triangle have?',
            topic: '2D Shapes and Properties',
            subject: 'Mathematics',
            box: 5,
            options: ['3', '4', '5', '0'],
            correctAnswer: '3',
            explanation: 'A triangle is a closed 2D plane polygon with 3 straight sides.'
          }
        ],
        weakTopics: [
          {
            topic: 'Addition with Regrouping',
            errorRate: 42,
            recommendedAction: 'Practice carrying digits from the ones column into the tens column.'
          }
        ]
      };
    } else if (effectiveGrade === 10) {
      return {
        summary: {
          totalCards: 20,
          dueTodayCount: 4,
          upcomingCount: 8,
          overdueCount: 2,
          masteredCount: 6,
          retentionRate: 88
        },
        boxDistribution: { 1: 4, 2: 4, 3: 4, 4: 2, 5: 6 },
        dueToday: [
          {
            id: 'rev_g10_1',
            questionText: 'State the discriminant formula for ax² + bx + c = 0 and condition for two distinct real roots:',
            topic: 'Quadratic Equations',
            subject: 'Mathematics',
            difficulty: 'hard',
            box: 1,
            options: ['D = b² - 4ac > 0', 'D = b² - 4ac = 0', 'D = b² + 4ac < 0', 'D = b - 4ac > 0'],
            correctAnswer: 'D = b² - 4ac > 0',
            explanation: 'The discriminant D = b² - 4ac. When D > 0, the quadratic equation possesses two distinct real roots.'
          },
          {
            id: 'rev_g10_2',
            questionText: 'According to Ohm\'s Law, what is the formula relating Voltage (V), Current (I), and Resistance (R)?',
            topic: 'Electricity and Ohm\'s Law',
            subject: 'Science',
            difficulty: 'medium',
            box: 2,
            options: ['V = I × R', 'V = I / R', 'I = V × R', 'R = V × I'],
            correctAnswer: 'V = I × R',
            explanation: 'Ohm\'s Law states that potential difference V across a conductor is directly proportional to current I: V = IR.'
          },
          {
            id: 'rev_g10_3',
            questionText: 'What is the nth term formula of an Arithmetic Progression?',
            topic: 'Arithmetic Progressions',
            subject: 'Mathematics',
            difficulty: 'medium',
            box: 2,
            options: ['a_n = a + (n - 1)d', 'a_n = a + nd', 'a_n = a - (n - 1)d', 'a_n = n(a + d)'],
            correctAnswer: 'a_n = a + (n - 1)d',
            explanation: 'The general nth term of an AP is given by a_n = a + (n - 1)d.'
          }
        ],
        upcoming: [
          {
            id: 'rev_g10_4',
            questionText: 'What type of corrective lens is used to treat myopia (near-sightedness)?',
            topic: 'Light and Optics',
            subject: 'Science',
            box: 3,
            options: ['Diverging concave lens', 'Converging convex lens', 'Bifocal lens', 'Cylindrical lens'],
            correctAnswer: 'Diverging concave lens',
            dueInDays: 3
          }
        ],
        overdue: [
          {
            id: 'rev_g10_5',
            questionText: 'Define the chemical formula of Baking Soda:',
            topic: 'Chemical Reactions and Redox',
            subject: 'Science',
            box: 1,
            options: ['NaHCO3', 'Na2CO3', 'CaOCl2', 'CaSO4'],
            correctAnswer: 'NaHCO3',
            daysOverdue: 2
          }
        ],
        completed: [
          {
            id: 'rev_g10_6',
            questionText: 'Evaluate the trigonometric identity: sin²(θ) + cos²(θ)',
            topic: 'Introduction to Trigonometry',
            subject: 'Mathematics',
            box: 5,
            options: ['1', '0', '2', 'tan(θ)'],
            correctAnswer: '1',
            explanation: 'Fundamental Pythagorean identity: sin²(θ) + cos²(θ) = 1.'
          }
        ],
        weakTopics: [
          {
            topic: 'Quadratic Equations',
            errorRate: 48,
            recommendedAction: 'Master discriminant root analysis and quadratic formula derivation.'
          }
        ]
      };
    } else {
      // Grade 7 default
      return {
        summary: {
          totalCards: 18,
          dueTodayCount: 4,
          upcomingCount: 6,
          overdueCount: 2,
          masteredCount: 6,
          retentionRate: 86
        },
        boxDistribution: { 1: 4, 2: 4, 3: 4, 4: 2, 5: 6 },
        dueToday: [
          {
            id: 'rev_g7_1',
            questionText: 'Evaluate the product of integers: (-4) × (-6) = ?',
            topic: 'Integer Multiplication',
            subject: 'Mathematics',
            difficulty: 'medium',
            box: 1,
            options: ['+24', '-24', '-10', '+10'],
            correctAnswer: '+24',
            explanation: 'The product of two negative integers is always positive: (-4) × (-6) = +24.'
          },
          {
            id: 'rev_g7_2',
            questionText: 'Which cell organelle regulates the opening and closing of leaf stomata?',
            topic: 'Plant and Animal Nutrition',
            subject: 'Science',
            difficulty: 'medium',
            box: 2,
            options: ['Guard cells', 'Epidermal cells', 'Xylem vessels', 'Phloem tubes'],
            correctAnswer: 'Guard cells',
            explanation: 'Changes in turgor pressure of kidney-shaped guard cells control the stomatal aperture.'
          },
          {
            id: 'rev_g7_3',
            questionText: 'Solve the simple linear equation: 3x - 7 = 14',
            topic: 'Simple Linear Equations',
            subject: 'Mathematics',
            difficulty: 'medium',
            box: 1,
            options: ['x = 7', 'x = 3', 'x = 21', 'x = 5'],
            correctAnswer: 'x = 7',
            explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.'
          }
        ],
        upcoming: [
          {
            id: 'rev_g7_4',
            questionText: 'Litmus paper turns from blue to RED when exposed to:',
            topic: 'Chemical Indicators & Neutralization',
            subject: 'Science',
            box: 3,
            options: ['An acidic solution', 'A basic solution', 'Pure neutral water', 'Common salt'],
            correctAnswer: 'An acidic solution',
            dueInDays: 3
          }
        ],
        overdue: [
          {
            id: 'rev_g7_5',
            questionText: 'State the Angle Sum Property of any triangle:',
            topic: 'Triangles and Properties',
            subject: 'Mathematics',
            box: 1,
            options: ['Sum of interior angles = 180°', 'Sum = 360°', 'Sum = 90°', 'Sum = 270°'],
            correctAnswer: 'Sum of interior angles = 180°',
            daysOverdue: 2
          }
        ],
        completed: [
          {
            id: 'rev_g7_6',
            questionText: 'What is the SI unit of speed?',
            topic: 'Physics Foundations',
            subject: 'Science',
            box: 5,
            options: ['m/s', 'km/h', 'miles/min', 'cm/s'],
            correctAnswer: 'm/s',
            explanation: 'Distance is measured in meters (m) and time in seconds (s), making m/s the standard SI unit.'
          }
        ],
        weakTopics: [
          {
            topic: 'Simple Linear Equations',
            errorRate: 40,
            recommendedAction: 'Practice transposing terms across the equals sign with sign inversion.'
          }
        ]
      };
    }
  }, [effectiveGrade]);

  const schedule = scheduleData || defaultSchedule || {};
  const summary = schedule.summary || {
    totalCards: 18,
    dueTodayCount: 4,
    upcomingCount: 6,
    overdueCount: 2,
    masteredCount: 6,
    retentionRate: 86
  };
  const boxDistribution = schedule.boxDistribution || { 1: 4, 2: 4, 3: 4, 4: 2, 5: 6 };
  const currentCards = schedule[activeTab] || [];
  const activeCard = currentCards[currentCardIndex] || currentCards[0] || null;

  const handleReviewCard = async (isCorrect) => {
    if (!activeCard) return;

    try {
      await fetch('/api/adaptive/review-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card: activeCard, isCorrect })
      });
    } catch (err) {
      console.warn('API review failed, updating local UI:', err);
    }

    setReviewSuccessMessage(
      isCorrect 
        ? `Card promoted to Box ${Math.min(5, (activeCard.box || 1) + 1)}! Review interval extended.`
        : 'Card demoted to Box 1 for reinforcement tomorrow.'
    );

    setTimeout(() => {
      setReviewSuccessMessage(null);
      setIsAnswerRevealed(false);
      if (currentCardIndex < currentCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
      }
    }, 1200);
  };

  const handleReadAloud = (text) => {
    speechHelper.speak(text);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="indigo" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Leitner 5-Box Spaced Repetition
              </Badge>
              <Badge variant="neutral" className="bg-white/10 text-white border-white/20">
                Retention Rate: {summary.retentionRate}%
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-400" />
              <span>My Revision Deck</span>
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Scientifically scheduled spaced reviews. Correct answers advance questions across 1, 3, 7, 14, and 30-day intervals to lock concepts into long-term memory.
            </p>
          </div>

          {/* Box Distribution Ladder */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2 text-center">
              Leitner Memory Boxes
            </span>
            <div className="flex items-end gap-2 justify-center">
              {[
                { box: 1, label: '1 Day', count: boxDistribution[1] || 0 },
                { box: 2, label: '3 Days', count: boxDistribution[2] || 0 },
                { box: 3, label: '7 Days', count: boxDistribution[3] || 0 },
                { box: 4, label: '14 Days', count: boxDistribution[4] || 0 },
                { box: 5, label: '30 Days', count: boxDistribution[5] || 0 }
              ].map(item => (
                <div key={item.box} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-300">{item.count}</span>
                  <div 
                    className="w-7 rounded-t-lg bg-indigo-500 transition-all"
                    style={{ height: `${Math.max(16, item.count * 8)}px` }}
                  />
                  <span className="text-[9px] font-bold text-indigo-200">B{item.box}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { key: 'dueToday', label: `Due Today (${summary.dueTodayCount || schedule.dueToday?.length || 0})`, icon: Clock },
          { key: 'upcoming', label: `Upcoming (${summary.upcomingCount || schedule.upcoming?.length || 0})`, icon: CheckCircle2 },
          { key: 'overdue', label: `Overdue (${summary.overdueCount || schedule.overdue?.length || 0})`, icon: AlertTriangle },
          { key: 'weakTopics', label: 'Weak Topics', icon: BrainCircuit },
          { key: 'completed', label: `Completed (${summary.masteredCount || schedule.completed?.length || 0})`, icon: Check }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentCardIndex(0);
              setIsAnswerRevealed(false);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Review Card Mode */}
      {activeTab !== 'weakTopics' && activeCard ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-2">
            <span>Card {currentCardIndex + 1} of {currentCards.length}</span>
            <span className="flex items-center gap-1">
              <Badge variant="indigo">Box {activeCard.box || 1}</Badge>
              <Badge variant="neutral">{activeCard.subject || 'General'}</Badge>
            </span>
          </div>

          <Card className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden bg-white dark:bg-slate-900">
            {/* Feedback Toast */}
            {reviewSuccessMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-20 flex items-center justify-center p-6 text-center text-white"
              >
                <div className="space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="font-bold text-base">{reviewSuccessMessage}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {activeCard.topic}
                </span>
                <button
                  onClick={() => handleReadAloud(activeCard.questionText)}
                  title="Read question aloud"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Question Text */}
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                <MathRenderer content={activeCard.questionText} />
              </div>

              {/* Options or Answer Flip */}
              {isAnswerRevealed ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3"
                >
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Correct Answer</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    {activeCard.correctAnswer || 'See Explanation'}
                  </p>
                  {activeCard.explanation && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-indigo-100 dark:border-indigo-900/40 pt-2">
                      <MathRenderer content={activeCard.explanation} />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Recall the core principle or solution in your mind before revealing.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsAnswerRevealed(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Answer & Explanation</span>
                  </Button>
                </div>
              )}

              {/* Review Buttons */}
              {isAnswerRevealed && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleReviewCard(false)}
                      className="border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900 dark:text-rose-400 flex items-center justify-center gap-2 py-3"
                    >
                      <X className="w-4 h-4" />
                      <span>Need More Practice (B1)</span>
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => handleReviewCard(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3"
                    >
                      <Check className="w-4 h-4" />
                      <span>I Remembered (Advance Box)</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = `/practice?topic=${encodeURIComponent(activeCard.topic)}&autostart=true`}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Practise Similar Question</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/solutions`}
                      className="text-xs flex items-center gap-1.5 text-indigo-600 dark:text-cyan-400"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View in Solutions Hub</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : activeTab === 'weakTopics' ? (
        /* Weak Topics Remedial View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(schedule.weakTopics || [
            {
              topic: 'Simple Linear Equations',
              errorRate: 40,
              recommendedAction: 'Practice transposing terms across the equals sign with sign inversion.'
            }
          ]).map((wt, i) => (
            <Card key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="error" className="bg-rose-50 text-rose-600 border-rose-200">
                  {wt.errorRate}% Error Rate
                </Badge>
                <span className="text-xs text-slate-400 font-semibold">Diagnostic Priority</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {wt.topic}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {wt.recommendedAction}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = `/practice?topic=${encodeURIComponent(wt.topic)}`}
                className="w-full flex items-center justify-center gap-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Launch Targeted Diagnostic Drill</span>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 rounded-3xl text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-500 mt-1">
            No cards currently pending review in this deck. Check back tomorrow or launch adaptive practice to add new cards.
          </p>
        </Card>
      )}
    </div>
  );
};
