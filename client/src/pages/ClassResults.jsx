import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  Award, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Printer,
  ChevronDown
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AuthContext } from '../context/AuthContext';
import { getClassResultsAnalytics, getTeacherClassrooms } from '../services/teacherAssessmentService';

export const ClassResults = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-gps-7a');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch available classrooms
  useEffect(() => {
    getTeacherClassrooms()
      .then(res => {
        if (res?.classrooms && res.classrooms.length > 0) {
          setClassesList(res.classrooms);
          setSelectedClassId(res.classrooms[0].id);
        } else if (Array.isArray(res) && res.length > 0) {
          setClassesList(res);
          setSelectedClassId(res[0].id);
        } else {
          setClassesList([{ id: 'cls-gps-7a', name: 'Grade 7-A Mathematics (Pilot)', joinCode: 'GPS7M' }]);
        }
      })
      .catch(() => {
        setClassesList([{ id: 'cls-gps-7a', name: 'Grade 7-A Mathematics (Pilot)', joinCode: 'GPS7M' }]);
      });
  }, []);

  // Fetch results for selected classroom
  useEffect(() => {
    setLoading(true);
    getClassResultsAnalytics({ classroomId: selectedClassId })
      .then(res => {
        if (res.success && res.metrics) {
          setResultsData(res);
        }
      })
      .catch((err) => {
        console.warn('Error fetching class results:', err);
      })
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  // Safe Spreadsheet CSV formula injection prevention
  const sanitizeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const cleaned = String(val).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(cleaned)) {
      return `'${cleaned}`;
    }
    return cleaned;
  };

  const handleExportCSV = () => {
    const students = resultsData?.students || [];
    if (students.length === 0) {
      triggerToast('No results to export.');
      return;
    }

    const headers = "Roll Number,Student Name,Assessment Marks,Max Marks,Percentage,BKT Mastery %,Weak Topics,Status\n";
    const rows = students.map(s => {
      const roll = sanitizeCSV(s.rollNumber);
      const name = sanitizeCSV(s.name);
      const score = s.status === 'PENDING' ? 'Pending' : (s.score ?? 0);
      const maxScore = s.maxScore || 20;
      const pct = s.status === 'PENDING' ? 'Pending' : `${s.percentage}%`;
      const mastery = `${s.bktMastery}%`;
      const weak = sanitizeCSV((s.weakTopics || []).join('; '));
      const status = sanitizeCSV(s.status);
      return `"${roll}","${name}","${score}",${maxScore},"${pct}","${mastery}","${weak}","${status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_results_${selectedClassId}.csv`;
    a.click();
    triggerToast("Official results gradebook exported as CSV!");
  };

  const metrics = resultsData?.metrics || {
    totalStudents: 20,
    submittedCount: 0,
    avgMarks: 0,
    highestScore: 0,
    lowestScore: 0,
    completionRate: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 }
  };

  const studentsList = (resultsData?.students || []).filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.rollNumber.toLowerCase().includes(term);
  });

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

      {/* Header */}
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
              Class Results & Longitudinal Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Greenwood Public School • Grade 7 Mathematics Diagnostic Assessment Results
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={() => window.print()}
            className="text-xs font-bold"
          >
            Print Scorecard
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Download}
            onClick={handleExportCSV}
            className="text-xs font-bold shadow-subtle"
          >
            Export Gradebook CSV
          </Button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Cohort:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {classesList.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.joinCode})</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search student or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* Class Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Candidates</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{metrics.totalStudents}</p>
          <span className="text-[10px] text-slate-400">Enrolled pilot cohort</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Marks</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-cyan-400 mt-1 font-mono">
            {metrics.submittedCount > 0 ? `${metrics.avgMarks}%` : '—'}
          </p>
          <span className="text-[10px] text-slate-500">
            {metrics.submittedCount > 0 ? `${metrics.submittedCount} submissions graded` : 'Awaiting test completion'}
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Score</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {metrics.submittedCount > 0 ? `${metrics.highestScore}%` : '—'}
          </p>
          <span className="text-[10px] text-slate-400">
            {metrics.submittedCount > 0 ? 'Top cohort score' : 'No submissions yet'}
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest Score</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {metrics.submittedCount > 0 ? `${metrics.lowestScore}%` : '—'}
          </p>
          <span className="text-[10px] text-slate-500">
            {metrics.submittedCount > 0 ? 'Minimum recorded' : 'No submissions yet'}
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">{metrics.completionRate}%</p>
          <span className="text-[10px] text-purple-500 font-medium">{metrics.submittedCount || 0} of {metrics.totalStudents} submitted</span>
        </Card>
      </div>

      {/* Grade Distribution Bar */}
      <Card className="p-4 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          CBSE Standard Letter Grade Distribution
        </span>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block">Grade A (&gt;85%)</span>
            <span className="text-lg font-black font-mono">{metrics.gradeDistribution?.A || 0} Students</span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <span className="font-extrabold text-indigo-700 dark:text-cyan-300 block">Grade B (70-84%)</span>
            <span className="text-lg font-black font-mono">{metrics.gradeDistribution?.B || 0} Students</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="font-extrabold text-amber-700 dark:text-amber-300 block">Grade C (55-69%)</span>
            <span className="text-lg font-black font-mono">{metrics.gradeDistribution?.C || 0} Students</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="font-extrabold text-rose-700 dark:text-rose-300 block">Grade D (40-54%)</span>
            <span className="text-lg font-black font-mono">{metrics.gradeDistribution?.D || 0} Students</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-extrabold text-slate-500 block">Grade E (&lt;40%)</span>
            <span className="text-lg font-black font-mono">{metrics.gradeDistribution?.E || 0} Students</span>
          </div>
        </div>
      </Card>

      {/* Individual Student Results Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Exam Marks</th>
                <th className="py-3 px-4 text-center">Score %</th>
                <th className="py-3 px-4 text-center">BKT Mastery</th>
                <th className="py-3 px-4">Identified Diagnostic Weakness</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {studentsList.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                    {s.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    {s.status === 'PENDING' ? (
                      <span className="text-slate-400">— / {s.maxScore}</span>
                    ) : (
                      <span>{s.score} / {s.maxScore}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold">
                    {s.status === 'PENDING' ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className={s.percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {s.percentage}%
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-[11px] ${
                      s.bktMastery >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {s.bktMastery}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === 'PENDING' ? (
                      <span className="text-slate-400 text-[11px] italic">Diagnostic test pending</span>
                    ) : (s.weakTopics && s.weakTopics.length > 0) ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {s.weakTopics.join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-semibold">✓ Meets Mastery Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Badge variant={s.status === 'PUBLISHED' ? 'success' : s.status === 'SUBMITTED' ? 'info' : 'warning'} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
