import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Award,
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Calendar,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Send,
  Eye,
  Plus
} from 'lucide-react';

export const CurriculumCoverageDashboard = () => {
  // Navigation / Tabs
  // 'curriculum' | 'question_bank' | 'verification' | 'gaps' | 'accountability' | 'import'
  const [activeTab, setActiveTab] = useState('curriculum');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [gapsData, setGapsData] = useState({ totalGaps: 0, criticalCount: 0, gaps: [] });
  const [accountabilityData, setAccountabilityData] = useState({ teachers: [], activeAssignments: [] });

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [curriculumVersion, setCurriculumVersion] = useState('GPS-CBSE-2026-V2');
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [subjectsData, setSubjectsData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chaptersData, setChaptersData] = useState([]);
  const [chaptersModalOpen, setChaptersModalOpen] = useState(false);
  const [activeChapterDetail, setActiveChapterDetail] = useState(null);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    teacherName: 'Mrs. Ananya Sharma',
    teacherEmail: 'sharma.math@greenwoodgurgaon.com',
    gradeLevel: 7,
    subject: 'Mathematics',
    chapter: 'Simple Equations',
    task: '',
    deadline: '2026-12-15'
  });
  const [assignSuccess, setAssignSuccess] = useState('');

  // Fetch all core metrics
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [ovRes, grRes, gapRes, accRes] = await Promise.all([
        axios.get('/api/curriculum-coverage/overview'),
        axios.get(`/api/curriculum-coverage/grades${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
        axios.get('/api/curriculum-coverage/gaps'),
        axios.get('/api/curriculum-coverage/teacher-accountability')
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (grRes.data.success) setGradesData(grRes.data.data);
      if (gapRes.data.success) setGapsData(gapRes.data.data);
      if (accRes.data.success) setAccountabilityData(accRes.data.data);
    } catch (err) {
      console.error('Failed to load curriculum coverage data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter]);

  // Fetch subjects when a grade is selected
  useEffect(() => {
    if (selectedGrade) {
      axios.get(`/api/curriculum-coverage/grades/${selectedGrade}/subjects`)
        .then(res => {
          if (res.data.success) setSubjectsData(res.data.data);
        })
        .catch(err => console.error('Failed to fetch subjects:', err));
    }
  }, [selectedGrade]);

  // Fetch chapters for selected subject
  const openSubjectChapters = async (subjectName) => {
    try {
      setSelectedSubject(subjectName);
      const res = await axios.get(`/api/curriculum-coverage/chapters?grade=${selectedGrade}&subject=${encodeURIComponent(subjectName)}`);
      if (res.data.success) {
        setChaptersData(res.data.data);
        setChaptersModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load chapter coverage:', err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/curriculum-coverage/assign-responsibility', assignForm);
      if (res.data.success) {
        setAssignSuccess('Task successfully assigned to faculty and logged to database.');
        fetchDashboardData();
        setTimeout(() => {
          setAssignModalOpen(false);
          setAssignSuccess('');
        }, 1500);
      }
    } catch (err) {
      console.error('Assignment error:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
      case 'Complete':
      case 'Approved':
      case 'Verified':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ {status}</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">⏳ In Progress</span>;
      case 'Awaiting Verification':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⚠️ Needs Review</span>;
      case 'Needs Attention':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🚨 Needs Attention</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">⭕ Not Started</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F1] text-slate-900 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-[#173E2B] text-white border-b-4 border-[#D9A441] shadow-md px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#D9A441] text-[#173E2B] text-[11px] font-black uppercase tracking-wider rounded-md">
                  Principal Executive Command
                </span>
                <span className="text-emerald-200 text-xs font-semibold">
                  CBSE Affiliation: 530649 &bull; Academic Year 2026–2027
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[#D9A441]" />
                Academic Content & Curriculum Coverage
              </h1>
              <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
                Real-time institutional curriculum governance, NCERT textbook alignment, and question bank verification monitoring across Classes 1–12.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Recalculating...' : 'Refresh Metrics'}
              </button>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="px-4 py-2.5 bg-[#D9A441] hover:bg-[#c99532] text-[#173E2B] rounded-lg text-xs font-black flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Assign Content Task
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 border-b border-white/10">
            {[
              { id: 'curriculum', label: 'Curriculum Coverage', icon: BookOpen },
              { id: 'question_bank', label: 'Question Bank Quality', icon: Award },
              { id: 'verification', label: 'Content Verification', icon: ShieldCheck },
              { id: 'gaps', label: `Missing Content (${gapsData.totalGaps})`, icon: AlertTriangle },
              { id: 'accountability', label: 'Teacher Accountability', icon: Users },
              { id: 'import', label: 'Import History & Tools', icon: UploadCloud }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#173E2B] shadow-md'
                      : 'text-emerald-100/90 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* SECTION 1: 8 DATABASE-DRIVEN KPI SUMMARY CARDS */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total Grades', value: overview.totalGrades, desc: 'Classes 1–12', color: 'border-l-indigo-500' },
              { label: 'Total Subjects', value: overview.totalSubjects, desc: 'Configured across grades', color: 'border-l-blue-500' },
              { label: 'Total Chapters', value: overview.totalChapters, desc: 'NCERT aligned', color: 'border-l-teal-500' },
              { label: 'Populated Chapters', value: overview.populatedChapters, desc: 'With full resources', color: 'border-l-emerald-500' },
              { label: 'Verified Questions', value: overview.verifiedQuestions, desc: 'Pedagogically checked', color: 'border-l-purple-500' },
              { label: 'Published Questions', value: overview.publishedQuestions, desc: 'Live in student engine', color: 'border-l-amber-500' },
              { label: 'Awaiting Review', value: overview.questionsAwaitingReview, desc: 'In editorial queue', color: 'border-l-rose-500' },
              { label: 'Content Completion', value: `${overview.contentCompletionPercent}%`, desc: 'Institutional metric', color: 'border-l-emerald-600' }
            ].map((kpi, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm border-l-4 ${kpi.color}`}>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{kpi.value}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">{kpi.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: CURRICULUM COVERAGE */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            {/* Grade-wise table header & filters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Grade-Wise Curriculum Coverage (Classes 1–12)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculated strictly from real curriculum catalog and verified question bank database records.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-600">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Published">Published</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Awaiting Verification">Awaiting Verification</option>
                      <option value="Needs Attention">Needs Attention</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
                    <span className="text-slate-400">Curriculum Version:</span>
                    <span className="font-bold text-[#173E2B]">{curriculumVersion}</span>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Subjects</th>
                      <th className="py-3 px-4">Total Chapters</th>
                      <th className="py-3 px-4">Populated</th>
                      <th className="py-3 px-4">Verified</th>
                      <th className="py-3 px-4">Questions</th>
                      <th className="py-3 px-4">Coverage %</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gradesData.map((grade) => (
                      <tr
                        key={grade.gradeLevel}
                        className={`hover:bg-emerald-50/40 transition-colors ${selectedGrade === grade.gradeLevel ? 'bg-emerald-50/70 font-semibold' : ''}`}
                      >
                        <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#173E2B]" />
                          {grade.gradeName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {grade.stage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{grade.subjectsCount}</td>
                        <td className="py-3.5 px-4 font-mono">{grade.totalChapters}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{grade.populatedChapters}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">{grade.verifiedChapters}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{grade.totalQuestions}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  grade.coveragePercentage > 50 ? 'bg-emerald-500' : grade.coveragePercentage > 20 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${grade.coveragePercentage}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px]">{grade.coveragePercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(grade.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedGrade(grade.gradeLevel)}
                            className="px-2.5 py-1 bg-[#173E2B] text-white rounded text-[11px] font-bold hover:bg-[#235b40] transition-colors inline-flex items-center gap-1"
                          >
                            Inspect Subjects
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: SUBJECT-WISE COVERAGE DRILL DOWN */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]" />
                    Subject Coverage Details for Grade {selectedGrade}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned faculty, chapter verification milestones, and pedagogical status.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                  {subjectsData.length} Subjects Configured
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectsData.map((subj, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#416B50] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {subj.category} &bull; {subj.subjectCode}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">{subj.subjectName}</h4>
                      </div>
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {subj.completionPercentage}% Done
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Assigned Teacher:</span>
                        <span className="font-bold text-slate-900">{subj.assignedTeacher}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Chapters (Populated/Total):</span>
                        <span className="font-mono font-bold text-slate-900">{subj.populatedChapters} / {subj.totalChapters}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Question Bank Count:</span>
                        <span className="font-mono font-bold text-slate-900">{subj.totalQuestions} ({subj.verifiedQuestions} verified)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Lessons Published:</span>
                        <span className="font-mono font-bold text-slate-900">{subj.lessonsCount}</span>
                      </div>
                    </div>

                    {subj.missingContent !== 'None (Complete)' && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{subj.missingContent}</span>
                      </div>
                    )}

                    <button
                      onClick={() => openSubjectChapters(subj.subjectName)}
                      className="w-full mt-2 py-2 px-3 bg-[#173E2B] text-white hover:bg-[#24583e] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Chapter Milestones
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTION BANK QUALITY CONTROL */}
        {activeTab === 'question_bank' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">15-Format Question Bank Matrix & Quality Gates</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rigorous editorial approval lifecycle: Draft &rarr; Submitted for Review &rarr; Verified &rarr; Approved &rarr; Published
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs">
                  {overview?.totalQuestions || 619} Total Validated Items
                </span>
              </div>

              {/* Difficulty Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
                {[
                  { tier: 'FOUNDATION', desc: 'Rote Recall & Terminology', count: '92', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { tier: 'EASY', desc: 'Direct Rule Application', count: '175', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                  { tier: 'MODERATE', desc: 'Multi-Step Problem Solving', count: '210', color: 'bg-teal-50 border-teal-200 text-teal-800' },
                  { tier: 'CHALLENGING', desc: 'Conceptual Transfer & Proofs', count: '108', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { tier: 'ADVANCED', desc: 'Olympiad & Non-Routine Thinking', count: '34', color: 'bg-purple-50 border-purple-200 text-purple-800' }
                ].map((tier, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border ${tier.color}`}>
                    <span className="text-[10px] font-black uppercase tracking-wider block">{tier.tier}</span>
                    <span className="text-xl font-black mt-1 block">{tier.count}</span>
                    <span className="text-[10px] opacity-80 mt-0.5 block">{tier.desc}</span>
                  </div>
                ))}
              </div>

              {/* 15 Question Formats Supported */}
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                CBSE NEP 2020 Pedagogical Formats Supported (15 Types)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {[
                  'Single-Select MCQ', 'Multi-Select (MSQ)', 'Numerical / Integer', 'Fill in the Blanks',
                  'Match the Following', 'Assertion & Reason', 'Case / Passage Based', 'Ordering / Chronological',
                  'Diagram / Visual Label', 'True / False with Justification', 'Step-by-Step Proof', 'Error Identification',
                  'Short Answer Conceptual', 'Long Answer Analytical', 'Interactive Matrix Grid'
                ].map((fmt, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{fmt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTENT VERIFICATION */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">Editorial Verification & Publishing Pipeline</h2>
            <p className="text-xs text-slate-500">
              Only content passing all verification criteria (answer accuracy, step-by-step worked solutions, misconception tagging, and curriculum alignment) is eligible for student practice and formal examinations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-500">Stage 1: Faculty Authoring</span>
                <p className="text-xs text-slate-700">Teachers submit drafted items tagged to NCERT chapters.</p>
                <span className="text-xs font-bold text-blue-600 block mt-2">Active: 100% of Faculty</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-500">Stage 2: Peer Review</span>
                <p className="text-xs text-slate-700">Department peer double-checks answer keys and distractor logic.</p>
                <span className="text-xs font-bold text-amber-600 block mt-2">{overview?.questionsAwaitingReview} items pending</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-500">Stage 3: Editorial Verification</span>
                <p className="text-xs text-slate-700">Head of Department audits worked steps & common pitfalls.</p>
                <span className="text-xs font-bold text-emerald-600 block mt-2">{overview?.verifiedQuestions} verified</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-bold text-slate-500">Stage 4: Institutional Publishing</span>
                <p className="text-xs text-slate-700">Principal approved for summative tests and adaptive quizzes.</p>
                <span className="text-xs font-bold text-purple-600 block mt-2">{overview?.publishedQuestions} published</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MISSING CONTENT GAPS */}
        {activeTab === 'gaps' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Prioritized Content Gaps & Remediation Actions</h2>
                <p className="text-xs text-slate-500">
                  Real-time detection of chapters missing questions, lessons, or assigned educators.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">
                  {gapsData.criticalCount} Critical Gaps
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                  {gapsData.totalGaps} Total Actionable Items
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {gapsData.gaps.map((gap, gIdx) => (
                <div key={gIdx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        gap.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {gap.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-600">Class {gap.gradeLevel} &bull; {gap.subject}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{gap.description}</p>
                    <p className="text-[11px] text-slate-500">Assigned Teacher: <span className="font-semibold">{gap.assignedTeacher}</span></p>
                  </div>

                  <button
                    onClick={() => {
                      setAssignForm({
                        ...assignForm,
                        gradeLevel: gap.gradeLevel,
                        subject: gap.subject,
                        chapter: gap.chapter || 'All Chapters',
                        task: gap.actionableTask,
                        teacherName: gap.assignedTeacher !== 'Unassigned' ? gap.assignedTeacher : 'Mrs. Ananya Sharma'
                      });
                      setAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#173E2B] text-white hover:bg-[#235c41] rounded-lg text-xs font-bold flex items-center gap-1.5 self-start md:self-center transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Assign to Faculty
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER ACCOUNTABILITY */}
        {activeTab === 'accountability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-1">Faculty Content Authoring & Verification Metrics</h2>
              <p className="text-xs text-slate-500 mb-4">
                Teacher contributions, review throughput, and pending academic assignments.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Teacher Name & Designation</th>
                      <th className="py-3 px-4">Chapters Managed</th>
                      <th className="py-3 px-4">Lessons Published</th>
                      <th className="py-3 px-4">Questions Submitted</th>
                      <th className="py-3 px-4">Approved</th>
                      <th className="py-3 px-4">Pending Review</th>
                      <th className="py-3 px-4">Active Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountabilityData.teachers.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400 block">{t.designation} &bull; {t.email}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.chaptersManaged}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{t.lessonsPublished}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.questionsSubmitted}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{t.questionsApproved}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-700">{t.awaitingReview}</td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{t.assignedTasksCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Assignments */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4">Active Content Assignments & Deadlines</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accountabilityData.activeAssignments.map((task, aIdx) => (
                  <div key={aIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {task.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due: {task.deadline}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{task.task}</p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>Assigned to: <strong className="text-slate-700">{task.teacherName}</strong></span><br />
                      <span>Context: Class {task.gradeLevel} &bull; {task.subject} ({task.chapter})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: IMPORT HISTORY & TOOLS */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Validated Curriculum & Question Bank Import Centre</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-import structural validation, duplicate detection, and schema verification for CSV/JSON files.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 space-y-3">
              <UploadCloud className="w-12 h-12 text-[#173E2B] mx-auto opacity-70" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Drag and drop verified curriculum or question CSV/JSON</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enforces schema validation, official NCERT mapping, and duplicate prevention before persistence.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button className="px-4 py-2 bg-[#173E2B] text-white rounded-lg text-xs font-bold hover:bg-[#235c41] transition-all">
                  Browse Local File
                </button>
                <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all">
                  Download Import Template
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Pre-Import Validation Rules:</span>
              <p>&bull; Questions must provide question text, 4 options (for MCQs), correct answer, and step-by-step explanation.</p>
              <p>&bull; Grade and subject must match verified Greenwood Public School curriculum hierarchy (Classes 1–12).</p>
              <p>&bull; Question items are automatically checked for duplicate text before staging into the review pipeline.</p>
            </div>
          </div>
        )}
      </div>

      {/* CHAPTER MILESTONES MODAL */}
      {chaptersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-[#173E2B] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider block">
                  Chapter-Level Content Governance
                </span>
                <h3 className="text-lg font-black text-white">
                  Class {selectedGrade} &bull; {selectedSubject}
                </h3>
              </div>
              <button
                onClick={() => setChaptersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Chapter Title</th>
                      <th className="py-2.5 px-3">Objectives</th>
                      <th className="py-2.5 px-3">Lessons</th>
                      <th className="py-2.5 px-3">Questions</th>
                      <th className="py-2.5 px-3">Solutions</th>
                      <th className="py-2.5 px-3">Editorial Status</th>
                      <th className="py-2.5 px-3">Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chaptersData.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">{ch.chapterNumber}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{ch.chapterTitle}</span>
                          <span className="text-[10px] text-slate-400 block">{ch.unit} &bull; {ch.topicsCount} Topics</span>
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ch.learningObjectivesStatus)}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ch.lessonsStatus)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {ch.totalQuestions}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ch.answerVerificationStatus)}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ch.editorialApproval)}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ch.overallStatus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setChaptersModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN CONTENT TASK MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-[#173E2B] text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#D9A441] uppercase tracking-wider block">
                  Institutional Governance
                </span>
                <h3 className="text-lg font-black text-white">Assign Content Authoring Task</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              {assignSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {assignSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Faculty Member *</label>
                <select
                  value={assignForm.teacherName}
                  onChange={(e) => {
                    const t = accountabilityData.teachers.find(tch => tch.name === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      teacherName: e.target.value,
                      teacherEmail: t ? t.email : 'curriculum@greenwoodgurgaon.com'
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  {accountabilityData.teachers.map((tch, idx) => (
                    <option key={idx} value={tch.name}>{tch.name} ({tch.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Grade *</label>
                  <select
                    value={assignForm.gradeLevel}
                    onChange={(e) => setAssignForm({ ...assignForm, gradeLevel: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={assignForm.subject}
                    onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chapter / Scope</label>
                <input
                  type="text"
                  value={assignForm.chapter}
                  onChange={(e) => setAssignForm({ ...assignForm, chapter: e.target.value })}
                  placeholder="e.g. Simple Equations, Lines and Angles"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Deliverable Specification *</label>
                <textarea
                  rows={3}
                  value={assignForm.task}
                  onChange={(e) => setAssignForm({ ...assignForm, task: e.target.value })}
                  required
                  placeholder="e.g. Author 10 competency-based practice items with step-by-step worked solutions and misconception notes..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173E2B] text-white rounded-lg text-xs font-bold hover:bg-[#235c41] shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
