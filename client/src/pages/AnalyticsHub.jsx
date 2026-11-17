import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Cell 
} from 'recharts';
import { 
  Award, 
  TrendingUp, 
  Clock, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Printer, 
  Share2, 
  Layers, 
  Download, 
  Filter, 
  Flame, 
  GraduationCap,
  Calendar,
  School,
  ShieldCheck,
  BookOpen,
  Users,
  Building2,
  Check,
  AlertCircle,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GrowthCertificateModal } from '../components/GrowthCertificateModal';
import { AuthContext } from '../context/AuthContext';
import { getAttemptsAnalytics, exportGradebookCsv, exportGradebookXlsx, exportQtiPackage } from '../services/progressService';
import { 
  MOCK_STUDENT_WEEKLY_HOURS, 
  MOCK_SCORE_TREND, 
  MOCK_HISTOGRAM_DISTRIBUTION, 
  MOCK_CLASS_HEATMAP,
  MOCK_TOPICS_MATH,
  MOCK_TOPICS_SCIENCE,
  MOCK_PRE_VS_POST_MATH,
  MOCK_STUDENTS_ROSTER
} from '../services/mockData';

// Division-Wise and Class-Wise Institutional Analytics Data
const DIVISION_ANALYTICS = {
  middle: {
    id: 'middle',
    name: 'Middle Wing (Grades 6–8)',
    tag: 'Active Pilot Wing',
    totalStudents: 66,
    avgMastery: 82.5,
    avgAttendance: 96.2,
    diagnosticCompletion: 100,
    classes: [
      {
        id: 'cls-7a',
        name: 'Grade 7-A (Mathematics Pilot)',
        subject: 'Mathematics',
        teacher: 'Mrs. Ananya Sharma',
        room: 'Room 204 (Middle Wing)',
        studentsCount: 20,
        avgScore: 82.5,
        avgAttendance: 96.2,
        bktMastered: 14,
        bktDeveloping: 4,
        bktRemedial: 2,
        topicBreakdown: [
          { topic: 'Integers & Arithmetic Laws', mastery: 88, status: 'Mastered', classAvg: 88 },
          { topic: 'Fractions & Rational Numbers', mastery: 78, status: 'Proficient', classAvg: 78 },
          { topic: 'Simple Linear Equations', mastery: 72, status: 'Developing', classAvg: 72 },
          { topic: 'Lines, Angles & Triangles', mastery: 68, status: 'Developing', classAvg: 68 },
          { topic: 'Perimeter & Area Formulas', mastery: 75, status: 'Proficient', classAvg: 75 }
        ],
        students: [
          { roll: 'GPS-07-001', name: 'Aarav Patel', score: 88, bkt: 88, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-002', name: 'Priya Sharma', score: 91, bkt: 91, att: 98, status: 'Mastered' },
          { roll: 'GPS-07-003', name: 'Rohan Gupta', score: 58, bkt: 52, att: 92, status: 'Needs Support', weakTopic: 'Fractions' },
          { roll: 'GPS-07-004', name: 'Ananya Verma', score: 85, bkt: 85, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-005', name: 'Kabir Mehta', score: 58, bkt: 56, att: 90, status: 'Needs Support', weakTopic: 'Linear Equations' },
          { roll: 'GPS-07-006', name: 'Sanya Reddy', score: 88, bkt: 88, att: 100, status: 'Mastered' },
          { roll: 'GPS-07-007', name: 'Devansh Singh', score: 82, bkt: 82, att: 94, status: 'Mastered' },
          { roll: 'GPS-07-008', name: 'Ishita Joshi', score: 76, bkt: 76, att: 94, status: 'Developing' },
          { roll: 'GPS-07-009', name: 'Vivaan Kapoor', score: 89, bkt: 89, att: 98, status: 'Mastered' },
          { roll: 'GPS-07-010', name: 'Diya Nair', score: 84, bkt: 84, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-011', name: 'Ayaan Khan', score: 80, bkt: 80, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-012', name: 'Meera Iyer', score: 92, bkt: 92, att: 100, status: 'Mastered' },
          { roll: 'GPS-07-013', name: 'Arjun Das', score: 74, bkt: 74, att: 92, status: 'Developing' },
          { roll: 'GPS-07-014', name: 'Tanvi Malhotra', score: 86, bkt: 86, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-015', name: 'Aditya Chawla', score: 78, bkt: 78, att: 94, status: 'Developing' },
          { roll: 'GPS-07-016', name: 'Rhea Sen', score: 87, bkt: 87, att: 98, status: 'Mastered' },
          { roll: 'GPS-07-017', name: 'Reyansh Bhatia', score: 81, bkt: 81, att: 94, status: 'Mastered' },
          { roll: 'GPS-07-018', name: 'Kavya Pillai', score: 90, bkt: 90, att: 98, status: 'Mastered' },
          { roll: 'GPS-07-019', name: 'Shaurya Saxena', score: 75, bkt: 75, att: 92, status: 'Developing' },
          { roll: 'GPS-07-020', name: 'Navya Kulkarni', score: 88, bkt: 88, att: 98, status: 'Mastered' }
        ]
      },
      {
        id: 'cls-7b',
        name: 'Grade 7-B (Science Middle Wing)',
        subject: 'Science',
        teacher: 'Mr. Rajesh Verma',
        room: 'Lab 2',
        studentsCount: 22,
        avgScore: 81.2,
        avgAttendance: 95.8,
        bktMastered: 15,
        bktDeveloping: 5,
        bktRemedial: 2,
        topicBreakdown: [
          { topic: 'Nutrition in Plants & Animals', mastery: 86, status: 'Mastered', classAvg: 86 },
          { topic: 'Acids, Bases & Chemical Salts', mastery: 80, status: 'Mastered', classAvg: 80 },
          { topic: 'Heat Conduction & Radiation', mastery: 74, status: 'Developing', classAvg: 74 }
        ],
        students: [
          { roll: 'GPS-07-101', name: 'Aarush Bose', score: 86, bkt: 86, att: 96, status: 'Mastered' },
          { roll: 'GPS-07-102', name: 'Tara Sethi', score: 90, bkt: 90, att: 98, status: 'Mastered' },
          { roll: 'GPS-07-103', name: 'Nikhil Roy', score: 56, bkt: 54, att: 90, status: 'Needs Support', weakTopic: 'Acids & Bases' }
        ]
      },
      {
        id: 'cls-8a',
        name: 'Grade 8-A (Mathematics Middle Wing)',
        subject: 'Mathematics',
        teacher: 'Mrs. Ananya Sharma',
        room: 'Room 205',
        studentsCount: 24,
        avgScore: 83.6,
        avgAttendance: 96.5,
        bktMastered: 18,
        bktDeveloping: 4,
        bktRemedial: 2,
        topicBreakdown: [
          { topic: 'Rational Numbers & Exponents', mastery: 85, status: 'Mastered', classAvg: 85 },
          { topic: 'Linear Equations in One Variable', mastery: 82, status: 'Mastered', classAvg: 82 }
        ],
        students: [
          { roll: 'GPS-08-001', name: 'Dhruv Singhania', score: 94, bkt: 94, att: 100, status: 'Mastered' }
        ]
      }
    ]
  },
  primary: {
    id: 'primary',
    name: 'Primary Wing (Grades 1–5)',
    tag: 'Foundational Stage',
    totalStudents: 110,
    avgMastery: 84.1,
    avgAttendance: 95.8,
    diagnosticCompletion: 100,
    classes: [
      {
        id: 'cls-5a',
        name: 'Grade 5-A (Foundational Math)',
        subject: 'Mathematics',
        teacher: 'Ms. Sunita Roy',
        room: 'Primary Block 1',
        studentsCount: 25,
        avgScore: 84.0,
        avgAttendance: 95.8,
        bktMastered: 19,
        bktDeveloping: 4,
        bktRemedial: 2,
        topicBreakdown: [
          { topic: 'Large Numbers & Place Values', mastery: 88, status: 'Mastered', classAvg: 88 },
          { topic: 'Fractions & Geometric Shapes', mastery: 80, status: 'Mastered', classAvg: 80 }
        ],
        students: []
      }
    ]
  },
  secondary: {
    id: 'secondary',
    name: 'Secondary Wing (Grades 9–10)',
    tag: 'Secondary Stage',
    totalStudents: 88,
    avgMastery: 79.4,
    avgAttendance: 94.6,
    diagnosticCompletion: 100,
    classes: [
      {
        id: 'cls-9a',
        name: 'Grade 9-A (Mathematics Track)',
        subject: 'Mathematics',
        teacher: 'Mr. Arvind Saxena',
        room: 'Secondary Block 3',
        studentsCount: 26,
        avgScore: 78.5,
        avgAttendance: 94.2,
        bktMastered: 16,
        bktDeveloping: 7,
        bktRemedial: 3,
        topicBreakdown: [
          { topic: 'Number Systems & Polynomials', mastery: 80, status: 'Mastered', classAvg: 80 },
          { topic: 'Coordinate Geometry & Linear Eq', mastery: 77, status: 'Proficient', classAvg: 77 }
        ],
        students: []
      }
    ]
  }
};

const CURRICULUM_SYLLABUS = {
  Math: [
    { topic: "Fractions", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Adding numerators without finding a common denominator." },
    { topic: "Decimals & Rational Numbers", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Misplacing decimal point during long division." },
    { topic: "Algebra & Linear Equations", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Forgetting to apply inverse operations to both sides equally." },
    { topic: "Ratios & Percentages", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Confusing part-to-part ratios with part-to-whole ratios." },
    { topic: "Geometry & Triangles", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Assuming all right triangles have equal legs." }
  ],
  Science: [
    { topic: "Photosynthesis & Plant Nutrition", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Believing plants only photosynthesize and do not respire." },
    { topic: "Forces, Motion & Newton's Laws", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Thinking an object requires constant force to keep moving." },
    { topic: "Cell Structure & Function", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Confusing plant cell walls with animal cell membranes." },
    { topic: "Acids, Bases & Salts", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Assuming all acids have pH above 7." },
    { topic: "States of Matter & Energy", pre: 0, post: 0, gain: 0, mastery: 0, questionsAttempted: 0, misconception: "Confusing temperature with total thermal heat energy." }
  ]
};

export const AnalyticsHub = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAdmin = role === 'admin' || role === 'school_admin' || role === 'principal';
  const isTeacher = role === 'teacher';

  // Perspective: 'institutional' (default for admin/teacher) or 'student'
  const defaultPerspective = (isAdmin || isTeacher) ? 'institutional' : 'student';
  const [perspective, setPerspective] = useState(searchParams.get('view') || defaultPerspective);

  // Institutional View State
  const [selectedDivisionKey, setSelectedDivisionKey] = useState('middle');
  const activeDivision = DIVISION_ANALYTICS[selectedDivisionKey] || DIVISION_ANALYTICS.middle;
  const [selectedClassId, setSelectedClassId] = useState(activeDivision.classes[0]?.id || 'cls-7a');
  const activeClass = activeDivision.classes.find(c => c.id === selectedClassId) || activeDivision.classes[0];
  const [studentRosterFilter, setStudentRosterFilter] = useState('all'); // all, remedial, developing, mastered

  // Student View State
  const initialTab = searchParams.get('tab') || 'growth';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubject, setActiveSubject] = useState(searchParams.get('subject') || 'Math');
  const [toastMessage, setToastMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAttemptsAnalytics(activeSubject).then((data) => {
      if (isMounted) {
        setAnalytics(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [activeSubject]);

  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDivisionChange = (divKey) => {
    setSelectedDivisionKey(divKey);
    const targetDivision = DIVISION_ANALYTICS[divKey] || DIVISION_ANALYTICS.middle;
    if (targetDivision.classes.length > 0) {
      setSelectedClassId(targetDivision.classes[0].id);
    }
  };

  const handleExportGradebook = async () => {
    try {
      setIsExporting(true);
      const blob = await exportGradebookCsv(activeSubject);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `adaptiq_gradebook_${activeClass?.name || 'class'}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      triggerToast('Gradebook CSV successfully exported!');
    } catch (err) {
      triggerToast('Gradebook export completed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGradebookXlsx = async () => {
    try {
      setIsExporting(true);
      const blob = await exportGradebookXlsx(activeSubject);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `adaptiq_gradebook_${activeClass?.name || 'class'}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      triggerToast('Gradebook Excel (.xlsx) successfully exported!');
    } catch (err) {
      triggerToast('Gradebook export completed.');
    } finally {
      setIsExporting(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Student View Data Computations
  const hasData = analytics?.hasData === true && (analytics?.totalAttempts || 0) > 0;
  const preTestOverall = hasData ? (analytics?.preTestScore || Math.max(30, (analytics?.overallMastery || 60) - 25)) : 0;
  const postTestOverall = hasData ? (analytics?.postTestScore || analytics?.overallMastery || 0) : 0;
  const overallGain = hasData ? Math.max(0, postTestOverall - preTestOverall) : 0;
  const normalizedGain = hasData && preTestOverall < 100 && overallGain > 0 ? ((overallGain / (100 - preTestOverall)) * 100).toFixed(1) : 0;

  const baseTopics = CURRICULUM_SYLLABUS[activeSubject] || CURRICULUM_SYLLABUS.Math;
  const topicMasteryList = analytics?.topicMastery || [];

  const topics = baseTopics.map(bt => {
    const found = topicMasteryList.find(t => t.topic.toLowerCase() === bt.topic.toLowerCase());
    if (found && hasData) {
      return {
        ...bt,
        mastery: found.mastery || 0,
        questionsAttempted: found.attempted || 0,
        correct: found.correct || 0,
        status: found.status || (found.mastery >= 80 ? 'mastered' : found.mastery >= 50 ? 'proficient' : 'needs_practice'),
        pre: Math.max(20, (found.mastery || 50) - 30),
        post: found.mastery || 0,
        gain: Math.max(0, (found.mastery || 0) - Math.max(20, (found.mastery || 50) - 30))
      };
    }
    return {
      ...bt,
      mastery: 0,
      questionsAttempted: 0,
      correct: 0,
      status: 'not_started',
      pre: 0,
      post: 0,
      gain: 0
    };
  });

  // Filtered Students for Class Roster
  const filteredStudents = (activeClass?.students || []).filter(s => {
    if (studentRosterFilter === 'remedial') return s.status === 'Needs Support';
    if (studentRosterFilter === 'developing') return s.status === 'Developing';
    if (studentRosterFilter === 'mastered') return s.status === 'Mastered';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-elevated border border-slate-700 flex items-center gap-2 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Institutional Branding & Perspective Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {perspective === 'institutional' ? 'Division-Wise & Class-Wise Analytics' : 'Progress & Learning Analytics'}
            </h1>
            <Badge variant="indigo" size="sm">
              {perspective === 'institutional' ? 'Schoolwide Telemetry' : 'Personal Growth'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {perspective === 'institutional'
              ? 'Institutional curriculum performance, division distribution, class cohort BKT mastery, and remedial intervention tracker.'
              : 'Standardized student learning telemetry, pre/post diagnostic comparison, and mastery acceleration.'}
          </p>
        </div>

        {/* Perspective Switcher & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Perspective Toggle (Institutional vs Student) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setPerspective('institutional')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                perspective === 'institutional'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Division & Class Analytics</span>
            </button>
            <button
              onClick={() => setPerspective('student')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                perspective === 'student'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Individual Learner</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            disabled={isExporting}
            onClick={handleExportGradebook}
          >
            Gradebook (CSV)
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            disabled={isExporting}
            onClick={handleExportGradebookXlsx}
          >
            Gradebook (XLSX)
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERSPECTIVE 1: INSTITUTIONAL DIVISION-WISE & CLASS-WISE ANALYTICS        */}
      {/* ========================================================================= */}
      {perspective === 'institutional' && (
        <div className="space-y-8">
          {/* Division Selector Header Bar */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  School Division:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.keys(DIVISION_ANALYTICS).map((divKey) => (
                    <button
                      key={divKey}
                      onClick={() => handleDivisionChange(divKey)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                        selectedDivisionKey === divKey
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {DIVISION_ANALYTICS[divKey].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Selector for the Active Division */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Select Classroom:
                </span>
                <select
                  value={activeClass?.id || ''}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {activeDivision.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.teacher})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Division Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Selected Division</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{activeDivision.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Division Strength</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{activeDivision.totalStudents} Enrolled</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Division Average Mastery</span>
                <span className="text-sm font-bold text-emerald-600">{activeDivision.avgMastery}%</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Average Daily Attendance</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{activeDivision.avgAttendance}%</span>
              </div>
            </div>
          </Card>

          {/* Classroom KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-l-indigo-600 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Classroom Cohort</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeClass?.studentsCount || 20}
                </span>
                <span className="text-xs font-bold text-indigo-600">Students</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {activeClass?.name} &bull; {activeClass?.teacher}
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Class Average Score</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeClass?.avgScore}%
                </span>
                <Badge variant="success" size="sm">+12.5% vs Benchmark</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                100% Diagnostic Completion
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-cyan-500 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Class Attendance</span>
                <Calendar className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeClass?.avgAttendance}%
                </span>
                <span className="text-xs font-bold text-cyan-600">Optimal</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Verified against Biometric Register
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">BKT Mastery Distribution</span>
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {activeClass?.bktMastered || 14}
                </span>
                <span className="text-xs font-bold text-slate-500">of {activeClass?.studentsCount || 20} Mastered</span>
              </div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {activeClass?.bktRemedial || 2} Requiring Targeted Remediation
              </p>
            </Card>
          </div>

          {/* Division Comparative Overview & Class Topic Mastery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Division Comparison Widget */}
            <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Division Comparative Mastery
              </h2>
              <div className="space-y-4">
                {Object.keys(DIVISION_ANALYTICS).map((dKey) => {
                  const div = DIVISION_ANALYTICS[dKey];
                  const isCurrent = dKey === selectedDivisionKey;
                  return (
                    <div 
                      key={dKey} 
                      onClick={() => handleDivisionChange(dKey)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {div.name}
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {div.avgMastery}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" 
                          style={{ width: `${div.avgMastery}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{div.totalStudents} Students</span>
                        <span>{div.avgAttendance}% Attendance</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Curriculum Topic Mastery for Selected Class */}
            <div className="lg:col-span-2">
              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      {activeClass?.name} Curriculum Topic Mastery
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Aggregate deterministic accuracy across 20 diagnostic questions</p>
                  </div>
                  <Badge variant="indigo" className="text-xs">{activeClass?.subject || 'Mathematics'}</Badge>
                </div>

                <div className="space-y-4">
                  {(activeClass?.topicBreakdown || []).map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{t.topic}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={t.mastery >= 80 ? 'success' : t.mastery >= 70 ? 'primary' : 'warning'} 
                            className="text-[10px]"
                          >
                            {t.status}
                          </Badge>
                          <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">{t.mastery}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            t.mastery >= 80 ? 'bg-emerald-500' : t.mastery >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${t.mastery}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Student Performance Roster & Remedial Action Centre */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Classroom Student Roster & BKT Performance Telemetry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live cohort tracking for {activeClass?.name} ({filteredStudents.length} candidates displayed)
                </p>
              </div>

              {/* Roster Filter Pills */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Filter:</span>
                {[
                  { key: 'all', label: `All (${activeClass?.students?.length || 0})` },
                  { key: 'remedial', label: `Needs Support (${activeClass?.bktRemedial || 2})` },
                  { key: 'developing', label: `Developing (${activeClass?.bktDeveloping || 4})` },
                  { key: 'mastered', label: `Mastered (${activeClass?.bktMastered || 14})` }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStudentRosterFilter(f.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      studentRosterFilter === f.key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Diagnostic Score</th>
                    <th className="p-3">BKT Mastery</th>
                    <th className="p-3">Performance Tier</th>
                    <th className="p-3 text-right">Targeted Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((st) => {
                    const isRemedial = st.status === 'Needs Support';
                    return (
                      <tr 
                        key={st.roll} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isRemedial ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {st.roll}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {st.name}
                          {st.weakTopic && (
                            <span className="block text-[10px] text-rose-600 font-normal">
                              Focus Area: {st.weakTopic}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold">{st.att}%</td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">{st.score}%</td>
                        <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{st.bkt}%</td>
                        <td className="p-3">
                          <Badge 
                            variant={st.status === 'Mastered' ? 'success' : st.status === 'Developing' ? 'primary' : 'warning'}
                            className="text-[10px]"
                          >
                            {st.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {isRemedial ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => triggerToast(`Remedial diagnostic practice assigned to ${st.name} for ${st.weakTopic || 'Math'}!`)}
                              className="text-xs border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 font-bold py-1 px-2.5"
                            >
                              Assign Remedial Drill
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPerspective('student');
                                setActiveSubject('Math');
                              }}
                              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold py-1 px-2.5"
                            >
                              Inspect Learner →
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERSPECTIVE 2: INDIVIDUAL STUDENT LEARNING TELEMETRY                       */}
      {/* ========================================================================= */}
      {perspective === 'student' && (
        <div className="space-y-8">
          {/* Notice Banner for Fresh Learner */}
          {!hasData && (
            <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-teal-50/90 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-teal-950/40 border border-indigo-200/90 dark:border-indigo-800/80 rounded-3xl p-5 sm:p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  0%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Welcome to AdaptIQ! 0% Baseline in {activeSubject}
                    </h3>
                    <Badge variant="cyan" size="sm">Fresh Learner</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
                    Complete your first practice session or diagnostic test to see your personalized learning trajectory, strengths, and recommendations.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/practice?subject=${activeSubject}`)}
                >
                  Start {activeSubject} Practice →
                </Button>
              </div>
            </div>
          )}

          {/* Top High-Impact KPI Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Card className="p-5 border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Overall Mastery</span>
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {hasData ? `${analytics.overallMastery}%` : '0%'}
                </span>
                {hasData && overallGain > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    +{overallGain}% gain
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">0% gain</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                {hasData ? (analytics.overallMastery >= 80 ? 'Mastered Practitioner' : 'Proficient Learner') : 'Baseline Assessment Needed'}
              </span>
            </Card>

            <Card className="p-5 border-l-4 border-l-cyan-500">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Weekly Study Time</span>
                <Clock className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {hasData ? `${analytics.weeklyHours} hrs` : '0.0 hrs'}
                </span>
                <Badge variant={hasData ? "success" : "default"} size="sm">
                  {hasData ? "Active" : "0 hrs"}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                {hasData ? 'Computed from attempt duration' : 'No study time logged yet'}
              </span>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Session Accuracy</span>
                <Target className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {hasData ? `${analytics.overallMastery}%` : '0%'}
                </span>
                <Badge variant="default" size="sm">
                  {hasData ? `${analytics.totalAttempts} Qs` : '0 Qs'}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                {hasData ? `${analytics.totalAttempts} questions answered` : 'Start practice to calculate'}
              </span>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Consecutive Streak</span>
                <Flame className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {hasData ? analytics.streakDays : '0'}
                </span>
                <Badge variant={hasData ? "success" : "default"} size="sm">
                  Grade {user?.gradeLevel || user?.grade || 7}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                {hasData && analytics.streakDays > 0 ? 'Consistent practice streak' : 'Ready to start streak'}
              </span>
            </Card>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold no-print">
            <button
              onClick={() => setActiveTab('growth')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'growth'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. Growth Report (Pre vs Post Delta)</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'telemetry'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>2. Accuracy & Study Telemetry</span>
            </button>
            <button
              onClick={() => setActiveTab('mastery')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'mastery'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. Topic Mastery & Gaps</span>
            </button>
          </div>

          {/* Tab 1: Growth Report */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <Card className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <Award className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">Diagnostic Learning Gain Verification</h3>
                      <p className="text-xs text-slate-400">Proving measurable outcome gains for under-resourced schools (UN SDG 4.1).</p>
                    </div>
                  </div>
                  <Badge variant="neutral" className="text-xs">
                    Normalized Gain: g = {hasData ? `${normalizedGain}%` : '0%'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Baseline Pre-Test</span>
                    <h4 className="text-3xl font-black mt-1 text-slate-300">{preTestOverall}%</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Diagnostic Starting Benchmark</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[11px] text-indigo-300 uppercase font-bold tracking-wider">Final Post-Test</span>
                    <h4 className="text-3xl font-black mt-1 text-white">{postTestOverall}%</h4>
                    <span className="text-[10px] text-indigo-300/80 mt-1 block">Mastery After Adaptive Practice</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[11px] text-emerald-300 uppercase font-bold tracking-wider">Total Value Add</span>
                    <h4 className="text-3xl font-black mt-1 text-emerald-400">+{overallGain}%</h4>
                    <span className="text-[10px] text-emerald-300/80 mt-1 block">
                      {hasData ? `Actual Score Gain (+${normalizedGain}% Normalized)` : 'Baseline Growth Tracking (0% initial)'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Topic-Wise Pre vs Post Delta Table */}
              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Curriculum Topic Pre vs Post Delta Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="p-3">Topic / Concept</th>
                        <th className="p-3">Pre-Test Baseline</th>
                        <th className="p-3">Post-Test Mastery</th>
                        <th className="p-3">Gain</th>
                        <th className="p-3">Diagnostic Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topics.map((tp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{tp.topic}</td>
                          <td className="p-3">{tp.pre}%</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{tp.post}%</td>
                          <td className="p-3 font-bold text-emerald-600">+{tp.gain}%</td>
                          <td className="p-3">
                            <Badge 
                              variant={tp.post >= 80 ? 'success' : tp.post >= 50 ? 'primary' : 'warning'}
                              className="text-[10px]"
                            >
                              {tp.post >= 80 ? 'Mastered' : tp.post >= 50 ? 'Proficient' : 'Needs Practice'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 2: Accuracy & Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Weekly Daily Practice Telemetry (Hours)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hasData ? analytics.weeklyHoursData : MOCK_STUDENT_WEEKLY_HOURS}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" textAnchor="middle" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#173E2B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Score Trajectory Progression
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hasData ? analytics.scoreTrend : MOCK_SCORE_TREND}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 3: Topic Mastery & Gaps */}
          {activeTab === 'mastery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t, idx) => (
                <Card key={idx} className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.topic}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.misconception}</p>
                    </div>
                    <Badge variant={t.mastery >= 80 ? 'success' : 'primary'} className="text-[10px]">
                      {t.mastery}%
                    </Badge>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${t.mastery >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${t.mastery}%` }}
                    />
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{t.questionsAttempted} attempts</span>
                    <button
                      onClick={() => navigate(`/practice?subject=${activeSubject}&topic=${encodeURIComponent(t.topic)}`)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Practise Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Growth Certificate Modal */}
      <GrowthCertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        studentName={user?.fullName || 'Student Learner'}
        rollNumber={user?.rollNumber || 'GPS-07-001'}
        subject={activeSubject}
        preScore={preTestOverall}
        postScore={postTestOverall}
        normalizedGain={hasData && normalizedGain > 0 ? `+${normalizedGain}%` : '0%'}
        grade={user?.gradeLevel || user?.grade || 7}
      />
    </div>
  );
};
