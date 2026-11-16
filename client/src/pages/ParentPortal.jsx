import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Award, 
  FileText, 
  Download, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Bell, 
  AlertCircle,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import { MOCK_PARENT } from '../services/mockData';

// Class-wise assessment results data for parent inspection
const CLASS_ASSESSMENTS_DATA = {
  'Grade 7-A': {
    className: 'Grade 7-A (Middle Wing)',
    subject: 'Mathematics & Science',
    classTeacher: 'Mrs. Ananya Sharma',
    totalStudents: 20,
    tests: [
      {
        id: 'test-g7-diag',
        title: 'Class VII STEM Diagnostic Pre-Test',
        term: 'Term 1 Baseline Assessment',
        date: '2026-10-15',
        type: 'Summative',
        score: 88,
        maxScore: 100,
        percentage: 88,
        classAverage: 78,
        percentile: '92nd Percentile',
        grade: 'A1',
        status: 'Published',
        subjectBreakdowns: [
          { subject: 'Mathematics (Integers & Fractions)', score: 92, max: 100, status: 'Advanced Mastery', classAvg: 76 },
          { subject: 'Science (Nutrition & Energy)', score: 86, max: 100, status: 'Proficient', classAvg: 72 },
          { subject: 'English (Reading Comprehension)', score: 84, max: 100, status: 'Proficient', classAvg: 74 }
        ],
        topicBreakdown: [
          { topic: 'Integers & Arithmetic Laws', questions: 4, correct: 4, accuracy: 100, status: 'Mastered' },
          { topic: 'Fractions & Rational Numbers', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' },
          { topic: 'Simple Linear Equations', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' }
        ],
        teacherRemarks: 'Aarav has shown exceptional analytical speed and solid grasp of integer sign conventions. Consistent practice on equation balancing will secure 100% mastery.',
        remarksDate: '2026-10-16'
      },
      {
        id: 'test-g7-pa1',
        title: 'Periodic Assessment 1: Integers & Rational Numbers',
        term: 'Unit 1 & 2 Formative',
        date: '2026-10-02',
        type: 'Formative',
        score: 46,
        maxScore: 50,
        percentage: 92,
        classAverage: 74,
        percentile: '95th Percentile',
        grade: 'A1',
        status: 'Published',
        subjectBreakdowns: [
          { subject: 'Mathematics (Integers)', score: 92, max: 100, status: 'Advanced Mastery', classAvg: 74 }
        ],
        topicBreakdown: [
          { topic: 'Multiplication & Division of Integers', questions: 5, correct: 5, accuracy: 100, status: 'Mastered' },
          { topic: 'Number Line Representation', questions: 3, correct: 3, accuracy: 100, status: 'Mastered' },
          { topic: 'Rational Number Properties', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' }
        ],
        teacherRemarks: 'Near-perfect execution on arithmetic sign rules. Recommended to maintain this level of precision for Unit 2.',
        remarksDate: '2026-10-03'
      },
      {
        id: 'test-g7-unit2',
        title: 'Unit Assessment 2: Simple Linear Equations Checkpoint',
        term: 'Diagnostic Checkpoint',
        date: '2026-09-20',
        type: 'Diagnostic',
        score: 34,
        maxScore: 40,
        percentage: 85,
        classAverage: 69,
        percentile: '86th Percentile',
        grade: 'A2',
        status: 'Published',
        subjectBreakdowns: [
          { subject: 'Mathematics (Algebra)', score: 85, max: 100, status: 'Proficient', classAvg: 69 }
        ],
        topicBreakdown: [
          { topic: 'Variable Transposition', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' },
          { topic: 'Word Problem Formulation', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' },
          { topic: 'Inverse Operations Balance', questions: 2, correct: 2, accuracy: 100, status: 'Mastered' }
        ],
        teacherRemarks: 'Good grasp of balance method. Occasional slip when transposing negative terms across brackets.',
        remarksDate: '2026-09-21'
      }
    ]
  },
  'Grade 7-B': {
    className: 'Grade 7-B (Middle Wing)',
    subject: 'Science & Environment',
    classTeacher: 'Mr. Rajesh Verma',
    totalStudents: 22,
    tests: [
      {
        id: 'test-g7b-sci1',
        title: 'Science Diagnostic Checkpoint: Nutrition in Plants',
        term: 'Chapter 1 Assessment',
        date: '2026-09-24',
        type: 'Periodic',
        score: 43,
        maxScore: 50,
        percentage: 86,
        classAverage: 71,
        percentile: '89th Percentile',
        grade: 'A2',
        status: 'Published',
        subjectBreakdowns: [
          { subject: 'Science (Biology)', score: 86, max: 100, status: 'Proficient', classAvg: 71 }
        ],
        topicBreakdown: [
          { topic: 'Stomata and Guard Cells', questions: 4, correct: 4, accuracy: 100, status: 'Mastered' },
          { topic: 'Autotrophic Nutrition Mechanisms', questions: 4, correct: 3, accuracy: 75, status: 'Proficient' },
          { topic: 'Insectivorous Plants', questions: 2, correct: 2, accuracy: 100, status: 'Mastered' }
        ],
        teacherRemarks: 'Excellent diagram interpretation and laboratory concept recall.',
        remarksDate: '2026-09-25'
      }
    ]
  }
};

export const ParentPortal = () => {
  const { user } = useContext(AuthContext);
  const parent = user?.role === 'parent' ? user : MOCK_PARENT;
  const childrenList = parent.linkedChildren || MOCK_PARENT.linkedChildren;
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const child = childrenList[selectedChildIndex] || childrenList[0];

  const [activeTab, setActiveTab] = useState('overview');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Class and Result Selection State
  const [selectedClassKey, setSelectedClassKey] = useState('Grade 7-A');
  const activeClassData = CLASS_ASSESSMENTS_DATA[selectedClassKey] || CLASS_ASSESSMENTS_DATA['Grade 7-A'];
  const [selectedTestId, setSelectedTestId] = useState(activeClassData.tests[0]?.id || '');

  // Keep test selection synchronized when changing class
  const currentTest = activeClassData.tests.find(t => t.id === selectedTestId) || activeClassData.tests[0];

  const handleClassChange = (newClassKey) => {
    setSelectedClassKey(newClassKey);
    const targetClass = CLASS_ASSESSMENTS_DATA[newClassKey] || CLASS_ASSESSMENTS_DATA['Grade 7-A'];
    if (targetClass.tests.length > 0) {
      setSelectedTestId(targetClass.tests[0].id);
    }
  };

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
      setDownloadSuccess(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* 1. Institutional Security & Parent Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Verified Guardian Portal &bull; RBAC Protected
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">&bull; CBSE Affiliation 530587</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Asian Public School Parent Connect
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Welcome, <span className="font-semibold text-white">{parent.fullName}</span> &bull; Academic Session 2026–2027
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              {downloadSuccess ? 'Preparing Report...' : 'Download Progress Report (PDF)'}
            </Button>
          </div>
        </div>

        {/* Linked Child Profile Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {child.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{child.fullName}</span>
                <Badge variant="success" className="text-xs">Active Ward</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Grade {child.grade}, Section {child.section} &bull; Roll No: <span className="text-indigo-300 font-mono font-semibold">{child.rollNumber}</span>
              </p>
            </div>
          </div>

          {/* Sibling / Ward Switcher */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-2">Ward:</span>
              {childrenList.map((c, idx) => (
                <button
                  key={c.studentId || idx}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedChildIndex === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {c.fullName} (Class {c.grade})
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block">Class Teacher</span>
              <span className="font-semibold text-white">{child.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact Phone</span>
              <span className="font-semibold text-white">{parent.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-Line KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{child.attendanceRate}%</h3>
            <p className="text-xs text-emerald-600 font-medium">19 of 20 Days Present</p>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Subject Mastery</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{child.overallMastery}%</h3>
            <p className="text-xs text-indigo-600 font-medium">Advanced Tier (Top 10%)</p>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Diagnostic</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {currentTest ? `${currentTest.percentage}%` : '88%'}
            </h3>
            <p className="text-xs text-cyan-600 font-medium truncate max-w-[180px]">
              {currentTest?.title || 'Class VII Assessment'}
            </p>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Streak</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{child.streakDays} Days</h3>
            <p className="text-xs text-amber-600 font-medium">Active Daily Practice</p>
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Class-Wise Assessment Results
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assessments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Assessment History & Tests
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Attendance Tracker
        </button>

        <button
          onClick={() => setActiveTab('circulars')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'circulars'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bell className="w-4 h-4" />
          School Circulars & Schedule
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Class-Wise and Assessment-Wise Selection Bar */}
          <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span>Select Class:</span>
                </div>
                <div className="flex items-center gap-2">
                  {Object.keys(CLASS_ASSESSMENTS_DATA).map((classKey) => (
                    <button
                      key={classKey}
                      onClick={() => handleClassChange(classKey)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedClassKey === classKey
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {CLASS_ASSESSMENTS_DATA[classKey].className}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assessment Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Test / Examination:
                </span>
                <select
                  value={currentTest?.id || ''}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {activeClassData.tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Detailed Selected Assessment Report */}
          {currentTest && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Scorecard Hero */}
                <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="indigo" className="text-xs">{currentTest.term}</Badge>
                        <Badge variant="success" className="text-xs">{currentTest.status}</Badge>
                        <span className="text-xs text-slate-400 font-medium">{currentTest.date}</span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {currentTest.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Score</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          {currentTest.score} <span className="text-xs text-slate-400 font-bold">/ {currentTest.maxScore}</span>
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                      <div className="text-center px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CBSE Grade</span>
                        <span className="text-xl font-black text-emerald-600">{currentTest.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ward vs Class Average Comparison */}
                  <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">Ward Score: <strong className="text-indigo-600">{currentTest.percentage}%</strong></span>
                      <span className="text-slate-500">Class 7-A Cohort Average: <strong>{currentTest.classAverage}%</strong></span>
                      <span className="text-emerald-600">{currentTest.percentile}</span>
                    </div>
                    <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                        style={{ width: `${currentTest.percentage}%` }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                        title={`Class Average: ${currentTest.classAverage}%`}
                        style={{ left: `${currentTest.classAverage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                      <span>Baseline: 0%</span>
                      <span className="text-amber-600 font-bold">▲ Class Avg ({currentTest.classAverage}%)</span>
                      <span>100% Mastery</span>
                    </div>
                  </div>

                  {/* Subject Breakdown */}
                  <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Subject Performance Breakdown
                    </h3>
                    <div className="space-y-3">
                      {currentTest.subjectBreakdowns.map((subj, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{subj.subject}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="primary" className="text-xs">{subj.status}</Badge>
                              <span className="font-black text-base text-indigo-600 dark:text-indigo-400">{subj.score}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                              style={{ width: `${subj.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Topic / Objective Question Breakdown Table */}
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Curriculum Objective Item Mastery
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-3">Topic / Concept</th>
                            <th className="p-3">Items Attempted</th>
                            <th className="p-3">Correct</th>
                            <th className="p-3">Accuracy</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {currentTest.topicBreakdown.map((tb, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-semibold text-slate-900 dark:text-white">{tb.topic}</td>
                              <td className="p-3">{tb.questions}</td>
                              <td className="p-3 font-bold text-emerald-600">{tb.correct}</td>
                              <td className="p-3 font-semibold">{tb.accuracy}%</td>
                              <td className="p-3">
                                <Badge variant={tb.status === 'Mastered' ? 'success' : 'primary'} className="text-[10px]">
                                  {tb.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Teacher Remarks Card for Selected Assessment */}
                <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    Teacher Observation for {currentTest.title}
                  </h3>
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2">
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{currentTest.teacherRemarks}"
                    </p>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeClassData.classTeacher}
                      </span>
                      <span>Verified: {currentTest.remarksDate}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Key Actions and Upcoming Exams */}
              <div className="space-y-4">
                <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Upcoming Examinations
                  </h3>
                  <div className="space-y-3">
                    {child.upcomingAssessments.map((a, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span>Scheduled: {a.date}</span>
                          <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                        Parent Advisory Notice
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Asian Public School conducts parent-teacher conferences at the conclusion of each diagnostic cycle. You may request an appointment with Mrs. Ananya Sharma through the school office.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Verified Assessment Scores & Attempt History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Showing published assessments for {activeClassData.className}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Class:</span>
              <select
                value={selectedClassKey}
                onChange={(e) => handleClassChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none"
              >
                {Object.keys(CLASS_ASSESSMENTS_DATA).map(ck => (
                  <option key={ck} value={ck}>{ck}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="p-3">Assessment Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">CBSE Grade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date Completed</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {activeClassData.tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{t.title}</td>
                    <td className="p-3 text-xs">{t.type}</td>
                    <td className="p-3 font-bold text-emerald-600">{t.score} / {t.maxScore}</td>
                    <td className="p-3">{t.percentage}%</td>
                    <td className="p-3 font-bold text-indigo-600">{t.grade}</td>
                    <td className="p-3"><Badge variant="success">Published</Badge></td>
                    <td className="p-3 text-xs text-slate-500">{t.date}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTestId(t.id);
                          setActiveTab('overview');
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                      >
                        Inspect Result →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Monthly Attendance Record (October 2026)
            </h2>
            <Badge variant="success">96% Present</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Official records verified from Asian Public School biometric and classroom register. Normalized to UTC midnight.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 20 }, (_, i) => {
              const isAbsent = i === 7;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg text-center border text-xs font-semibold ${
                    isAbsent
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <span className="block text-[10px] text-slate-500 font-normal">Day {i + 1}</span>
                  {isAbsent ? 'ABSENT' : 'PRESENT'}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === 'circulars' && (
        <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Official Asian Public School Circulars
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Circular No. APS/ACAD/2026/08 — Term 1 STEM Diagnostic Window
                </span>
                <span className="text-xs text-slate-500">2026-10-10</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Dear Parents, AdaptIQ deterministic diagnostic assessments for Class VII Middle Wing commence next week. Real-time telemetry will reflect on your guardian portal upon submission.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
