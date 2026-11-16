import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  Sparkles,
  BrainCircuit,
  HelpCircle,
  BookOpen,
  Layers,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Trash2,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Award,
  Send,
  Save,
  CheckCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  generateAIQuiz,
  explainStudentAnswer,
  getPersonalizedStudyPlan,
  generateAIPracticeTest,
  consultTeacherAssistant,
  getAIPerformanceInsights,
  approveAIContent,
  getAIUsageTelemetry
} from '../services/aiService';

const TOPIC_PRESETS = {
  Math: [
    'Fractions',
    'Decimals & Percentages',
    'Ratios & Proportions',
    'Basic Algebra',
    'Geometry & Angles',
    'Linear Equations'
  ],
  Science: [
    'Forces & Motion',
    'Cells & Living Organisms',
    'Matter & Chemical Reactions',
    'Ecosystems & Energy Flow',
    'Heat Transfer & Thermodynamics',
    'Acids, Bases & Salts'
  ]
};

export const AILearningHub = () => {
  const { user, role } = useContext(AuthContext);
  const isTeacher = role === 'teacher' || role === 'admin';

  // Active Tab: 'quiz' | 'explain' | 'plan' | 'practice' | 'teacher' | 'insights'
  const [activeTab, setActiveTab] = useState(isTeacher ? 'quiz' : 'explain');

  // Usage & Telemetry State
  const [usageTelemetry, setUsageTelemetry] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopy = (text, id = 'default') => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load telemetry
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await getAIUsageTelemetry();
        if (data.success) {
          setUsageTelemetry(data);
        }
      } catch (e) {
        // Non-fatal
      }
    };
    fetchTelemetry();
  }, []);

  // =========================================================================
  // Tab 1: AI Quiz Generator State
  // =========================================================================
  const [quizSubject, setQuizSubject] = useState('Math');
  const [quizTopic, setQuizTopic] = useState('Fractions');
  const [quizCustomTopic, setQuizCustomTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(5);
  const [quizFormat, setQuizFormat] = useState('MCQ');
  const [quizGrade, setQuizGrade] = useState(user?.grade || user?.gradeLevel || 7);
  const [quizObjective, setQuizObjective] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizNotice, setQuizNotice] = useState('');
  const [approvedQuestions, setApprovedQuestions] = useState(new Set());

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizError('');
    setQuizNotice('');
    try {
      const topicToUse = quizCustomTopic.trim() || quizTopic;
      const res = await generateAIQuiz({
        subject: quizSubject,
        topic: topicToUse,
        difficulty: quizDifficulty,
        count: quizCount,
        format: quizFormat,
        gradeLevel: quizGrade,
        learningObjective: quizObjective
      });

      if (res.success && Array.isArray(res.questions)) {
        setQuizQuestions(res.questions);
        if (res.notice) setQuizNotice(res.notice);
        showToast(`Generated ${res.questions.length} questions! Review and edit below.`);
      } else {
        setQuizError(res.message || 'Failed to generate questions.');
      }
    } catch (err) {
      setQuizError(err.response?.data?.message || err.message || 'Error communicating with AI service.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleApproveQuizItem = async (index) => {
    const q = quizQuestions[index];
    try {
      await approveAIContent({
        contentId: `approved_direct_${Date.now()}`,
        questionsToPublish: [q]
      });
      setApprovedQuestions(prev => new Set(prev).add(index));
      showToast('Question approved and published to the Question Bank!');
    } catch (err) {
      showToast('Error publishing question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateQuizQuestion = (index, field, value) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // =========================================================================
  // Tab 2: Explain My Answer State
  // =========================================================================
  const [explainQuestion, setExplainQuestion] = useState('Calculate 1/3 + 1/6 and reduce to lowest terms.');
  const [explainOptions, setExplainOptions] = useState(['1/2', '2/9', '2/6', '3/9']);
  const [explainStudentAns, setExplainStudentAns] = useState('2/9');
  const [explainCorrectAns, setExplainCorrectAns] = useState('1/2');
  const [explainSubject, setExplainSubject] = useState('Math');
  const [explainTopic, setExplainTopic] = useState('Fractions');
  const [explanationData, setExplanationData] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState('');

  const handleRequestExplanation = async () => {
    setExplainLoading(true);
    setExplainError('');
    try {
      const res = await explainStudentAnswer({
        questionText: explainQuestion,
        options: explainOptions,
        studentAnswer: explainStudentAns,
        correctAnswer: explainCorrectAns,
        subject: explainSubject,
        topic: explainTopic,
        gradeLevel: user?.grade || 7,
        isTestMode: false
      });
      if (res.success && res.explanation) {
        setExplanationData(res.explanation);
      } else {
        setExplainError(res.message || 'Failed to generate answer explanation.');
      }
    } catch (err) {
      setExplainError(err.response?.data?.message || err.message || 'AI service error.');
    } finally {
      setExplainLoading(false);
    }
  };

  // =========================================================================
  // Tab 3: Personalized Study Plan State
  // =========================================================================
  const [planSubject, setPlanSubject] = useState('Mathematics & Science');
  const [studyPlanData, setStudyPlanData] = useState(null);
  const [planMetrics, setPlanMetrics] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  const handleGenerateStudyPlan = async () => {
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await getPersonalizedStudyPlan({
        subject: planSubject,
        gradeLevel: user?.grade || 7
      });
      if (res.success && res.studyPlan) {
        setStudyPlanData(res.studyPlan);
        if (res.topicMetrics) setPlanMetrics(res.topicMetrics);
        showToast('Personalized study plan created based on your actual performance!');
      } else {
        setPlanError(res.message || 'Could not generate study plan.');
      }
    } catch (err) {
      setPlanError(err.response?.data?.message || err.message || 'Error generating plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  // =========================================================================
  // Tab 4: Practice Test Generator State
  // =========================================================================
  const [practiceSubject, setPracticeSubject] = useState('Math');
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceDifficulty, setPracticeDifficulty] = useState('medium');
  const [practiceMinutes, setPracticeMinutes] = useState(15);
  const [practiceCount, setPracticeCount] = useState(5);
  const [practiceTestData, setPracticeTestData] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState('');

  const handleGeneratePracticeTest = async () => {
    setPracticeLoading(true);
    setPracticeError('');
    try {
      const res = await generateAIPracticeTest({
        subject: practiceSubject,
        topic: practiceTopic,
        difficulty: practiceDifficulty,
        timeLimitMinutes: practiceMinutes,
        questionCount: practiceCount,
        gradeLevel: user?.grade || 7
      });
      if (res.success && res.practiceTest) {
        setPracticeTestData(res.practiceTest);
        showToast('Balanced practice test generated!');
      } else {
        setPracticeError(res.message || 'Failed to generate practice test.');
      }
    } catch (err) {
      setPracticeError(err.response?.data?.message || err.message || 'AI service error.');
    } finally {
      setPracticeLoading(false);
    }
  };

  // =========================================================================
  // Tab 5: Teacher AI Assistant State
  // =========================================================================
  const [teacherAction, setTeacherAction] = useState('lesson_activity');
  const [teacherSubject, setTeacherSubject] = useState('Math');
  const [teacherTopic, setTeacherTopic] = useState('Fractions');
  const [teacherCustomTopic, setTeacherCustomTopic] = useState('');
  const [teacherGrade, setTeacherGrade] = useState(7);
  const [teacherPrompt, setTeacherPrompt] = useState('');
  const [teacherResponse, setTeacherResponse] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  const handleConsultTeacherAssistant = async () => {
    setTeacherLoading(true);
    setTeacherError('');
    try {
      const res = await consultTeacherAssistant({
        actionType: teacherAction,
        subject: teacherSubject,
        topic: teacherCustomTopic.trim() || teacherTopic,
        gradeLevel: teacherGrade,
        promptDetails: teacherPrompt
      });
      if (res.success && res.data) {
        setTeacherResponse(res.data);
        showToast('Instructional guide prepared!');
      } else {
        setTeacherError(res.message || 'Failed to generate assistant guidance.');
      }
    } catch (err) {
      setTeacherError(err.response?.data?.message || err.message || 'Teacher assistant error.');
    } finally {
      setTeacherLoading(false);
    }
  };

  // =========================================================================
  // Tab 6: Performance Insights State
  // =========================================================================
  const [insightsSubject, setInsightsSubject] = useState('All');
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  const handleFetchInsights = async () => {
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const res = await getAIPerformanceInsights({
        subject: insightsSubject,
        gradeLevel: user?.grade || 7
      });
      if (res.success && res.insights) {
        setInsightsData(res);
        showToast('Performance telemetry analyzed!');
      } else {
        setInsightsError(res.message || 'Failed to retrieve performance insights.');
      }
    } catch (err) {
      setInsightsError(err.response?.data?.message || err.message || 'Telemetry analysis error.');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-elevated flex items-center gap-3 text-xs font-bold border border-slate-700 dark:border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 dark:text-indigo-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 md:p-10 shadow-elevated border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Google Gemini AI Engine • Production Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              AI Learning & Teaching Hub
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Curriculum-aligned intelligence powered by Google Gemini and authoritative PostgreSQL telemetry. Generate balanced assessments, Socratic step-by-step diagnostic feedback, and actionable learning insights.
            </p>
          </div>

          {/* Telemetry Stats Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Configured Model:</span>
              <span className="font-mono font-bold text-cyan-300">
                {usageTelemetry?.model || 'gemini-3.8-flash'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Service Status:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Est. Session Cost:</span>
              <span className="font-mono font-bold text-amber-300">
                ${usageTelemetry?.usage?.estimatedCostUSD || '0.0000'} USD
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>UN SDG 4 Aligned</span>
              <span className="bg-indigo-500/30 px-2 py-0.5 rounded text-indigo-200 font-mono">Server Proxy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'quiz', label: 'AI Quiz Generator', icon: Layers, teacherOnly: true },
          { id: 'explain', label: 'Explain My Answer', icon: HelpCircle },
          { id: 'plan', label: 'My Learning Plan', icon: BrainCircuit },
          { id: 'practice', label: 'Practice Test Generator', icon: Clock },
          { id: 'teacher', label: 'Teacher AI Assistant', icon: GraduationCap, teacherOnly: true },
          { id: 'insights', label: 'Performance Insights', icon: BarChart3 }
        ]
          .filter(t => !t.teacherOnly || isTeacher)
          .map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-glow-primary scale-102'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: AI QUIZ GENERATOR (Teacher & Admin) */}
      {/* =================================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  AI Question Generator & Curator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate standards-aligned questions with plausible distractors, explanations, and step-by-step solutions.
                </p>
              </div>
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 dark:border-indigo-800">
                Teacher Review Required
              </Badge>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => {
                    setQuizSubject(e.target.value);
                    setQuizTopic(TOPIC_PRESETS[e.target.value][0]);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Math">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topic Preset</label>
                <select
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TOPIC_PRESETS[quizSubject].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Or Custom Subtopic</label>
                <input
                  type="text"
                  placeholder="e.g. Mixed Number Multiplication"
                  value={quizCustomTopic}
                  onChange={(e) => setQuizCustomTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy (Foundational)</option>
                  <option value="medium">Medium (Procedural)</option>
                  <option value="hard">Hard (Multi-Step)</option>
                  <option value="very_hard">Very Hard (Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={quizCount}
                  onChange={(e) => setQuizCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Question Format</label>
                <select
                  value={quizFormat}
                  onChange={(e) => setQuizFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MCQ">Multiple Choice (4 options)</option>
                  <option value="true_false">True / False</option>
                  <option value="multiple_select">Multiple Select</option>
                  <option value="conceptual">Conceptual Question</option>
                  <option value="application">Application-Based</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grade Level</label>
                <select
                  value={quizGrade}
                  onChange={(e) => setQuizGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Learning Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Master Least Common Denominator"
                  value={quizObjective}
                  onChange={(e) => setQuizObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {quizError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{quizError}</span>
              </div>
            )}

            {/* Notice */}
            {quizNotice && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{quizNotice}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-glow-primary flex items-center gap-2 text-xs"
              >
                {quizLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Questions with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Quiz Questions</span>
                  </>
                )}
              </Button>

              {quizQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleCopy(quizQuestions, 'quiz_json')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  {copiedId === 'quiz_json' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>Export JSON</span>
                </button>
              )}
            </div>
          </Card>

          {/* Generated Questions List (Editable & Reviewable) */}
          {quizQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Generated Questions ({quizQuestions.length})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                    Pending Review
                  </span>
                </h4>
                <p className="text-xs text-slate-400">Questions are editable inline. Click approve to publish to the question bank.</p>
              </div>

              {quizQuestions.map((q, idx) => {
                const isApproved = approvedQuestions.has(idx);
                return (
                  <Card
                    key={idx}
                    className={`p-6 bg-white dark:bg-slate-900 border transition-all ${
                      isApproved
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {q.topic} • {q.difficulty}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {q.marks || 1} mark(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <CheckCheck className="w-4 h-4" />
                            Approved & Saved
                          </span>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleApproveQuizItem(idx)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-subtle flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Approve & Save</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Editable Question Text */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Question Prompt</label>
                        <textarea
                          rows="2"
                          value={q.question || q.questionText || ''}
                          onChange={(e) => handleUpdateQuizQuestion(idx, 'question', e.target.value)}
                          className="w-full mt-1 p-3 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Options List */}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase">Answer Options</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = Number(q.correctAnswerIndex) === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300'
                                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="font-mono text-slate-400 mr-2">({String.fromCharCode(65 + optIdx)})</span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...q.options];
                                      newOpts[optIdx] = e.target.value;
                                      handleUpdateQuizQuestion(idx, 'options', newOpts);
                                    }}
                                    className="bg-transparent flex-1 focus:outline-none"
                                  />
                                  {isCorrect && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation & Steps */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Pedagogical Explanation:
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                        {q.misconception && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            <span className="font-bold">Avoided Misconception:</span> {q.misconception}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: EXPLAIN MY ANSWER (Student & Teacher) */}
      {/* =================================================================== */}
      {activeTab === 'explain' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 md:p-8 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                Socratic Diagnostic Explainer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit any question you struggled with to receive an empathetic breakdown of your specific misconception.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Question Statement</label>
                <textarea
                  rows="3"
                  value={explainQuestion}
                  onChange={(e) => setExplainQuestion(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Submitted Answer</label>
                  <input
                    type="text"
                    value={explainStudentAns}
                    onChange={(e) => setExplainStudentAns(e.target.value)}
                    placeholder="e.g. 2/9"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Authoritative Correct Answer</label>
                  <input
                    type="text"
                    value={explainCorrectAns}
                    onChange={(e) => setExplainCorrectAns(e.target.value)}
                    placeholder="e.g. 1/2"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={explainSubject}
                    onChange={(e) => setExplainSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  >
                    <option value="Math">Mathematics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    value={explainTopic}
                    onChange={(e) => setExplainTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {explainError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {explainError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleRequestExplanation}
                disabled={explainLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-glow-primary text-xs flex items-center justify-center gap-2"
              >
                {explainLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Misconception...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Socratic Explanation</span>
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Explanation Output Card */}
          <div>
            {explanationData ? (
              <Card className="p-6 md:p-8 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Conceptual Breakdown</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(explanationData, 'explain')}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedId === 'explain' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>

                {/* Why Incorrect Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block">
                    Why Your Choice Was Incorrect:
                  </span>
                  <p>{explanationData.whyIncorrect}</p>
                </div>

                {/* Core Concept Explanation */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Underlying Concept:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {explanationData.explanation}
                  </p>
                </div>

                {/* Step-by-Step Solution */}
                {Array.isArray(explanationData.stepByStepSolution) && (
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Step-by-Step Solution:</span>
                    <div className="space-y-1.5">
                      {explanationData.stepByStepSolution.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analogy & Practice */}
                {explanationData.simpleExample && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-indigo-600 dark:text-cyan-400">💡 Intuitive Analogy:</span>
                    <p className="text-slate-600 dark:text-slate-300">{explanationData.simpleExample}</p>
                  </div>
                )}

                {explanationData.relatedPracticeQuestion && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/50 dark:to-cyan-950/50 border border-indigo-200 dark:border-indigo-900 text-xs space-y-2">
                    <span className="font-extrabold text-indigo-700 dark:text-cyan-300 uppercase tracking-wider text-[10px]">
                      🎯 Try This Related Practice Problem:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {explanationData.relatedPracticeQuestion.question}
                    </p>
                    {explanationData.relatedPracticeQuestion.hint && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hint: {explanationData.relatedPracticeQuestion.hint}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <h5 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Awaiting Question Input</h5>
                <p className="text-xs max-w-sm">Submit your problem on the left to receive an encouraging, step-by-step Socratic walkthrough.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PERSONALIZED LEARNING PLAN (Student & Teacher) */}
      {/* =================================================================== */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  Personalized Study Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Synthesized from verified assessment attempts in PostgreSQL. Uncovers weak points and maps out daily targets.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleGenerateStudyPlan}
                disabled={planLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-glow-primary text-xs flex items-center gap-2"
              >
                {planLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Actionable Study Plan</span>
              </Button>
            </div>

            {planError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {planError}
              </div>
            )}

            {/* Diagnostic Topic Performance Bar */}
            {planMetrics.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Authoritative Performance Diagnosis (From Database)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {planMetrics.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">{m.topic}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.accuracyPercentage >= 75
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : m.accuracyPercentage >= 50
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {m.accuracyPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            m.accuracyPercentage >= 75 ? 'bg-emerald-500' : m.accuracyPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${m.accuracyPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Plan Content Output */}
            {studyPlanData && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-1">Diagnostic Summary</span>
                  <p>{studyPlanData.studentSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Weak Topics */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-2">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Focus Areas (Weak Topics)
                    </span>
                    <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {studyPlanData.weakTopics?.map((w, idx) => (
                        <li key={idx} className="font-semibold">{w}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Strong Topics */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Consolidated Strengths
                    </span>
                    <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {studyPlanData.strongTopics?.map((s, idx) => (
                        <li key={idx} className="font-semibold">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Multi-Day Actionable Schedule */}
                {Array.isArray(studyPlanData.studyPlan) && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                      Multi-Day Action Plan
                    </h5>
                    <div className="space-y-2">
                      {studyPlanData.studyPlan.map((d, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-indigo-600 dark:text-cyan-400 block">{d.day}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{d.focus}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {d.durationMinutes} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PRACTICE TEST GENERATOR */}
      {/* =================================================================== */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  Personalized Practice Test Generator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate timed, balanced practice assessments specifically targeting your weaker topics.
                </p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                Informal Practice Only
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={practiceSubject}
                  onChange={(e) => setPracticeSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="Math">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Optional Topic Override</label>
                <input
                  type="text"
                  placeholder="Auto-targets weak topics if blank"
                  value={practiceTopic}
                  onChange={(e) => setPracticeTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                <select
                  value={practiceDifficulty}
                  onChange={(e) => setPracticeDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="easy">Easy (Foundations)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="hard">Hard (Challenge)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={practiceMinutes}
                  onChange={(e) => setPracticeMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {practiceError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {practiceError}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGeneratePracticeTest}
              disabled={practiceLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-glow-primary text-xs flex items-center gap-2"
            >
              {practiceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Build Practice Assessment</span>
            </Button>
          </Card>

          {/* Practice Test Questions Output */}
          {practiceTestData && (
            <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {practiceTestData.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Allocated Time: {practiceTestData.timeLimitMinutes} minutes • {practiceTestData.totalQuestions} questions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(practiceTestData, 'practice')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  {copiedId === 'practice' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Test</span>
                </button>
              </div>

              <div className="space-y-4">
                {practiceTestData.questions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-600 dark:text-cyan-400">
                        Item {idx + 1} • {q.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
                        {q.marks || 1} mark
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {q.question || q.questionText}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            Number(q.correctAnswerIndex) === oIdx
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-semibold text-emerald-800 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-mono text-slate-400 mr-2">({String.fromCharCode(65 + oIdx)})</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: TEACHER AI ASSISTANT (Teacher & Admin Only) */}
      {/* =================================================================== */}
      {activeTab === 'teacher' && isTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 md:p-8 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-1">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                Instructional AI Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pedagogical coaching, lesson plans, and remediation strategies aligned with UN SDG 4.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Action Category</label>
                <select
                  value={teacherAction}
                  onChange={(e) => setTeacherAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="lesson_activity">45-Min Inquiry Lesson Plan</option>
                  <option value="concept_explanation">Concept Explanation & Analogies</option>
                  <option value="remediation_strategy">Differentiated Remediation</option>
                  <option value="revision_worksheet">Revision Worksheet Blueprint</option>
                  <option value="classroom_summary">Classroom Performance Synthesis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={teacherSubject}
                  onChange={(e) => {
                    setTeacherSubject(e.target.value);
                    setTeacherTopic(TOPIC_PRESETS[e.target.value][0]);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="Math">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                <select
                  value={teacherTopic}
                  onChange={(e) => setTeacherTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  {TOPIC_PRESETS[teacherSubject].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Special Requirements / Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Focus on hands-on manipulatives or visual bar models..."
                  value={teacherPrompt}
                  onChange={(e) => setTeacherPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {teacherError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {teacherError}
                </div>
              )}

              <Button
                type="button"
                onClick={handleConsultTeacherAssistant}
                disabled={teacherLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-glow-primary text-xs flex items-center justify-center gap-2"
              >
                {teacherLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Teacher Resource</span>
              </Button>
            </div>
          </Card>

          {/* Teacher Assistant Output */}
          <div className="lg:col-span-2">
            {teacherResponse ? (
              <Card className="p-6 md:p-8 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {teacherResponse.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                      Category: {teacherResponse.responseType}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(teacherResponse.content, 'teacher')}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedId === 'teacher' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-sans">
                  {teacherResponse.content}
                </div>

                {Array.isArray(teacherResponse.suggestions) && teacherResponse.suggestions.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Classroom Delivery Suggestions:</span>
                    <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                      {teacherResponse.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <h5 className="font-bold text-slate-600 dark:text-slate-400 text-sm">Select an Action to Begin</h5>
                <p className="text-xs max-w-sm">Choose a category on the left to generate lesson activities, remediation sequences, or concept guides.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: PERFORMANCE INSIGHTS & TELEMETRY */}
      {/* =================================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  Authoritative Performance Telemetry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PostgreSQL-verified response telemetry synthesized by Gemini into strategic teaching and revision priorities.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleFetchInsights}
                disabled={insightsLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-glow-primary text-xs flex items-center gap-2"
              >
                {insightsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span>Analyze Telemetry</span>
              </Button>
            </div>

            {insightsError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {insightsError}
              </div>
            )}

            {insightsData && (
              <div className="space-y-6">
                {/* Verified Data Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Authoritative Data Source</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{insightsData.verifiedMetrics?.dataSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Analyzed Responses</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{insightsData.verifiedMetrics?.totalAnalyzedResponses}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Cohort Accuracy</span>
                    <span className="font-mono font-bold text-emerald-600">{insightsData.verifiedMetrics?.overallAccuracy}</span>
                  </div>
                </div>

                {/* AI Overview */}
                <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-1">
                  <span className="font-extrabold uppercase text-[10px] text-indigo-700 dark:text-cyan-300 tracking-wider block">
                    Strategic AI Telemetry Summary:
                  </span>
                  <p>{insightsData.insights?.overview}</p>
                </div>

                {/* Two Column Priorities & Interventions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3">
                    <span className="font-bold text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> High-Priority Revision Alerts
                    </span>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {insightsData.insights?.revisionPriorities?.map((p, idx) => (
                        <li key={idx} className="font-semibold">{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-3">
                    <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Recommended Teaching Interventions
                    </span>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                      {insightsData.insights?.teachingInterventions?.map((t, idx) => (
                        <li key={idx} className="font-semibold">{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;

