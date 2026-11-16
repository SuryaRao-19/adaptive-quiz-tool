import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  GraduationCap, 
  TrendingUp,
  Plus,
  BookOpen,
  HelpCircle,
  School,
  Calendar,
  Clock,
  Radio,
  ClipboardList,
  CheckSquare,
  ArrowRight,
  Activity,
  Layers,
  X,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SupportInbox } from '../components/support/SupportInbox';
import { AuthContext } from '../context/AuthContext';
import { getTeacherDashboard, getTeacherClassrooms } from '../services/teacherAssessmentService';
import { getClassAnalytics } from '../services/progressService';
import { MOCK_CLASSES } from '../services/mockData';

const DEMO_STUDENT_NAMES = [
  { name: 'Aarav Patel', roll: 'APS-07-001', email: 'aarav.p@asianpublicschool.edu', attempts: 12, accuracy: 88, mastery: 85, status: 'on_track' },
  { name: 'Priya Sharma', roll: 'APS-07-002', email: 'priya.s@asianpublicschool.edu', attempts: 14, accuracy: 92, mastery: 90, status: 'on_track' },
  { name: 'Rohan Gupta', roll: 'APS-07-003', email: 'rohan.g@asianpublicschool.edu', attempts: 10, accuracy: 72, mastery: 70, status: 'on_track' },
  { name: 'Ananya Verma', roll: 'APS-07-004', email: 'ananya.v@asianpublicschool.edu', attempts: 15, accuracy: 85, mastery: 82, status: 'on_track' },
  { name: 'Kabir Mehta', roll: 'APS-07-005', email: 'kabir.m@asianpublicschool.edu', attempts: 11, accuracy: 70, mastery: 68, status: 'on_track' },
  { name: 'Sanya Reddy', roll: 'APS-07-006', email: 'sanya.r@asianpublicschool.edu', attempts: 13, accuracy: 88, mastery: 86, status: 'on_track' },
  { name: 'Devansh Singh', roll: 'APS-07-007', email: 'devansh.s@asianpublicschool.edu', attempts: 12, accuracy: 82, mastery: 80, status: 'on_track' },
  { name: 'Ishita Joshi', roll: 'APS-07-008', email: 'ishita.j@asianpublicschool.edu', attempts: 9, accuracy: 76, mastery: 74, status: 'on_track' },
  { name: 'Vivaan Kapoor', roll: 'APS-07-009', email: 'vivaan.k@asianpublicschool.edu', attempts: 14, accuracy: 89, mastery: 87, status: 'on_track' },
  { name: 'Diya Mukherjee', roll: 'APS-07-010', email: 'diya.m@asianpublicschool.edu', attempts: 16, accuracy: 92, mastery: 90, status: 'on_track' },
  { name: 'Arjun Nair', roll: 'APS-07-011', email: 'arjun.n@asianpublicschool.edu', attempts: 11, accuracy: 79, mastery: 76, status: 'on_track' },
  { name: 'Meera Iyer', roll: 'APS-07-012', email: 'meera.i@asianpublicschool.edu', attempts: 13, accuracy: 86, mastery: 84, status: 'on_track' },
  { name: 'Siddharth Rao', roll: 'APS-07-013', email: 'siddharth.r@asianpublicschool.edu', attempts: 10, accuracy: 80, mastery: 78, status: 'on_track' },
  { name: 'Tanvi Bhatia', roll: 'APS-07-014', email: 'tanvi.b@asianpublicschool.edu', attempts: 15, accuracy: 94, mastery: 92, status: 'on_track' },
  { name: 'Aditya Sen', roll: 'APS-07-015', email: 'aditya.s@asianpublicschool.edu', attempts: 10, accuracy: 74, mastery: 72, status: 'on_track' },
  { name: 'Riya Chawla', roll: 'APS-07-016', email: 'riya.c@asianpublicschool.edu', attempts: 12, accuracy: 87, mastery: 85, status: 'on_track' },
  { name: 'Varun Kulkarni', roll: 'APS-07-017', email: 'varun.k@asianpublicschool.edu', attempts: 11, accuracy: 81, mastery: 79, status: 'on_track' },
  { name: 'Sneha Pillai', roll: 'APS-07-018', email: 'sneha.p@asianpublicschool.edu', attempts: 14, accuracy: 90, mastery: 88, status: 'on_track' },
  { name: 'Pranav Mishra', roll: 'APS-07-019', email: 'pranav.m@asianpublicschool.edu', attempts: 10, accuracy: 78, mastery: 75, status: 'on_track' },
  { name: 'Kavya Saxena', roll: 'APS-07-020', email: 'kavya.s@asianpublicschool.edu', attempts: 12, accuracy: 85, mastery: 83, status: 'on_track' }
];

