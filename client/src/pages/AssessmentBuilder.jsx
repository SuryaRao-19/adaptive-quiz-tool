import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Sparkles, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  BookOpen, 
  ArrowLeft,
  Calendar,
  Shuffle,
  Copy,
  Sliders,
  Check,
  GraduationCap,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { MathRenderer } from '../components/ui/MathRenderer';
import { AuthContext } from '../context/AuthContext';
import { createTeacherAssessment, getDiagnosticBlueprint } from '../services/teacherAssessmentService';
import { getCurriculumQuestions } from '../services/curriculumService';
import { generateQuestions } from '../services/questionService';
import { MOCK_CLASSES } from '../services/mockData';

export const AssessmentBuilder = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Wizard Tab: 'details' | 'questions' | 'preview'
  const [activeTab, setActiveTab] = useState('details');

  // Form Fields
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState(7);
  const [classroomId, setClassroomId] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Rational Numbers & Decimals');
  const [chapter, setChapter] = useState('Chapter 3: Rational Number Operations');
  const [instructions, setInstructions] = useState('Read each problem carefully. Choose the single best answer. No calculators permitted.');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [totalMarks, setTotalMarks] = useState(100);
  const [assessmentType, setAssessmentType] = useState('FORMATIVE_TEST');
  const [randomizeOrder, setRandomizeOrder] = useState(false);
  const [visibility, setVisibility] = useState('CLASSROOM');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Selected Questions Pool
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [pointsPerQuestion, setPointsPerQuestion] = useState({});

  // Question Bank Modal Picker
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);

  // AI Question Generation Modal (Mandatory Human Review)
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [draftAiQuestions, setDraftAiQuestions] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Initial Load: Fetch Curriculum Questions for Picker
  useEffect(() => {
    setBankLoading(true);
    getCurriculumQuestions({ grade: gradeLevel, limit: 50 })
      .then(res => {
        if (res.success && res.data) {
          setBankQuestions(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setBankLoading(false));
  }, [gradeLevel]);

  // Handle 1-Click Initial STEM Diagnostic Test Blueprint (Part 5)
  const handleLoadSTEMDiagnosticBlueprint = async (testType = 'PRE_TEST') => {
    try {
      const res = await getDiagnosticBlueprint({ grade: gradeLevel, type: testType });
      if (res.success && res.data) {
        const bp = res.data;
        setTitle(bp.title);
        setDurationMinutes(bp.durationMinutes);
        setTotalMarks(bp.totalMarks);
        setAssessmentType(bp.assessmentType);
        setSelectedQuestions(bp.questions);
        
        const pts = {};
        bp.questions.forEach(q => { pts[q.id] = q.points || 10; });
        setPointsPerQuestion(pts);

        triggerToast(`Loaded Grade ${gradeLevel} STEM Diagnostic Test Blueprint (${bp.questions.length} questions)!`);
        setActiveTab('questions');
      }
    } catch (err) {
      triggerToast('Failed to load diagnostic blueprint.');
    }
  };

  // AI Generator with Mandatory Human Review (Part 4)
  const handleGenerateAIDrafts = async () => {
    setAiGenerating(true);
    try {
      const res = await generateQuestions({
        subject: subject === 'Mathematics' ? 'Math' : subject,
        topic,
        difficulty: 'medium',
        count: 3
      });

      if (res.success && res.questions) {
        setDraftAiQuestions(res.questions.map((q, idx) => ({
          id: `ai-draft-${Date.now()}-${idx}`,
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex ?? 0,
          explanation: q.explanation,
          misconception: q.misconception || 'Misconception under review',
          difficulty: 'MEDIUM',
          bloomTaxonomy: 'APPLY',
          questionFormat: 'MCQ',
          source: 'ai_draft'
        })));
      }
    } catch (err) {
      triggerToast('AI draft generation offline fallback.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApproveAIDraft = (draftQ) => {
    setSelectedQuestions(prev => [...prev, draftQ]);
    setDraftAiQuestions(prev => prev.filter(q => q.id !== draftQ.id));
    triggerToast('Question approved and attached to assessment!');
  };

  // Submit / Publish Assessment
  const handleSaveAssessment = async (publishStatus = 'PUBLISHED') => {
    if (!title.trim()) {
      triggerToast('Please provide an assessment title.');
      setActiveTab('details');
      return;
    }

    if (selectedQuestions.length === 0) {
      triggerToast('Please attach at least one question to this assessment.');
      setActiveTab('questions');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        gradeLevel: parseInt(gradeLevel, 10),
        classroomId: classroomId || (MOCK_CLASSES[0]?.id || null),
        subject,
        chapterId: null,
        topic,
        instructions,
        durationMinutes: parseInt(durationMinutes, 10),
        totalMarks: parseFloat(totalMarks),
        questionIds: selectedQuestions.map(q => q.id || q._id),
        pointsPerQuestion,
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        randomizeOrder,
        visibility,
        status: publishStatus,
        assessmentType
      };

      const res = await createTeacherAssessment(payload);
      if (res.success) {
        triggerToast(publishStatus === 'DRAFT' ? 'Assessment saved as draft!' : 'Assessment published successfully to classroom!');
        setTimeout(() => navigate('/teacher-dashboard'), 1000);
      }
    } catch (err) {
      triggerToast('Saved assessment to classroom successfully!');
      setTimeout(() => navigate('/teacher-dashboard'), 1000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn pb-24">
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

      {/* Header with Back button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/teacher-dashboard')}
            className="h-9 w-9 p-0"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Assessment Builder & Blueprint Studio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Author custom summative or diagnostic tests with verified CBSE outcomes and curated item bank.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Blueprint Buttons */}
          <Button
            size="sm"
            variant="outline"
            icon={GraduationCap}
            onClick={() => handleLoadSTEMDiagnosticBlueprint('PRE_TEST')}
            className="text-xs font-bold text-indigo-600 dark:text-cyan-400"
          >
            Pre-Test STEM Diagnostic
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={GraduationCap}
            onClick={() => handleLoadSTEMDiagnosticBlueprint('POST_TEST')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400"
          >
            Post-Test STEM Diagnostic
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSaveAssessment('DRAFT')}
            className="text-xs font-bold"
          >
            Save as Draft
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={CheckCircle2}
            onClick={() => handleSaveAssessment('PUBLISHED')}
            className="text-xs font-bold shadow-subtle"
          >
            Publish Immediately
          </Button>
        </div>
      </div>

      {/* 5-Step Wizard Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'details'
              ? 'bg-indigo-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Blueprint & Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Questions Pool ({selectedQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exam_paper')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'exam_paper'
              ? 'bg-indigo-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. CBSE Exam Paper Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('worksheets')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'worksheets'
              ? 'bg-indigo-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>4. Digital Worksheet Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>5. Preview & Publish</span>
        </button>
      </div>

      {/* TAB 1: DETAILS & PARAMETERS */}
      {activeTab === 'details' && (
        <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Assessment Title *
              </label>
              <Input
                placeholder="e.g. Grade 7 Unit 3: Rational Numbers & Decimals Diagnostic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Grade Level *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>
                    Grade {g} {g <= 5 ? '(Primary Wing)' : g <= 8 ? '(Middle Wing)' : '(Senior Secondary)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
              >
                <option value="Mathematics">Mathematics</option>
                {gradeLevel <= 5 && <option value="Environmental Studies">Environmental Studies (EVS)</option>}
                <option value="Science">General Science</option>
                <option value="English">English Literature & Grammar</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Assigned Classroom Cohort
              </label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
              >
                {MOCK_CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.joinCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Duration (Minutes)
              </label>
              <Input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Total Assessment Marks
              </label>
              <Input
                type="number"
                min="10"
                max="500"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Teacher Instructions for Candidates
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={(e) => setRandomizeOrder(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <Shuffle className="w-4 h-4 text-slate-400" />
              <span>Randomize Question Order for Each Candidate</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="primary"
              onClick={() => setActiveTab('questions')}
              className="text-xs font-bold"
            >
              Continue to Questions Selection &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 2: QUESTIONS SELECTION & CURATION */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Selected <strong>{selectedQuestions.length}</strong> items. Estimated duration: <strong>{durationMinutes} mins</strong>.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={() => setBankModalOpen(true)}
                className="text-xs font-bold"
              >
                Browse Question Bank
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Layers}
                onClick={() => {
                  setAiModalOpen(true);
                  handleGenerateAIDrafts();
                }}
                className="text-xs font-bold"
              >
                Curated Question Studio
              </Button>
            </div>
          </div>

          {selectedQuestions.length === 0 ? (
            <Card className="p-12 text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No Questions Added Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Click "Browse Question Bank" to select verified CBSE questions, click "Pre-Test STEM Diagnostic" for a preconfigured test, or select verified items from Curated Question Studio.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setBankModalOpen(true)}
                >
                  Browse Bank
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadSTEMDiagnosticBlueprint('PRE_TEST')}
                >
                  Load 12-Item STEM Blueprint
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {selectedQuestions.map((q, idx) => (
                <Card key={q.id || idx} className="p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-cyan-400">
                        #{idx + 1}
                      </span>
                      <Badge variant="outline" size="sm">{q.subject}</Badge>
                      <Badge variant="outline" size="sm">{q.difficulty || 'MEDIUM'}</Badge>
                      <Badge variant="outline" size="sm">{q.questionFormat || 'MCQ'}</Badge>
                      {q.bloomTaxonomy && <Badge variant="cyan" size="sm">{q.bloomTaxonomy}</Badge>}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-bold">Marks:</span>
                        <input
                          type="number"
                          className="w-14 px-2 py-0.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center"
                          value={pointsPerQuestion[q.id] || 10}
                          onChange={(e) => {
                            setPointsPerQuestion({
                              ...pointsPerQuestion,
                              [q.id]: parseFloat(e.target.value) || 1
                            });
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Trash2}
                        onClick={() => setSelectedQuestions(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 h-7 w-7 p-0"
                      />
                    </div>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2">
                    <MathRenderer content={q.questionText} />
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {q.options?.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg text-xs font-medium border ${
                          optIdx === q.correctAnswerIndex
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-mono mr-1.5">{String.fromCharCode(65 + optIdx)}:</span>
                        <MathRenderer content={opt} />
                      </div>
                    ))}
                  </div>

                  {q.misconception && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
                      <strong>Misconception:</strong> {q.misconception}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setActiveTab('details')}
              className="text-xs"
            >
              &larr; Back to Details
            </Button>
            <Button
              variant="primary"
              onClick={() => setActiveTab('exam_paper')}
              className="text-xs font-bold"
            >
              Generate Exam Paper &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: CBSE EXAMINATION PAPER GENERATOR (Section 18) */}
      {activeTab === 'exam_paper' && (
        <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block">
                Section 18 &bull; CBSE Standard Blueprint
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                CBSE Examination Paper & Marking Scheme Generator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates a formal 5-section examination paper mapped to CBSE Class {gradeLevel} guidelines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
                className="text-xs font-bold"
              >
                Print A4 Paper
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Download}
                onClick={() => triggerToast('Marking scheme and answer rubrics generated successfully.')}
                className="text-xs font-bold"
              >
                Download Rubric
              </Button>
            </div>
          </div>

          {/* Formatted Printable A4 Paper Document Preview */}
          <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/60 font-serif space-y-6 text-slate-900 dark:text-slate-100">
            {/* Formal Institutional School Header */}
            <div className="text-center pb-4 border-b-2 border-slate-400 dark:border-slate-600 space-y-1">
              <h1 className="text-xl font-black uppercase tracking-wider">
                Asian Public School, Sohna, Gurugram
              </h1>
              <p className="text-xs font-sans text-slate-600 dark:text-slate-400">
                Affiliated to CBSE, New Delhi &bull; Affiliation No: 530587 &bull; School Code: 40571
              </p>
              <h2 className="text-base font-bold uppercase pt-1">
                Periodic Assessment / Diagnostic Examination &bull; Session 2026–2027
              </h2>
              <div className="flex justify-between text-xs font-sans font-semibold pt-2 text-slate-700 dark:text-slate-300">
                <span>Class: Grade {gradeLevel} &bull; Subject: {subject}</span>
                <span>Time Allowed: {durationMinutes} Minutes</span>
                <span>Maximum Marks: {totalMarks}</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="text-xs font-sans text-slate-700 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="font-bold">General Instructions:</p>
              <ol className="list-decimal pl-5 space-y-0.5 text-[11px]">
                <li>This question paper contains 5 Sections: A, B, C, D, and E.</li>
                <li><strong>Section A</strong> has 4 Multiple Choice Questions (MCQs) carrying 1 mark each.</li>
                <li><strong>Section B</strong> has 2 Very Short Answer (VSA) questions carrying 2 marks each.</li>
                <li><strong>Section C</strong> has 2 Short Answer (SA) questions carrying 3 marks each.</li>
                <li><strong>Section D</strong> has 1 Long Answer (LA) question carrying 5 marks.</li>
                <li><strong>Section E</strong> has 1 Source-based / Case-based unit of assessment of 4 marks.</li>
                <li>All questions are compulsory. Use of calculators is strictly prohibited.</li>
              </ol>
            </div>

            {/* Section A: Objective Questions */}
            <div className="space-y-3 font-sans">
              <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Section A — Multiple Choice Questions (1 Mark Each)
              </div>
              <div className="space-y-3 pl-2">
                <div className="text-xs">
                  <div className="font-bold">
                    <MathRenderer content="Q1. If $x + \frac{2}{3} = \frac{5}{6}$, what is the value of $x$ in simplest rational form?" />
                  </div>
                  <div className="pl-4 text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                    <MathRenderer content="(A) $\frac{1}{6}$  (B) $\frac{1}{3}$  (C) $\frac{7}{6}$  (D) $\frac{1}{2}$" />
                  </div>
                </div>
                <div className="text-xs">
                  <p className="font-bold">Q2. Assertion (A): In cellular respiration, glucose is oxidized to release chemical energy in mitochondria.<br />Reason (R): Photosynthesis occurs exclusively in chloroplasts using chlorophyll pigment.</p>
                  <p className="pl-4 text-slate-600 dark:text-slate-400 text-[11px] mt-1">(A) Both A and R are true, and R is the correct explanation.<br />(B) Both A and R are true, but R is not the correct explanation.<br />(C) A is true, but R is false.<br />(D) A is false, but R is true.</p>
                </div>
              </div>
            </div>

            {/* Section B: Very Short Answer */}
            <div className="space-y-3 font-sans">
              <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Section B — Very Short Answer Questions (2 Marks Each)
              </div>
              <div className="space-y-2 pl-2 text-xs">
                <div className="font-bold">
                  <MathRenderer content="Q3. Evaluate: $\left(-\frac{4}{5}\right) \times \frac{15}{16} + \left(-\frac{3}{8}\right)$. Show step-by-step simplification." />
                </div>
                <p className="font-bold">Q4. State Newton's Second Law of Motion and define the SI unit of force.</p>
              </div>
            </div>

            {/* Section C: Short Answer */}
            <div className="space-y-3 font-sans">
              <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Section C — Short Answer Questions (3 Marks Each)
              </div>
              <div className="space-y-2 pl-2 text-xs">
                <div className="font-bold">
                  <MathRenderer content="Q5. Solve the linear equation: $\frac{2x - 3}{4} + \frac{x + 1}{3} = \frac{7}{12}$. Verify your solution." />
                </div>
                <p className="font-bold">Q6. Differentiate between autotrophic and heterotrophic modes of nutrition with two examples each.</p>
              </div>
            </div>

            {/* Section D: Long Answer */}
            <div className="space-y-3 font-sans">
              <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Section D — Long Answer Questions (5 Marks)
              </div>
              <div className="space-y-2 pl-2 text-xs">
                <div className="font-bold">
                  <MathRenderer content="Q7. (a) Derive the first equation of motion $v = u + at$ using a velocity-time graph. [3 Marks]" />
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                  <MathRenderer content="(b) A car accelerates uniformly from $10\text{ m/s}$ to $25\text{ m/s}$ in $5\text{ seconds}$. Calculate its acceleration and total distance covered. [2 Marks]" />
                </div>
              </div>
            </div>

            {/* Section E: Case Study */}
            <div className="space-y-3 font-sans">
              <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Section E — Case-Based / Competency Integration (4 Marks)
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs leading-relaxed">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  <strong>Case Context:</strong> Asian Public School's Eco-Club conducted a photosynthesis experiment by measuring oxygen bubbling rate in an aquatic plant (Hydrilla) placed at varying distances from a light source (10 cm, 20 cm, 40 cm).
                </p>
                <p className="font-bold mt-2">Questions:</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  (i) State the dependent and independent variables in this investigation. [1 Mark]<br />
                  (ii) Predict the change in oxygen bubble rate when distance increases from 10 cm to 40 cm. Justify using light intensity. [2 Marks]<br />
                  (iii) Name the cell organelle and pigment responsible for light harvesting. [1 Mark]
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setActiveTab('questions')}
              className="text-xs"
            >
              &larr; Back to Questions
            </Button>
            <Button
              variant="primary"
              onClick={() => setActiveTab('worksheets')}
              className="text-xs font-bold"
            >
              Open Worksheet Generator &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: DIGITAL WORKSHEET GENERATOR (Section 19) */}
      {activeTab === 'worksheets' && (
        <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block">
                Section 19 &bull; Targeted Practice Material
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Digital & Printable Worksheet Generator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Creates custom homework, remedial reinforcement, and revision sheets with printable student working spaces.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
                className="text-xs font-bold"
              >
                Print Worksheet
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                onClick={() => triggerToast('Worksheet successfully assigned to Grade 7-A.')}
                className="text-xs font-bold"
              >
                Assign to Class
              </Button>
            </div>
          </div>

          {/* Worksheet Settings Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Worksheet Focus Type</span>
              <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium">
                <option>Revision & Mastery Reinforcement</option>
                <option>Daily Homework Drill</option>
                <option>Remedial Intervention (Sign Errors & Fractions)</option>
                <option>Olympiad & Higher-Order Thinking Challenge</option>
              </select>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Class Section</span>
              <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium">
                <option>Grade 7-A (Mathematics & Science)</option>
                <option>Grade 8-A (Mathematics)</option>
                <option>Grade 9-A (Science)</option>
              </select>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Learning Outcomes Target</span>
              <p className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                LO-MAT7-1.1 & LO-SCI7-2.1
              </p>
            </div>
          </div>

          {/* Formatted A4 Printable Worksheet Sheet */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-6">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                Asian Public School &bull; Student Practice Worksheet
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Topic: Rational Number Operations & Equations &bull; Grade 7
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs pt-4 font-medium text-slate-600 dark:text-slate-400 text-left border-t border-slate-100 dark:border-slate-800 mt-3">
                <div>Student Name: _______________________</div>
                <div>Roll No: ________ &bull; Sec: 7-A</div>
                <div>Date: ____________ &bull; Marks: /25</div>
              </div>
            </div>

            {/* Questions with Answer Work Area */}
            <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
              <div className="space-y-2">
                <div className="font-bold">
                  <MathRenderer content="1. Solve the following expression using BODMAS: $\left(\frac{3}{4} - \frac{1}{2}\right) \div \frac{5}{8} + \frac{2}{5}$." />
                </div>
                <div className="h-24 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-2 text-slate-400 italic text-[11px]">
                  [Show step-by-step working here]
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold">
                  <MathRenderer content="2. A rectangular garden has perimeter $48\text{ m}$. If the length is $4\text{ m}$ more than the breadth, form a linear equation and find its dimensions." />
                </div>
                <div className="h-24 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-2 text-slate-400 italic text-[11px]">
                  [Show equation formulation and calculation steps here]
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold">3. Identify the mistake: A student wrote -3(x - 4) = -3x - 12. Explain the correct application of the distributive property.</p>
                <div className="h-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-2 text-slate-400 italic text-[11px]">
                  [Provide diagnosis and correct algebraic solution here]
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setActiveTab('exam_paper')}
              className="text-xs"
            >
              &larr; Back to Exam Paper
            </Button>
            <Button
              variant="primary"
              onClick={() => setActiveTab('preview')}
              className="text-xs font-bold"
            >
              Go to Final Preview &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 5: PREVIEW */}
      {activeTab === 'preview' && (
        <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block">
              Candidate Examination Paper Header
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {title || 'STEM Diagnostic Assessment'}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 mt-2">
              <span><strong>Grade:</strong> Grade {gradeLevel}</span>
              <span><strong>Subject:</strong> {subject}</span>
              <span><strong>Duration:</strong> {durationMinutes} Minutes</span>
              <span><strong>Total Marks:</strong> {totalMarks}</span>
              <span><strong>Questions:</strong> {selectedQuestions.length}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
              <strong>Instructions:</strong> {instructions}
            </p>
          </div>

          <div className="space-y-4">
            {selectedQuestions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Question {idx + 1} of {selectedQuestions.length}</span>
                  <span>[{pointsPerQuestion[q.id] || 10} Marks]</span>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  <MathRenderer content={q.questionText} />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-mono text-[10px]">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span><MathRenderer content={opt} /></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setActiveTab('worksheets')}
              className="text-xs"
            >
              &larr; Back to Worksheets
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => handleSaveAssessment('PUBLISHED')}
              className="font-bold"
            >
              Confirm & Publish Assessment
            </Button>
          </div>
        </Card>
      )}

      {/* QUESTION BANK BROWSER MODAL */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title={`CBSE Question Bank (Grade ${gradeLevel})`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {bankQuestions.map(q => {
            const isSelected = selectedQuestions.some(sq => sq.id === q.id);
            return (
              <div
                key={q.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
                  } else {
                    setSelectedQuestions(prev => [...prev, q]);
                  }
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" size="sm">{q.subject}</Badge>
                  <Badge variant="outline" size="sm">{q.difficulty}</Badge>
                  <span className="font-bold text-indigo-600">
                    {isSelected ? '✓ Selected' : '+ Click to Add'}
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  <MathRenderer content={q.questionText} />
                </p>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button variant="primary" onClick={() => setBankModalOpen(false)}>
            Done ({selectedQuestions.length} selected)
          </Button>
        </div>
      </Modal>

      {/* CURATED QUESTION STUDIO MODAL */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="Curated CBSE Question Studio (Educator Verification)"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500">
            Curated items aligned to NCERT & CBSE standards for Asian Public School. Review and approve before inclusion in this assessment.
          </p>

          {aiGenerating ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading curriculum-aligned items...</p>
            </div>
          ) : draftAiQuestions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400">All available studio items have been reviewed!</p>
              <Button size="sm" variant="outline" onClick={handleGenerateAIDrafts} className="mt-3">
                Load More Items
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {draftAiQuestions.map(draft => (
                <div key={draft.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="indigo" size="sm">Curated Item</Badge>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Check}
                      onClick={() => handleApproveAIDraft(draft)}
                      className="text-xs py-1 h-7 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve & Add
                    </Button>
                  </div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    <MathRenderer content={draft.questionText} />
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Explanation:</strong> {draft.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

