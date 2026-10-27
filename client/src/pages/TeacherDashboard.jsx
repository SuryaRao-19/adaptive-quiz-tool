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
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { AuthContext } from '../context/AuthContext';
import { getMyClasses } from '../services/classService';
import { getClassAnalytics } from '../services/progressService';
import { addQuestion } from '../services/quizService';

export const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Question Creation Modal
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const [qSubject, setQSubject] = useState('Math');
  const [qTopic, setQTopic] = useState('Fractions');
  const [qDifficulty, setQDifficulty] = useState('medium');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qSubmitting, setQSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Fetch teacher classes
  useEffect(() => {
    let isMounted = true;
    getMyClasses().then((res) => {
      if (isMounted) {
        if (res.success && res.classes) {
          setClasses(res.classes);
          if (res.classes.length > 0) {
            setSelectedClassId(res.classes[0]._id);
          }
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // 2. Fetch class analytics when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setClassAnalytics(null);
      return;
    }

    getClassAnalytics(selectedClassId).then((res) => {
      if (res.success) {
        setClassAnalytics(res);
      }
    }).catch((err) => {
      console.warn('Class analytics error:', err);
    });
  }, [selectedClassId]);

  // Handle Add Question Submit
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!qText.trim() || qOptions.some(opt => !opt.trim()) || !qExplanation.trim()) {
      triggerToast('Please fill in all question fields and 4 options.');
      return;
    }

    setQSubmitting(true);
    try {
      const res = await addQuestion({
        text: qText.trim(),
        options: qOptions.map(o => o.trim()),
        correctAnswerIndex: Number(qCorrectIdx),
        explanation: qExplanation.trim(),
        difficulty: qDifficulty,
        subject: qSubject,
        topic: qTopic.trim()
      });

      if (res.success) {
        triggerToast('Curriculum Question added successfully!');
        setAddQuestionModalOpen(false);
        setQText('');
        setQOptions(['', '', '', '']);
        setQExplanation('');
      } else {
        triggerToast(res.message || 'Failed to add question.');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error publishing question.');
    } finally {
      setQSubmitting(false);
    }
  };

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

  const handleExportCSV = () => {
    if (roster.length === 0) {
      triggerToast('No student data to export yet.');
      return;
    }
    const headers = "Name,Email,Mastery,Attempts,Accuracy,Status\n";
    const rows = roster.map(s => {
      const sName = s?.name || s?.fullName || 'Student';
      const sEmail = s?.email || 'N/A';
      const m = s?.mastery || 0;
      const att = s?.attempts ?? s?.practiced ?? 0;
      const acc = s?.accuracy ?? s?.mastery ?? 0;
      const st = s?.status || 'active';
      return `"${sName}","${sEmail}",${m}%,${att},${acc}%,"${st}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_roster_export.csv`;
    a.click();
    triggerToast("Class roster exported as CSV!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
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
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Classroom Diagnostic & Growth Roster
            </h1>
            <Badge variant="purple" size="sm">Teacher Mode</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Educator: <strong className="text-slate-800 dark:text-slate-200">{user?.name || user?.fullName || 'Educator'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={Sparkles}
            onClick={() => navigate('/question-bank')}
            className="text-xs font-bold"
          >
            Question Bank & AI
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setAddQuestionModalOpen(true)}
            className="shadow-subtle"
          >
            Add Question
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading classroom roster...</p>
        </div>
      ) : classes.length === 0 ? (
        /* Empty State for Teacher without Classes */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-subtle space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-sm">
            <School className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              No classrooms created yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Create your first classroom cohort in the Classroom Hub to generate a 6-character join code for your students, or add curriculum practice questions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/classes')}
              className="font-bold text-xs"
            >
              Open Classroom Hub
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon={BookOpen}
              onClick={() => setAddQuestionModalOpen(true)}
              className="font-bold text-xs"
            >
              Author Question
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Classes & Live Roster View */
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
                <School className="w-5 h-5" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Class Cohort
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.joinCode}) - {c.studentIds ? c.studentIds.length : 0} Students
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {classAnalytics?.joinCode && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Student Join Code:</span>
                <span className="font-mono font-extrabold text-indigo-700 dark:text-cyan-400 text-sm tracking-wider">
                  {classAnalytics.joinCode}
                </span>
              </div>
            )}
          </div>

          {/* Cohort Overview Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{roster.length}</p>
              <p className="text-xs text-slate-500 mt-1">Active class participants</p>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">On Track / Remediated</span>
              <p className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">{onTrackCount}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Demonstrating positive mastery</p>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Needs Attention</span>
              <p className="text-3xl font-extrabold text-amber-600 font-mono mt-1">{needsAttentionCount}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">Accuracy below 60%</p>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Class Mastery</span>
              <p className="text-3xl font-extrabold text-indigo-700 dark:text-cyan-400 font-mono mt-1">
                {classAnalytics?.avgMastery ? `${classAnalytics.avgMastery}%` : '0%'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Cohort aggregated score</p>
            </Card>
          </div>

          {/* Roster Table or Empty State */}
          {roster.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No students enrolled in this class yet.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Share the code <strong className="font-mono text-indigo-600 dark:text-cyan-400">{classAnalytics?.joinCode}</strong> with your students so they can join from their "My Classes" screen.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-72">
                  <Input
                    placeholder="Search by student name..."
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
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Questions Attempted</th>
                      <th className="py-3 px-4 text-center">Accuracy</th>
                      <th className="py-3 px-4 text-center">Mastery Score</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredRoster.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {s.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {s.email}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {s.attempts}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600 dark:text-cyan-400">
                          {s.accuracy}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                          {s.mastery}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge variant={s.status === 'on_track' ? 'success' : 'warning'} size="sm">
                            {s.status === 'on_track' ? 'On Track' : 'Needs Practice'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Question Modal */}
      <Modal
        isOpen={addQuestionModalOpen}
        onClose={() => setAddQuestionModalOpen(false)}
        title="Author Curriculum Question"
        subtitle="Contribute live questions aligned with UN SDG 4 curriculum"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Subject
              </label>
              <select
                value={qSubject}
                onChange={(e) => setQSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
              >
                <option value="Math">Math</option>
                <option value="Science">Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Topic
              </label>
              <input
                type="text"
                required
                value={qTopic}
                onChange={(e) => setQTopic(e.target.value)}
                placeholder="e.g. Fractions, Photosynthesis"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Difficulty
              </label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
              >
                <option value="easy">Level 1: Novice (Easy)</option>
                <option value="medium">Level 2: Apprentice (Medium)</option>
                <option value="hard">Level 3: Adept (Hard)</option>
                <option value="very_hard">Level 4: Master (Very Hard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Question Text
            </label>
            <textarea
              required
              rows={2}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="e.g. What is the value of 3/4 + 1/2 in simplest form?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Answer Options & Correct Choice
            </label>
            <div className="space-y-2">
              {qOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={qCorrectIdx === idx}
                    onChange={() => setQCorrectIdx(idx)}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...qOptions];
                      updated[idx] = e.target.value;
                      setQOptions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                  {qCorrectIdx === idx && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Step-by-Step Explanation / Socratic Solution
            </label>
            <textarea
              required
              rows={3}
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              placeholder="Explain the intuition and intermediate mathematical steps..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={qSubmitting}>
              {qSubmitting ? 'Saving...' : 'Publish Question'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