export const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTeacherTab, setActiveTeacherTab] = useState('overview');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Fetch Teacher Dashboard Stats & Classrooms from actual backend API
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getTeacherDashboard().catch(() => null),
      getTeacherClassrooms().catch(() => null)
    ]).then(([dashRes, classRes]) => {
      if (isMounted) {
        if (dashRes && dashRes.stats) {
          setDashboardData(dashRes);
        } else {
          // Reliable fallback
          setDashboardData({
            stats: {
              totalAssignedStudents: 20,
              activeClassrooms: 1,
              upcomingAssessments: 1,
              ongoingAssessments: 0,
              pendingSubmissions: 0,
              pendingGrading: 0,
              todayAttendancePercent: 100,
              todayAttendanceLabel: '20/20 Present Today'
            },
            studentsNeedingIntervention: [],
            recentActivity: [
              {
                id: 'act-1',
                type: 'test_completion',
                title: 'Grade 7-A Diagnostic Assessment Ready',
                description: '20 students enrolled for Grade 7 CBSE Mathematics pilot evaluation.',
                timestamp: 'Active Session',
                badge: 'Assessment'
              },
              {
                id: 'act-2',
                type: 'attendance_marked',
                title: 'Morning Attendance recorded for Grade 7-A',
                description: '20/20 students present (100% attendance rate).',
                timestamp: 'Today 8:30 AM',
                badge: 'Attendance'
              }
            ]
          });
        }

        const classList = classRes?.classrooms?.length > 0 ? classRes.classrooms : MOCK_CLASSES;
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id || classList[0]._id);
        }
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Class Analytics for Selected Class
  useEffect(() => {
    if (!selectedClassId) return;

    const currentClass = classes.find(c => (c.id || c._id) === selectedClassId) || classes[0];

    getClassAnalytics(selectedClassId).then((res) => {
      if (res.success && res.roster && res.roster.length > 0) {
        setClassAnalytics(res);
      } else {
        setClassAnalytics({
          success: true,
          joinCode: currentClass?.joinCode || 'APS7AM',
          className: currentClass?.name || 'Grade 7-A Mathematics',
          avgMastery: currentClass?.avgMastery || 76,
          roster: DEMO_STUDENT_NAMES.map((s, idx) => ({
            id: `aps-stu-${idx + 1}`,
            name: s.name,
            rollNumber: s.roll,
            email: s.email,
            attempts: s.attempts,
            accuracy: s.accuracy,
            mastery: s.mastery,
            status: s.status
          }))
        });
      }
    }).catch(() => {
      setClassAnalytics({
        success: true,
        joinCode: currentClass?.joinCode || 'APS7AM',
        className: currentClass?.name || 'Grade 7-A Mathematics',
        avgMastery: currentClass?.avgMastery || 76,
        roster: DEMO_STUDENT_NAMES.map((s, idx) => ({
          id: `aps-stu-${idx + 1}`,
          name: s.name,
          rollNumber: s.roll,
          email: s.email,
          attempts: s.attempts,
          accuracy: s.accuracy,
          mastery: s.mastery,
          status: s.status
        }))
      });
    });
  }, [selectedClassId, classes]);

  const roster = classAnalytics?.roster || [];
  const filteredRoster = roster.filter(s => {
    const sName = (s?.name || s?.fullName || '').toLowerCase();
    const sEmail = (s?.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = sName.includes(term) || sEmail.includes(term);
    const matchesStatus = statusFilter === 'all' || s?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onTrackCount = roster.filter(s => s?.status === 'on_track').length;
  const needsAttentionCount = roster.filter(s => s?.status === 'needs_attention' || s?.status === 'at_risk').length;

  const stats = dashboardData?.stats || {
    totalAssignedStudents: 20,
    activeClassrooms: 1,
    upcomingAssessments: 1,
    ongoingAssessments: 0,
    pendingSubmissions: 0,
    pendingGrading: 0,
    todayAttendancePercent: 100
  };

  const handleExportCSV = () => {
    if (roster.length === 0) {
      triggerToast('No student data to export yet.');
      return;
    }
    const headers = "Roll Number,Name,Email,Mastery,Attempts,Accuracy,Status\n";
    const rows = roster.map(s => {
      const sRoll = s?.rollNumber || 'N/A';
      const sName = s?.name || s?.fullName || 'Student';
      const sEmail = s?.email || 'N/A';
      const m = s?.mastery || 0;
      const att = s?.attempts ?? 0;
      const acc = s?.accuracy ?? 0;
      const st = s?.status || 'active';
      return `"${sRoll}","${sName}","${sEmail}",${m}%,${att},${acc}%,"${st}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_roster_${selectedClassId}_export.csv`;
    a.click();
    triggerToast("Class roster exported as CSV!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24">
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

      {/* Header with Educator Profile & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Teacher Command Centre
            </h1>
            <Badge variant="purple" size="sm" className="font-bold">
              Asian Public School
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Department Head: <strong className="text-slate-800 dark:text-slate-200">{user?.name || 'Mrs. Ananya Sharma'}</strong> • Mathematics & Science Faculty
          </p>
        </div>

        {/* Part 2: 4 Primary Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/teacher/builder')}
            className="shadow-subtle font-bold text-xs"
          >
            Create Assessment
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Calendar}
            onClick={() => navigate('/teacher/attendance')}
            className="font-bold text-xs"
          >
            Take Attendance
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Users}
            onClick={() => navigate('/classes')}
            className="font-bold text-xs"
          >
            Open Classroom
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={TrendingUp}
            onClick={() => navigate('/teacher/results')}
            className="font-bold text-xs"
          >
            Class Results
          </Button>

          <Button
            size="sm"
            variant={activeTeacherTab === 'support' ? 'primary' : 'outline'}
            icon={MessageSquare}
            onClick={() => setActiveTeacherTab(activeTeacherTab === 'support' ? 'overview' : 'support')}
            className="font-bold text-xs"
          >
            Support Inbox
          </Button>
        </div>
      </div>

      {activeTeacherTab === 'support' ? (
        <SupportInbox defaultStaffName="Mrs. Ananya Sharma" />
      ) : (
        <>
      {/* Live Examination Monitor Alert Banner if Test is Ongoing */}
      {stats.ongoingAssessments > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-elevated border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-pulse">
              <Radio className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  Live Examination In Progress
                </span>
                <span className="text-xs text-indigo-200 font-mono">Room: Grade 7-A (Join: APS7M)</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                Unit 3: Fractions, Rational Numbers & Decimals Timed Diagnostic
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate('/teacher/live-test')}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs"
            >
              Open Live Monitor
            </Button>
          </div>
        </div>
      )}

      {/* Part 2: 6 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">
            {stats.totalAssignedStudents}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Grade 7-A Roster</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Classes</span>
            <School className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">
            {stats.activeClassrooms}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Grade 7-A Pilot</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Tests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 font-mono">
            {stats.upcomingAssessments}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Scheduled this week</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Submissions</span>
            <ClipboardList className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5 font-mono">
            {stats.pendingSubmissions}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Active exam sessions</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Grading</span>
            <CheckSquare className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 font-mono">
            {stats.pendingGrading}
          </p>
          <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold block mt-0.5">Descriptive items</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
            {stats.todayAttendancePercent}%
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Optimal attendance</span>
        </Card>
      </div>

      {/* Split Section: Academic Interventions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Students Requiring Academic Intervention */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Students Requiring Academic Intervention
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">BKT Mastery &lt; 60%</span>
          </div>

          <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Identified Diagnostic Weakness</th>
                    <th className="py-3 px-4 text-center">BKT Mastery</th>
                    <th className="py-3 px-4 text-right">Intervention Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {(dashboardData?.studentsNeedingIntervention || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                        <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">All 20 Students On Track</span>
                        <span className="text-[11px] text-slate-400">Class 7-A Mathematics BKT mastery threshold satisfied across all topics.</span>
                      </td>
                    </tr>
                  ) : (
                    (dashboardData?.studentsNeedingIntervention || []).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{s.rollNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">{s.grade}</td>
                        <td className="py-3 px-4">
                          <span className="text-rose-600 dark:text-rose-400 font-bold block">{s.weakTopic}</span>
                          <span className="text-[10px] text-slate-400">Diagnostic error cluster</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {s.bktMastery}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              triggerToast(`Targeted remediation plan assigned to ${s.name}!`);
                            }}
                            className="text-[11px] py-1 h-7 font-bold text-indigo-600 dark:text-cyan-400"
                          >
                            Assign Practice
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Recent Classroom Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recent Classroom Activity
            </h2>
          </div>

          <Card className="p-4 space-y-4 border border-slate-200 dark:border-slate-800">
            {(dashboardData?.recentActivity || []).map((act) => (
              <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  {act.type === 'test_completion' ? <ClipboardList className="w-4 h-4" /> :
                   act.type === 'attendance_marked' ? <Calendar className="w-4 h-4" /> :
                   <CheckSquare className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{act.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{act.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Classroom Cohort Roster & Performance Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              <School className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Classroom Cohort Diagnostic View
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {classes.map((c) => {
                  const cid = c.id || c._id;
                  const cCount = c.studentCount || (c.studentIds ? c.studentIds.length : 20);
                  return (
                    <option key={cid} value={cid}>
                      {c.name} ({c.joinCode}) - {cCount} Students
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleExportCSV}
              className="text-xs font-bold"
            >
              Export CSV Gradebook
            </Button>
          </div>
        </div>

        {/* Cohort Live Roster Table */}
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by student name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {['all', 'on_track', 'needs_attention'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Questions Attempted</th>
                  <th className="py-3 px-4 text-center">Diagnostic Accuracy</th>
                  <th className="py-3 px-4 text-center">BKT Mastery Score</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRoster.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {s.rollNumber || 'APS-07-001'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {s.email}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {s.attempts}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {s.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-[11px] ${
                        s.mastery >= 75
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {s.mastery}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge
                        variant={s.status === 'on_track' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {s.status === 'on_track' ? 'On Track' : 'Needs Focus'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      </>
      )}
    </div>
  );
};
