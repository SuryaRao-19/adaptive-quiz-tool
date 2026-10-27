import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  GraduationCap, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Download, 
  Send, 
  Sparkles, 
  ChevronDown, 
  Filter, 
  UserCheck, 
  TrendingUp, 
  FileSpreadsheet, 
  X, 
  Eye, 
  School,
  LayoutGrid,
  Table as TableIcon,
  UploadCloud,
  Printer,
  Key,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MOCK_CLASSES, MOCK_CLASS_ROSTER } from '../services/mockData';
import { getMyClasses, createClass, joinClass as apiJoinClass, importClassRoster } from '../services/classService';
import { getClassAnalytics } from '../services/progressService';

export const ClassroomHub = () => {
  const { user, role, switchRole, enrolledClasses, joinClass } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active view role toggle for showcase review
  const [activeRoleView, setActiveRoleView] = useState(role === 'teacher' ? 'teacher' : 'student');

  // Real Classes State
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Student Join Modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  // Teacher Create Class Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('Math');
  const [newClassGrade, setNewClassGrade] = useState('7');

  // Student Detail Modal (for teacher inspection)
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Roster Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Roster View Mode: 'auto' | 'cards' | 'table'
  const [viewMode, setViewMode] = useState('auto');

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  // Roster Import & Desk Cards State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedRoster, setParsedRoster] = useState([]);
  const [importValidation, setImportValidation] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [deskCardsModalOpen, setDeskCardsModalOpen] = useState(false);
  const [deskCards, setDeskCards] = useState([]);

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,student_name,roll_number\nAarav Sharma,001\nDiya Patel,002\nRohan Gupta,003\nAnanya Reddy,004\nVikram Malhotra,005\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "adaptiq_roster_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportValidation({ error: "CSV file must contain a header row and at least 1 student row." });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('id') || h.includes('number'));

      if (nameIdx === -1 || rollIdx === -1) {
        setImportValidation({ error: "Required columns missing. Expected headers: 'student_name' and 'roll_number'." });
        return;
      }

      const validRows = [];
      const invalidRows = [];
      const seenRolls = new Set();
      let duplicateCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const studentName = cols[nameIdx] || '';
        const rollNumber = cols[rollIdx] || '';

        if (!studentName || !rollNumber || rollNumber.length < 2) {
          invalidRows.push({ row: i + 1, studentName, rollNumber, reason: 'Missing name or roll number' });
          continue;
        }

        const normalizedRoll = rollNumber.toUpperCase();
        if (seenRolls.has(normalizedRoll)) {
          duplicateCount++;
          invalidRows.push({ row: i + 1, studentName, rollNumber, reason: `Duplicate roll number ${normalizedRoll}` });
          continue;
        }
        seenRolls.add(normalizedRoll);

        validRows.push({
          student_name: studentName,
          roll_number: normalizedRoll
        });
      }

      setParsedRoster(validRows);
      setImportValidation({
        totalRows: lines.length - 1,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        duplicateCount,
        invalidRows
      });
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!parsedRoster || parsedRoster.length === 0 || !selectedClassId) return;

    try {
      setIsImporting(true);
      const res = await importClassRoster(selectedClassId, parsedRoster);
      if (res.success) {
        setDeskCards(res.deskCards || []);
        setImportModalOpen(false);
        setDeskCardsModalOpen(true);
        setParsedRoster([]);
        setImportValidation(null);
        await fetchClasses();
        triggerToast(`Successfully onboarded ${res.summary?.createdCount || 0} students!`);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to import roster.');
    } finally {
      setIsImporting(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchClasses = async () => {
    try {
      const res = await getMyClasses();
      if (res.success && res.classes) {
        setClassesList(res.classes);
        if (res.classes.length > 0) {
          setSelectedClassId(res.classes[0]._id || res.classes[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching classes:', e);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setClassAnalytics(null);
      return;
    }
    getClassAnalytics(selectedClassId).then((res) => {
      if (res.success) setClassAnalytics(res);
    }).catch(() => {});
  }, [selectedClassId]);

  // Current selected class data
  const currentClass = classesList.find((c) => (c._id || c.id) === selectedClassId) || classesList[0] || {
    name: 'No Active Class',
    joinCode: '------',
    subject: 'Math',
    studentIds: []
  };

  // Filtered Roster from live backend
  const liveRoster = classAnalytics?.roster || [];
  const filteredRoster = liveRoster.filter((s) => {
    const sName = (s?.name || s?.fullName || '').toLowerCase();
    const sEmail = (s?.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = sName.includes(q) || sEmail.includes(q);
    const matchesStatus = statusFilter === 'ALL' || s?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Joining a Class (Real Backend)
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a 6-character class code.');
      return;
    }

    try {
      const res = await apiJoinClass(cleanCode);
      if (res.success) {
        setJoinSuccess(`Successfully enrolled in ${res.class?.name || 'Class'}!`);
        joinClass(cleanCode);
        await fetchClasses();
        setTimeout(() => {
          setJoinSuccess('');
          setJoinModalOpen(false);
          setJoinCodeInput('');
          triggerToast(`Enrolled in ${res.class?.name || 'Class'}!`);
        }, 1200);
      } else {
        setJoinError(res.message || 'Could not join class.');
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Invalid or non-existent class code.');
    }
  };

  // Handle Creating a Class (Real Backend)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const res = await createClass({
        name: newClassName.trim(),
        subject: newClassSubject,
        gradeLevel: Number(newClassGrade)
      });

      if (res.success && res.class) {
        setClassesList((prev) => [res.class, ...prev]);
        setSelectedClassId(res.class._id);
        setCreateModalOpen(false);
        setNewClassName('');
        triggerToast(`Created "${res.class.name}" with join code ${res.class.joinCode}!`);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to create classroom.');
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = "Name,Roll,BaselineScore,CurrentScore,GrowthDelta,PracticedQuestions,Status,LastActive\n";
    const rows = filteredRoster.map(s => {
      const sName = s?.name || s?.fullName || 'Student';
      const sRoll = s?.roll || s?.rollNumber || 'G7';
      const pre = s?.preScore || Math.max(0, (s?.mastery || 0) - 20);
      const post = s?.postScore || s?.mastery || 0;
      const delta = Math.max(0, post - pre);
      const practiced = s?.practiced ?? s?.attempts ?? 0;
      const st = s?.status || 'active';
      const last = s?.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Recent';
      return `"${sName}","${sRoll}",${pre}%,${post}%,+${delta}%,${practiced},"${st}","${last}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentClass.id || 'cohort'}_roster_export.csv`;
    a.click();
    triggerToast("Class roster exported as CSV!");
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

      {/* Header with Role View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[clamp(1.25rem,3.2vw,1.875rem)] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Classroom & Cohort Management
            </h1>
            <Badge variant="primary" size="sm">
              Live Hub
            </Badge>
          </div>
          <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-slate-500 dark:text-slate-400 mt-1">
            {activeRoleView === 'teacher' 
              ? 'Real-time cohort diagnostics, learning gap tracking, and automated interventions.'
              : 'View your enrolled classes, live teacher assignments, and group benchmarks.'}
          </p>
        </div>

        {/* Perspective Toggle Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveRoleView('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
              activeRoleView === 'student'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setActiveRoleView('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
              activeRoleView === 'teacher'
                ? 'bg-indigo-600 text-white shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Teacher Roster View
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT PERSPECTIVE VIEW */}
      {/* ========================================================================= */}
      {activeRoleView === 'student' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enrolled Classes</h2>
              <p className="text-xs text-slate-500">Classes assigned by your school teachers</p>
            </div>
            <Button
              onClick={() => setJoinModalOpen(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Join a Class
            </Button>
          </div>

          {classesList.length === 0 ? (
            <div className="space-y-6">
              {/* Inline Join Classroom Card */}
              <Card className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200/80 dark:border-indigo-800/80 shadow-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-glow-primary">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          Join Your School Classroom Cohort
                        </h3>
                        <Badge variant="primary" size="sm">Instant Enrollment</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Enter your teacher's 6-character code below to enroll into your classroom cohort, receive assigned quizzes, and compare scores with classmates.
                      </p>
                    </div>
                  </div>

                  {/* Inline Join Form */}
                  <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <input
                      type="text"
                      placeholder="e.g. MATH-7B"
                      maxLength={10}
                      value={joinCodeInput}
                      onChange={(e) => {
                        setJoinCodeInput(e.target.value.toUpperCase());
                        setJoinError('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      icon={UserCheck}
                    >
                      Join Classroom
                    </Button>
                  </form>
                </div>

                {joinError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{joinError}</span>
                  </div>
                )}
                {joinSuccess && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{joinSuccess}</span>
                  </div>
                )}
              </Card>

              {/* Available School Cohorts to Join (Quick Enroll) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Recommended School Cohorts
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click Quick Join to test enrollment into model school classes
                    </p>
                  </div>
                  <Badge variant="cyan" size="sm">Available to Join</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Class 7-B Mathematics",
                      subject: "Math",
                      code: "MATH-7B",
                      educator: "Mrs. Anita Rao",
                      description: "Covers Fractions, Decimals, Algebra Basics, and Geometry with weekly diagnostic tests."
                    },
                    {
                      name: "Class 7-A General Science",
                      subject: "Science",
                      code: "SCI-7A",
                      educator: "Mrs. Anita Rao",
                      description: "Covers Photosynthesis, Newton's Laws of Motion, Cell Biology, and Acids & Bases."
                    },
                    {
                      name: "Class 8-C Advanced Algebra",
                      subject: "Math",
                      code: "ALG-8C",
                      educator: "Mrs. Anita Rao",
                      description: "Accelerated track focusing on Linear Equations, Quadratic Systems, and Word Problems."
                    }
                  ].map((cohort) => (
                    <Card key={cohort.code} className="p-5 border border-slate-200/90 dark:border-slate-800 shadow-card flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={cohort.subject === 'Math' ? 'primary' : 'success'} size="sm">
                            {cohort.subject}
                          </Badge>
                          <code className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cohort.code}
                          </code>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                          {cohort.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          Educator: <strong className="text-slate-700 dark:text-slate-300">{cohort.educator}</strong>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                          {cohort.description}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-bold"
                        onClick={() => {
                          setJoinCodeInput(cohort.code);
                          apiJoinClass(cohort.code).then((res) => {
                            if (res.success) {
                              setJoinSuccess(`Enrolled in ${cohort.name}!`);
                              joinClass(cohort.code);
                              fetchClasses();
                              triggerToast(`Enrolled in ${cohort.name}!`);
                            } else {
                              setJoinError(res.message || 'Unable to join class');
                            }
                          }).catch(() => {
                            joinClass(cohort.code);
                            setClassesList(prev => [{
                              id: cohort.code,
                              _id: cohort.code,
                              name: cohort.name,
                              subject: cohort.subject,
                              gradeLevel: 7,
                              joinCode: cohort.code
                            }, ...prev]);
                            setSelectedClassId(cohort.code);
                            triggerToast(`Enrolled in ${cohort.name}!`);
                          });
                        }}
                      >
                        Quick Join {cohort.code} →
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Self-Paced Learning Options Card */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Prefer self-paced practice without a teacher cohort?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can immediately practice adaptive quizzes across all Math & Science secondary competencies.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/practice')}
                  >
                    Start Practice Mode →
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/library')}
                  >
                    Reference Library
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesList.map((c) => (
                <Card key={c._id || c.id} className="hover:shadow-card-hover transition-all border border-slate-200/90 dark:border-slate-800 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={c.subject === 'Math' ? 'primary' : 'success'} size="sm">
                        {c.subject} • Grade {c.gradeLevel || c.grade || 7}
                      </Badge>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.joinCode}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cohort Code: {c.joinCode}</span>
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Button
                      onClick={() => navigate(`/practice?subject=${encodeURIComponent(c.subject || 'Math')}`)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      Start Practice
                    </Button>
                  </div>
                </Card>
              ))}

              <div 
                onClick={() => setJoinModalOpen(true)}
                className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px]"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Join Another Class</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[180px]">
                  Enter teacher's 6-character code
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER PERSPECTIVE VIEW */}
      {/* ========================================================================= */}
      {activeRoleView === 'teacher' && (
        <div className="space-y-6 animate-fadeIn">
          {classesList.length === 0 ? (
            <div className="space-y-6">
              {/* Inline Create Classroom Form Card */}
              <Card className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-indigo-200/80 dark:border-indigo-800/80 shadow-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-glow-primary">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          Create Your First Classroom Cohort
                        </h3>
                        <Badge variant="primary" size="sm">Educator Suite</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Instantly generate a 6-character join code for your students to access curriculum quizzes, diagnostic tests, and real-time gap telemetry.
                      </p>
                    </div>
                  </div>

                  {/* Inline Creation Form */}
                  <form onSubmit={handleCreateSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <input
                      type="text"
                      placeholder="e.g. Class 7-B Math"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      required
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
                    />
                    <select
                      value={newClassSubject}
                      onChange={(e) => setNewClassSubject(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Math">Math</option>
                      <option value="Science">Science</option>
                    </select>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="6">Grade 6</option>
                      <option value="7">Grade 7</option>
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                    </select>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Plus}
                    >
                      Create Class
                    </Button>
                  </form>
                </div>
              </Card>

              {/* 1-Click Quick Classroom Templates */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Quick-Start Classroom Cohort Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 border border-slate-200/90 dark:border-slate-800 shadow-card flex items-center justify-between">
                    <div>
                      <Badge variant="primary" size="sm" className="mb-1.5">Grade 7 • Math</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Class 7-B Mathematics Cohort</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pre-calibrated with Fractions, Decimals, Algebra & Geometry modules.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewClassName('Class 7-B Mathematics');
                        setNewClassSubject('Math');
                        setNewClassGrade('7');
                        createClass({ name: 'Class 7-B Mathematics', subject: 'Math', gradeLevel: 7 }).then(res => {
                          if (res.success && res.class) {
                            setClassesList(prev => [res.class, ...prev]);
                            setSelectedClassId(res.class._id);
                            triggerToast(`Created Class 7-B Math with code ${res.class.joinCode}!`);
                          }
                        });
                      }}
                    >
                      Use Template →
                    </Button>
                  </Card>

                  <Card className="p-5 border border-slate-200/90 dark:border-slate-800 shadow-card flex items-center justify-between">
                    <div>
                      <Badge variant="success" size="sm" className="mb-1.5">Grade 7 • Science</Badge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Class 7-A General Science Cohort</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pre-calibrated with Photosynthesis, Newton's Laws & Cell Biology.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewClassName('Class 7-A General Science');
                        setNewClassSubject('Science');
                        setNewClassGrade('7');
                        createClass({ name: 'Class 7-A General Science', subject: 'Science', gradeLevel: 7 }).then(res => {
                          if (res.success && res.class) {
                            setClassesList(prev => [res.class, ...prev]);
                            setSelectedClassId(res.class._id);
                            triggerToast(`Created Class 7-A Science with code ${res.class.joinCode}!`);
                          }
                        });
                      }}
                    >
                      Use Template →
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Class Selector Bar & Primary Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      Active Classroom Cohort
                    </label>
                    <div className="relative inline-block mt-0.5 max-w-full">
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-full truncate"
                      >
                        {classesList.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name} ({c.joinCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
                  <Button
                    onClick={() => {
                      setImportValidation(null);
                      setParsedRoster([]);
                      setImportModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    icon={UploadCloud}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] text-xs font-bold"
                  >
                    Import Roster (CSV)
                  </Button>
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] text-xs font-bold"
                  >
                    Create New Class
                  </Button>
                </div>
              </div>

              {/* Quick Metrics for Selected Class: Responsive Grid (1 col mobile, 2 tablet, 4 desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enrolled Students</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-slate-900 dark:text-white mt-2 leading-none">
                    {liveRoster.length}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1.5 block">
                    Active learners in cohort
                  </span>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cohort Mastery</span>
                    <TrendingUp className="w-4 h-4 text-cyan-500" />
                  </div>
                  <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-slate-900 dark:text-white mt-2 leading-none">
                    {classAnalytics?.avgMastery ? `${classAnalytics.avgMastery}%` : '0%'}
                  </p>
                  <span className="text-[11px] text-indigo-600 dark:text-cyan-400 font-semibold mt-1.5 block">
                    Aggregated accuracy
                  </span>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Join Passcode</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[clamp(1.25rem,3vw,1.75rem)] font-mono font-extrabold text-indigo-600 dark:text-cyan-400 mt-2 leading-none">
                    {currentClass.joinCode || '------'}
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
                    Share with students
                  </span>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/90 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">At-Risk Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-rose-600 mt-2 leading-none">
                    {liveRoster.filter(s => s.status === 'needs_attention').length} Students
                  </p>
                  <span className="text-[11px] text-rose-500 font-medium mt-1.5 block">
                    Accuracy below 60%
                  </span>
                </Card>
              </div>

              {/* Controls Bar: Search, Status Filter, Export, Assign Test, View Switch */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search student by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      aria-label="Filter roster by status"
                      className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
                    >
                      <option value="ALL">All Cohort Statuses</option>
                      <option value="on_track">On Track</option>
                      <option value="needs_attention">Needs Attention</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Card / Table View Toggle Switch */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[32px] ${
                        viewMode === 'cards' || (viewMode === 'auto' && typeof window !== 'undefined' && window.innerWidth < 768)
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Card View (Stacked)"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cards</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all min-h-[32px] ${
                        viewMode === 'table' || (viewMode === 'auto' && typeof window !== 'undefined' && window.innerWidth >= 768)
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileSpreadsheet}
                    onClick={handleExportCSV}
                    className="text-xs font-bold min-h-[38px] px-3 flex-1 sm:flex-none"
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Clock}
                    onClick={() => {
                      triggerToast(`Timed diagnostic test assigned to all ${liveRoster.length} students in ${currentClass.name}!`);
                    }}
                    className="text-xs font-bold min-h-[38px] px-3 flex-1 sm:flex-none"
                  >
                    Assign Test
                  </Button>
                </div>
              </div>

              {/* Roster Table or Empty State */}
              {liveRoster.length === 0 ? (
                <Card className="p-8 text-center space-y-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No students have enrolled in this class yet.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Share the code <strong className="font-mono text-indigo-600 dark:text-cyan-400">{currentClass.joinCode}</strong> with your students so they can join from their "My Classes" screen.
                  </p>
                </Card>
              ) : filteredRoster.length === 0 ? (
                <Card className="p-8 text-center space-y-2 border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No students found matching your filters.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs mt-2"
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Mobile & Tablet Stacked Cards View (Label: Value pairs with min 44x44px touch targets) */}
                  <div className={`${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'grid' : 'grid md:hidden'} grid-cols-1 sm:grid-cols-2 gap-3.5`}>
                    {filteredRoster.map((student) => (
                      <Card key={student.id} className="p-4 border border-slate-200/90 dark:border-slate-800 shadow-card flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                {student.name}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                {student.email || 'No email provided'}
                              </p>
                            </div>
                            <Badge variant={student.status === 'on_track' ? 'success' : 'warning'} size="sm" className="shrink-0">
                              {student.status === 'on_track' ? 'On Track' : 'Needs Practice'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl px-2.5">
                            <div className="text-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attempts</span>
                              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">{student.attempts}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                              <span className="text-sm font-extrabold text-indigo-600 dark:text-cyan-400 font-mono">{student.accuracy}%</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mastery</span>
                              <span className="text-sm font-extrabold text-emerald-600 font-mono">{student.mastery}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-semibold min-h-[44px] px-3.5 w-full sm:w-auto"
                            onClick={() => setSelectedStudent(student)}
                          >
                            Inspect Details →
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Full Table View */}
                  <div className={`${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'} overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4">Student Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-center">Questions Attempted</th>
                            <th className="py-3 px-4 text-center">Accuracy</th>
                            <th className="py-3 px-4 text-center">Mastery</th>
                            <th className="py-3 px-4 text-center">Intervention Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {filteredRoster.map((student) => (
                            <tr key={student.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                {student.name}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {student.email}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                {student.attempts}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                {student.accuracy}%
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                                {student.mastery}%
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant={student.status === 'on_track' ? 'success' : 'warning'} size="sm">
                                  {student.status === 'on_track' ? 'On Track' : 'Needs Practice'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setSelectedStudent(student)}
                                  className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline min-h-[32px] px-2 py-1 rounded focus:outline-none"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Join Class Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join a Classroom"
        subtitle="Enter the 6-character code provided by your teacher"
      >
        <form onSubmit={handleJoinSubmit} className="space-y-4 mt-2">
          {joinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{joinError}</span>
            </div>
          )}

          {joinSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{joinSuccess}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Class Code
            </label>
            <input
              type="text"
              placeholder="e.g. MATH-7B"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold tracking-wider uppercase text-center focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Try demo code: <span className="font-mono font-bold text-indigo-600">ALG-8C</span> or <span className="font-mono font-bold text-indigo-600">MATH-7B</span>
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Confirm Enrollment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Class Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Classroom"
        subtitle="Generate an automated diagnostic group with instant join code"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Classroom Name</label>
            <input
              type="text"
              placeholder="e.g. Class 7-C Foundations"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
              <select
                value={newClassSubject}
                onChange={(e) => setNewClassSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none"
              >
                <option value="Math">Mathematics</option>
                <option value="Science">General Science</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Grade Level</label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none"
              >
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Create Classroom
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Deep-Dive Inspector Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.name}
          subtitle={`Roll: ${selectedStudent.roll} • Enrolled in ${currentClass.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 mt-2">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline</span>
                <span className="text-xl font-bold text-slate-700">{selectedStudent.preScore}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Post-Test</span>
                <span className="text-xl font-bold text-slate-900">{selectedStudent.postScore}%</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Net Growth</span>
                <span className="text-xl font-bold text-emerald-600">+{selectedStudent.postScore - selectedStudent.preScore}%</span>
              </div>
            </div>

            {/* Weak Areas Breakdown */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900">Identified Foundational Learning Gaps</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {selectedStudent.weakTopics && selectedStudent.weakTopics.length > 0 ? (
                  <>Struggling with: <span className="font-bold">{selectedStudent.weakTopics.join(', ')}</span>. The AI engine is serving Level 1 scaffolding.</>
                ) : (
                  <>No critical gaps identified! Student has achieved proficiency across all Grade 7 core competencies.</>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Last activity: {selectedStudent.lastActive}</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedStudent(null);
                    triggerToast(`Personalized practice recommendation dispatched to ${selectedStudent.name}!`);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Send Practice Quiz
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStudent(null);
                    navigate(`/report?student=${selectedStudent.id}&subject=Math`);
                  }}
                  variant="primary"
                  size="sm"
                  icon={ArrowUpRight}
                >
                  View Full Growth Report
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Roster Import Modal (CSV) */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Classroom Roster (CSV)"
        subtitle="Bulk-provision student accounts with roll numbers and generated PINs."
      >
        <div className="space-y-4 my-2">
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
            <div>
              <p className="font-bold">CSV Format Requirement:</p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Columns: <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">student_name</code> and <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">roll_number</code>.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={downloadSampleTemplate}
              className="shrink-0"
            >
              Sample CSV
            </Button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Roster File (.csv)
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          {importValidation && (
            <div className="space-y-3">
              {importValidation.error ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importValidation.error}</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold">
                      {importValidation.validCount} Valid
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg text-amber-800 dark:text-amber-300 font-bold">
                      {importValidation.duplicateCount} Duplicates
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-700 dark:text-slate-300 font-bold">
                      {importValidation.invalidCount} Skipped
                    </div>
                  </div>

                  {parsedRoster.length > 0 && (
                    <div className="mt-2 max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-700 font-bold">
                          <tr>
                            <th className="p-1.5">#</th>
                            <th className="p-1.5">Student Name</th>
                            <th className="p-1.5">Roll Number</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {parsedRoster.slice(0, 5).map((row, rIdx) => (
                            <tr key={rIdx}>
                              <td className="p-1.5 text-slate-400">{rIdx + 1}</td>
                              <td className="p-1.5 font-medium">{row.student_name}</td>
                              <td className="p-1.5 font-mono">{row.roll_number}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!parsedRoster || parsedRoster.length === 0 || isImporting}
              onClick={handleExecuteImport}
              icon={UploadCloud}
            >
              {isImporting ? 'Importing Roster...' : `Import ${parsedRoster.length} Students & Generate Cards`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Printable PIN Desk Cards Modal */}
      <Modal
        isOpen={deskCardsModalOpen}
        onClose={() => {
          setDeskCards([]);
          setDeskCardsModalOpen(false);
        }}
        title="Student PIN Desk Cards"
        subtitle="Print and cut these individual credential cards to distribute to students."
      >
        <div className="space-y-4 my-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 no-print">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>One-Time Credential View:</strong> Plaintext PINs are never permanently stored in unhashed form. Print these cards now for classroom distribution.
            </span>
          </div>

          {/* Printable Desk Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1 print:max-h-none print:overflow-visible print:grid-cols-2 print:gap-4">
            {deskCards.map((card, cIdx) => (
              <div
                key={cIdx}
                className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-2 print:border-black print:text-black print:shadow-none break-inside-avoid"
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800 print:border-black">
                  <div className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-indigo-600 print:text-black" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 print:text-black">
                      AdaptIQ Desk Card
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 print:text-black">
                    {currentClass.name}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white print:text-black truncate">
                    {card.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 print:text-black block">ROLL NUMBER</span>
                      <span className="font-mono font-extrabold text-xs text-indigo-700 dark:text-cyan-400 print:text-black">
                        {card.rollNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 print:text-black block">LOGIN PIN</span>
                      <span className="font-mono font-extrabold text-sm text-emerald-600 print:text-black tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 print:border-black">
                        {card.pin}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 print:text-black">
                  Use your Roll Number & 4-Digit PIN to log in. Keep this slip secure.
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
            <span className="text-xs text-slate-400">
              Total Cards: {deskCards.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Desk Cards
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDeskCards([]);
                  setDeskCardsModalOpen(false);
                }}
              >
                Done & Secure PINs
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
