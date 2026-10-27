import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  Plus, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  BrainCircuit, 
  GraduationCap, 
  Clock, 
  HelpCircle,
  FileQuestion,
  Eye,
  Sliders
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MathRenderer } from '../components/ui/MathRenderer';
import { 
  getQuestions, 
  getTopics, 
  generateQuestions, 
  updateQuestionStatus, 
  updateQuestion, 
  deleteQuestion, 
  addQuestion 
} from '../services/questionService';

const FOUNDATIONAL_TOPICS = {
  Math: [
    'Fractions',
    'Decimals & Percentages',
    'Ratios & Proportions',
    'Basic Algebra',
    'Geometry'
  ],
  Science: [
    'Cells',
    'Forces & Motion',
    'Matter & Reactions',
    'Ecosystems',
    'Energy'
  ]
};

export const QuestionBankManager = () => {
  const { user, role } = useContext(AuthContext);

  // Active Tab: 'approved' | 'pending'
  const [activeTab, setActiveTab] = useState('approved');

  // Question State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);

  // Expanded card accordions for inspecting steps
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // AI Generation Modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [genSubject, setGenSubject] = useState('Math');
  const [genTopic, setGenTopic] = useState('Fractions');
  const [customGenTopic, setCustomGenTopic] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('medium');
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Edit Question Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    conceptSummary: '',
    misconception: '',
    difficulty: 'medium',
    topic: '',
    subject: 'Math'
  });

  // Fetch Questions from API
  const fetchQuestionsData = async () => {
    setLoading(true);
    try {
      const res = await getQuestions({
        subject: subjectFilter !== 'All' ? subjectFilter : undefined,
        topic: topicFilter !== 'All' ? topicFilter : undefined,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
        search: searchQuery.trim() || undefined,
        status: 'All'
      });

      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Topics
  const fetchTopicsList = async () => {
    try {
      const res = await getTopics({ subject: subjectFilter !== 'All' ? subjectFilter : undefined });
      if (res.success && res.topics) {
        setAvailableTopics(res.topics);
      }
    } catch (err) {
      console.warn('Error fetching topics:', err);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, [subjectFilter, topicFilter, difficultyFilter]);

  useEffect(() => {
    fetchTopicsList();
  }, [subjectFilter]);

  const [calibrationFilter, setCalibrationFilter] = useState('All');

  // Derived filtered lists
  const approvedQuestions = questions.filter(q => q.status === 'approved' || !q.status);
  const pendingQuestions = questions.filter(q => q.status === 'pending_review');

  const currentTabQuestions = (activeTab === 'approved' ? approvedQuestions : pendingQuestions).filter(q => {
    // Phase 6 & 7: Calibration status filter
    if (calibrationFilter === 'anomaly' && q.telemetry?.anomaly?.flag !== 'anomaly_detected') return false;
    if (calibrationFilter === 'calibrated' && q.telemetry?.anomaly?.flag !== 'within_expected_range') return false;
    if (calibrationFilter === 'insufficient' && !['insufficient_sample', 'no_data'].includes(q.telemetry?.anomaly?.flag)) return false;

    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    const qText = (q?.questionText || '').toLowerCase();
    const qTop = (q?.topic || '').toLowerCase();
    const qExp = (q?.explanation || '').toLowerCase();
    return qText.includes(term) || qTop.includes(term) || qExp.includes(term);
  });

  // Toggle card accordion
  const toggleAccordion = (qId) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Handle Approve
  const handleApprove = async (qId) => {
    try {
      const res = await updateQuestionStatus(qId, 'approved');
      if (res.success) {
        setQuestions(prev => prev.map(q => q._id === qId ? { ...q, status: 'approved' } : q));
        triggerToast("Question approved and published to student curriculum!");
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to approve question.");
    }
  };

  // Handle Reject
  const handleReject = async (qId) => {
    try {
      const res = await updateQuestionStatus(qId, 'rejected');
      if (res.success) {
        setQuestions(prev => prev.filter(q => q._id !== qId));
        triggerToast("Question rejected and discarded.");
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to reject question.");
    }
  };

  // Handle Delete
  const handleDelete = async (qId) => {
    if (!window.confirm("Are you sure you want to permanently delete this question from the bank?")) return;
    try {
      const res = await deleteQuestion(qId);
      if (res.success) {
        setQuestions(prev => prev.filter(q => q._id !== qId));
        triggerToast("Question deleted from bank.");
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to delete question.");
    }
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setEditingQuestion(q);
    setEditFormData({
      questionText: q.questionText || '',
      options: [...(q.options || ['', '', '', ''])],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      explanation: q.explanation || '',
      conceptSummary: q.conceptSummary || '',
      misconception: q.misconception || '',
      difficulty: q.difficulty || 'medium',
      topic: q.topic || 'Fractions',
      subject: q.subject || 'Math'
    });
    setEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (approveAfter = false) => {
    if (!editingQuestion) return;

    try {
      const updatedData = {
        ...editFormData,
        status: approveAfter ? 'approved' : editingQuestion.status
      };

      const res = await updateQuestion(editingQuestion._id, updatedData);
      if (res.success) {
        setQuestions(prev => prev.map(q => q._id === editingQuestion._id ? res.question : q));
        setEditModalOpen(false);
        triggerToast(approveAfter ? "Question updated and approved!" : "Question changes saved successfully.");
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to update question.");
    }
  };

  // Handle AI Question Generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    const finalTopic = customGenTopic.trim() || genTopic;
    if (!finalTopic) {
      setGenerateError('Please select or specify a topic.');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');

    try {
      const res = await generateQuestions({
        subject: genSubject,
        topic: finalTopic,
        difficulty: genDifficulty,
        count: genCount
      });

      if (res.success && res.questions) {
        setQuestions(prev => [...res.questions, ...prev]);
        setGenerateModalOpen(false);
        setActiveTab('pending');
        triggerToast(`Generated ${res.questions.length} new questions! Review them below.`);
      }
    } catch (err) {
      setGenerateError(err.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-16 space-y-6 sm:space-y-8 w-full overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-elevated flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Primary Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[clamp(1.25rem,3.2vw,1.875rem)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Curriculum Question Bank Manager
            </h1>
            <Badge variant="primary" size="sm">
              Educator Studio
            </Badge>
          </div>
          <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-slate-500 dark:text-slate-400 mt-1">
            Curate verified syllabus questions, generate targeted diagnostic items using AI, and manage review pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Button
            onClick={() => {
              setGenerateModalOpen(true);
              setGenerateError('');
            }}
            variant="primary"
            icon={Sparkles}
            className="min-h-[44px] text-xs font-bold shadow-glow-primary"
          >
            Generate with AI
          </Button>
        </div>
      </div>

      {/* 4-KPI Metric Cards Grid (Responsive 1-col mobile, 2-col tablet, 4-col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Bank Size</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-slate-900 dark:text-white mt-2 leading-none">
            {questions.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            Approved + Pending items
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved in Syllabus</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 leading-none">
            {approvedQuestions.length}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 block">
            Live in practice & tests
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-amber-600 dark:text-amber-400 mt-2 leading-none">
            {pendingQuestions.length}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1.5 block">
            Awaiting educator vetting
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI-Generated Items</span>
            <BrainCircuit className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-indigo-600 dark:text-cyan-400 mt-2 leading-none">
            {questions.filter(q => q.source === 'ai_generated').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            Synthesized via Gemini API
          </span>
        </Card>
      </div>

      {/* Tabs Navigation & Filters Bar */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'bg-indigo-600 text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved Bank</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'approved' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {approvedQuestions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Pending Review</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {pendingQuestions.length}
              </span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchQuestionsData}
            className="text-xs hidden sm:flex"
          >
            Refresh
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search question text, topic, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setTopicFilter('All');
              }}
              aria-label="Filter by subject"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            >
              <option value="All">All Subjects</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
            </select>

            {/* Topic Filter */}
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              aria-label="Filter by topic"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px] max-w-[180px] truncate"
            >
              <option value="All">All Topics</option>
              {(subjectFilter === 'All' 
                ? [...FOUNDATIONAL_TOPICS.Math, ...FOUNDATIONAL_TOPICS.Science] 
                : FOUNDATIONAL_TOPICS[subjectFilter] || []
              ).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label="Filter by difficulty"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            >
              <option value="All">All Difficulties</option>
              <option value="easy">Easy (L1)</option>
              <option value="medium">Medium (L2)</option>
              <option value="hard">Hard (L3)</option>
            </select>

            {/* Calibration Status Filter (Phases 6 & 7) */}
            <select
              value={calibrationFilter}
              onChange={(e) => setCalibrationFilter(e.target.value)}
              aria-label="Filter by calibration status"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
            >
              <option value="All">All Calibration States</option>
              <option value="anomaly">⚠️ Review Recommended</option>
              <option value="calibrated">✓ Within Expected Range</option>
              <option value="insufficient">Insufficient Data (N &lt; 10)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Questions List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading question repository...</p>
        </div>
      ) : currentTabQuestions.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {activeTab === 'pending' ? 'No Questions Pending Review' : 'No Questions Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {activeTab === 'pending'
                ? 'All AI-generated questions have been reviewed and approved! Click "Generate with AI" above to synthesize new curriculum items.'
                : 'No approved questions match the selected filters. Try clearing your filters or generating questions.'}
            </p>
          </div>
          {activeTab === 'pending' && (
            <Button
              onClick={() => setGenerateModalOpen(true)}
              variant="primary"
              size="sm"
              icon={Sparkles}
              className="mx-auto"
            >
              Generate New Questions with AI
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {currentTabQuestions.map((q, idx) => {
            const isExpanded = expandedQuestions.has(q._id);
            const isPending = q.status === 'pending_review';

            return (
              <Card
                key={q._id}
                className={`p-5 transition-all border ${
                  isPending 
                    ? 'border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/20 via-white to-white dark:from-amber-950/10 dark:via-slate-900 dark:to-slate-900 shadow-sm'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-card'
                }`}
              >
                {/* Question Card Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      #{idx + 1}
                    </span>
                    <Badge variant={q.subject === 'Math' ? 'primary' : 'success'} size="sm">
                      {q.subject}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {q.topic}
                    </Badge>
                    <Badge 
                      variant={
                        q.difficulty === 'hard' ? 'danger' :
                        q.difficulty === 'medium' ? 'warning' : 'info'
                      } 
                      size="sm"
                    >
                      {q.difficulty?.toUpperCase()}
                    </Badge>
                    {q.source === 'ai_generated' && (
                      <Badge variant="cyan" size="sm" className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </Badge>
                    )}
                    {q.source === 'seed' && (
                      <Badge variant="outline" size="sm">
                        Curated Seed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <Badge variant="warning" size="sm" className="flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Pending Educator Review
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm" className="flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Empirical Telemetry & Calibration Indicators (Phases 6 & 7) */}
                <div className="flex flex-wrap items-center gap-2 mb-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Telemetry:
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    N = {q.telemetry?.sampleSize ?? 0} responses
                  </span>
                  <span className="font-bold text-slate-400">•</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    Pass Rate p = {q.telemetry?.passRatePercent !== null && q.telemetry?.passRatePercent !== undefined ? `${q.telemetry.passRatePercent}%` : 'N/A'}
                  </span>

                  {/* Anomaly Badge */}
                  {q.telemetry?.anomaly && (
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                      q.telemetry.anomaly.flag === 'anomaly_detected'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : q.telemetry.anomaly.flag === 'within_expected_range'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {q.telemetry.anomaly.flag === 'anomaly_detected' && '⚠️ '}
                      {q.telemetry.anomaly.label}
                    </span>
                  )}

                  {/* 1PL Rasch Logit Parameter (Phase 7) */}
                  {q.telemetry?.rasch?.calibratedDifficultyLogits !== null && q.telemetry?.rasch?.calibratedDifficultyLogits !== undefined && (
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-800">
                      Rasch b = {q.telemetry.rasch.calibratedDifficultyLogits} (SE ±{q.telemetry.rasch.standardError})
                    </span>
                  )}
                </div>

                {/* Anomaly Alert Callout Banner if Review is Recommended */}
                {q.telemetry?.anomaly?.flag === 'anomaly_detected' && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Empirical Review Recommended: </strong>
                      <span>{q.telemetry.anomaly.message}</span>
                    </div>
                  </div>
                )}

                {/* Question Prompt */}
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed mb-4">
                  <MathRenderer content={q.questionText} />
                </h3>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswerIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 ${
                            isCorrect 
                              ? 'bg-emerald-600 text-white font-extrabold'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate"><MathRenderer content={opt} /></span>
                        </div>
                        {isCorrect && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Accordion Expand / Collapse Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => toggleAccordion(q._id)}
                    className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 py-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide Pedagogical Breakdown</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Inspect Solution Steps & Misconception Analysis</span>
                      </>
                    )}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Edit3}
                          onClick={() => openEditModal(q)}
                          className="text-xs h-9 min-h-[36px]"
                        >
                          Edit Content
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => handleReject(q._id)}
                          className="text-xs h-9 min-h-[36px]"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle2}
                          onClick={() => handleApprove(q._id)}
                          className="text-xs h-9 min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve Question
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Edit3}
                          onClick={() => openEditModal(q)}
                          className="text-xs h-9 min-h-[36px]"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Trash2}
                          onClick={() => handleDelete(q._id)}
                          className="text-xs h-9 min-h-[36px] text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Pedagogical Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        Plain-Language Conceptual Explanation
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Solution Steps */}
                    {q.steps && q.steps.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                          Step-by-Step Derivation Procedure
                        </h4>
                        <div className="space-y-2">
                          {q.steps.map((st, sIdx) => (
                            <div key={sIdx} className="text-xs border-l-2 border-indigo-400 pl-2.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{st.step}: </span>
                              <span className="text-slate-600 dark:text-slate-400">{st.desc} </span>
                              {st.math && (
                                <code className="block mt-0.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 font-mono text-[11px] text-indigo-700 dark:text-cyan-400 font-bold">
                                  {st.math}
                                </code>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Misconception Alert */}
                    {q.misconception && (
                      <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                        <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Student Misconception Addressed by Distractors
                        </h4>
                        <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                          {q.misconception}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. AI QUESTION GENERATOR MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => !isGenerating && setGenerateModalOpen(false)}
        title="Generate Curriculum Questions with AI"
        subtitle="Harness Gemini AI Tutor to generate syllabus-aligned items with real student distractors"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleGenerate} className="space-y-4 mt-2">
          {generateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{generateError}</span>
            </div>
          )}

          {/* Subject Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Subject Domain
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Math', 'Science'].map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setGenSubject(sub);
                    setGenTopic(FOUNDATIONAL_TOPICS[sub][0]);
                    setCustomGenTopic('');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    genSubject === sub
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="block">{sub === 'Math' ? '📐 Mathematics' : '🔬 General Science'}</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5 block">
                    Grades 6–8 foundational curriculum
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Curriculum Core Topic
            </label>
            <select
              value={genTopic}
              onChange={(e) => {
                setGenTopic(e.target.value);
                setCustomGenTopic('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {FOUNDATIONAL_TOPICS[genSubject].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="mt-2">
              <input
                type="text"
                placeholder="Or specify custom subtopic (e.g. Linear Equations in Two Variables)..."
                value={customGenTopic}
                onChange={(e) => setCustomGenTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Difficulty Level
              </label>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Level 1: Foundational (Easy)</option>
                <option value="medium">Level 2: Procedural (Medium)</option>
                <option value="hard">Level 3: Multi-Step (Hard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Batch Count (Max 30)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={genCount}
                onChange={(e) => setGenCount(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
            <span className="font-bold">Pedagogical Guardrail:</span> Generated questions are automatically held in <strong>Pending Review</strong> with complete solution steps and misconception distractors. They will not be served to students until you approve them.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGenerating}
              onClick={() => setGenerateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={isGenerating ? RefreshCw : Sparkles}
              disabled={isGenerating}
              className="bg-indigo-600 text-white min-h-[38px]"
            >
              {isGenerating ? 'Generating Items...' : `Generate ${genCount} Questions`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* 2. EDIT QUESTION MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Question Content"
        subtitle="Review and refine question prompt, choices, and pedagogical guidance"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(false); }} className="space-y-4 mt-2">
          {/* Question Text */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Question Prompt
            </label>
            <textarea
              rows={3}
              value={editFormData.questionText}
              onChange={(e) => setEditFormData({ ...editFormData, questionText: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 4 Options */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Answer Options & Correct Key
            </label>
            <div className="space-y-2">
              {editFormData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctKey"
                    checked={editFormData.correctAnswerIndex === idx}
                    onChange={() => setEditFormData({ ...editFormData, correctAnswerIndex: idx })}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <span className="w-5 font-mono text-xs font-bold text-slate-500">
                    {String.fromCharCode(65 + idx)}:
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...editFormData.options];
                      newOpts[idx] = e.target.value;
                      setEditFormData({ ...editFormData, options: newOpts });
                    }}
                    required
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {editFormData.correctAnswerIndex === idx && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Correct Key</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Plain-Language Explanation
            </label>
            <textarea
              rows={2}
              value={editFormData.explanation}
              onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Misconception */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Common Student Misconception Addressed
            </label>
            <input
              type="text"
              value={editFormData.misconception}
              onChange={(e) => setEditFormData({ ...editFormData, misconception: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
              >
                Save Changes
              </Button>
              {editingQuestion?.status === 'pending_review' && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleSaveEdit(true)}
                  className="bg-emerald-600 text-white"
                >
                  Save & Approve
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
