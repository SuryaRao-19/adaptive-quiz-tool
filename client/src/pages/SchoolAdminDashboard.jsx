import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  ArrowUpRight,
  Filter,
  School,
  Sparkles,
  ExternalLink,
  BrainCircuit,
  FileCheck,
  Check,
  Upload,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SupportInbox } from '../components/support/SupportInbox';

export const SchoolAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, grades, faculty, gaps, curriculum, ai_usage

  // Curriculum Ingestion State
  const [ingestForm, setIngestForm] = useState({
    documentName: 'GPS Class VII Science CBSE Curriculum 2026-2027',
    gradeLevel: 7,
    subject: 'Science',
    academicYear: '2026-2027',
    sourceUrl: 'https://www.greenwoodgurgaon.com',
    rawText: `Class VII CBSE Science Curriculum
Chapter 1: Nutrition in Plants
- Autotrophic Nutrition & Photosynthesis: Chlorophyll, stomata, light reactions, carbon fixation.
- Heterotrophic Modes: Parasites (Cuscuta), Insectivorous plants (Pitcher plant), Saprotrophs (Fungi).
Learning Objectives: Understand solar energy conversion; explain stomatal regulation; differentiate autotrophic and heterotrophic nutrition.

Chapter 2: Heat and Temperature
- Measurement of Temperature: Clinical thermometer, laboratory thermometer, Celsius and Fahrenheit scales.
- Transfer of Heat: Conduction in solids, convection in fluids, radiation in vacuum.
Learning Objectives: Interpret thermometer readings accurately; identify heat transfer mechanisms; explain thermos flask insulation.`
  });
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestBatch, setIngestBatch] = useState(null);
  const [ingestStatusMsg, setIngestStatusMsg] = useState('');

  // API Integrations Dashboard State
  const [integrationsList, setIntegrationsList] = useState([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setIntegrationsLoading(true);
      const res = await fetch('/api/integrations/status');
      const json = await res.json();
      if (json.success && json.integrations) {
        setIntegrationsList(json.integrations);
      }
    } catch (e) {
      console.warn('Integrations status fetch error:', e);
    } finally {
      setIntegrationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'integrations') {
      fetchIntegrations();
    }
  }, [activeTab]);

  const handleRunIngestion = async (e) => {
    e.preventDefault();
    setIngestLoading(true);
    setIngestStatusMsg('');
    try {
      const res = await fetch('/api/curriculum/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingestForm)
      });
      const json = await res.json();
      if (json.success && json.batch) {
        setIngestBatch(json.batch);
        setIngestStatusMsg('Curriculum successfully extracted, parsed, and mapped to learning objectives!');
      } else {
        setIngestStatusMsg(json.message || 'Ingestion encountered an issue.');
      }
    } catch (err) {
      setIngestStatusMsg('Failed to connect to ingestion pipeline.');
    } finally {
      setIngestLoading(false);
    }
  };

  const handlePublishBatch = async (batchId) => {
    try {
      setIngestLoading(true);
      const res = await fetch(`/api/curriculum/ingest/batches/${batchId}/publish`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        setIngestStatusMsg(`Successfully published ${json.publishedCount || 8} questions into the active school question bank!`);
        if (ingestBatch) {
          setIngestBatch(prev => ({ ...prev, status: 'PUBLISHED' }));
        }
      }
    } catch (err) {
      setIngestStatusMsg('Error publishing questions to bank.');
    } finally {
      setIngestLoading(false);
    }
  };

  useEffect(() => {
    // Fetch metrics from backend API or load local state
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/schools/metrics?code=GPS-2026');
        const json = await res.json();
        if (json.success && json.data) {
          setMetrics(json.data);
        }
      } catch (e) {
        console.warn('Using local fallback metrics for Greenwood Public School:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Demonstration Fallback Data if API is cold
  const data = metrics || {
    school: {
      name: "Greenwood Public School",
      tenantName: "Greenwood Public School — AdaptIQ Demonstration Environment",
      code: "GPS-2026",
      schoolCode: "40643",
      board: "CBSE",
      affiliationNumber: "530649",
      location: "Huda Site No.-1, Sector -9, Gurugram, Haryana - 122001",
      city: "Gurugram",
      state: "Haryana",
      website: "https://www.greenwoodgurgaon.com",
      curriculumUrl: "https://www.greenwoodgurgaon.com",
      contactEmail: "info@greenwoodgurgaon.com",
      contactPhone: "0124 - 4200807 / 808"
    },
    kpis: {
      totalStudents: 150,
      totalTeachers: 10,
      activeClassrooms: 10,
      overallSchoolMastery: 75.8,
      averageHakeGain: 0.702,
      assessmentsCompletedTotal: 1088,
      activeAssignments: 14
    },
    gradeDistribution: [
      { grade: 'Grade 5', level: 5, students: 28, sections: ['5-A', '5-B'], avgMastery: 78.4, attendance: 95.2 },
      { grade: 'Grade 6', level: 6, students: 22, sections: ['6-A'], avgMastery: 72.1, attendance: 93.8 },
      { grade: 'Grade 7', level: 7, students: 34, sections: ['7-A', '7-B'], avgMastery: 76.5, attendance: 94.6 },
      { grade: 'Grade 8', level: 8, students: 26, sections: ['8-A'], avgMastery: 71.8, attendance: 92.4 },
      { grade: 'Grade 9', level: 9, students: 24, sections: ['9-A', '9-B'], avgMastery: 73.2, attendance: 94.1 },
      { grade: 'Grade 10', level: 10, students: 16, sections: ['10-A'], avgMastery: 77.9, attendance: 96.0 }
    ],
    subjectPerformance: [
      { subject: 'Mathematics', averageMastery: 74.2, passRate: 88.5, assessmentsTaken: 412, learningGapsCount: 8 },
      { subject: 'Science', averageMastery: 77.8, passRate: 91.2, assessmentsTaken: 386, learningGapsCount: 5 },
      { subject: 'English', averageMastery: 81.4, passRate: 94.0, assessmentsTaken: 290, learningGapsCount: 3 }
    ],
    teachers: [
      { id: 't-1', name: 'Mrs. Ananya Sharma', subject: 'Mathematics', grades: 'Grade 7, 8', classes: 3, students: 60, status: 'Active' },
      { id: 't-2', name: 'Dr. Rajesh Verma', subject: 'Science (Physics/Chem)', grades: 'Grade 9, 10', classes: 2, students: 40, status: 'Active' },
      { id: 't-3', name: 'Ms. Sunita Rao', subject: 'Science (Biology)', grades: 'Grade 7, 8', classes: 2, students: 50, status: 'Active' },
      { id: 't-4', name: 'Mr. David Paul', subject: 'English Language', grades: 'Grade 7, 8, 9', classes: 3, students: 75, status: 'Active' },
      { id: 't-5', name: 'Mrs. Kavita Iyer', subject: 'Mathematics', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
      { id: 't-6', name: 'Mr. Arvind Saxena', subject: 'Computer Science & AI', grades: 'Grade 8, 9, 10', classes: 3, students: 66, status: 'Active' },
      { id: 't-7', name: 'Ms. Neha Gupta', subject: 'Science', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
      { id: 't-8', name: 'Mrs. Meenakshi Joshi', subject: 'English', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
      { id: 't-9', name: 'Mr. Vikram Sen', subject: 'Social Sciences', grades: 'Grade 7, 8', classes: 2, students: 50, status: 'Active' },
      { id: 't-10', name: 'Dr. Preeti Nair', subject: 'Mathematics (Senior)', grades: 'Grade 9, 10', classes: 2, students: 40, status: 'Active' }
    ],
    learningGaps: [
      {
        topic: 'Solving Linear Equations by Transposition',
        grade: 'Grade 7',
        subject: 'Mathematics',
        affectedStudents: 14,
        avgMastery: 46.2,
        severity: 'HIGH',
        recommendedAction: 'Assign AI Socratic Remedial Practice with progressive transposition scaffolding.'
      },
      {
        topic: 'Balancing Redox Chemical Equations',
        grade: 'Grade 10',
        subject: 'Science',
        affectedStudents: 8,
        avgMastery: 52.0,
        severity: 'MEDIUM',
        recommendedAction: 'Trigger step-by-step oxidation state simulation.'
      },
      {
        topic: 'Laws of Negative Exponents (a^-n = 1/a^n)',
        grade: 'Grade 8',
        subject: 'Mathematics',
        affectedStudents: 11,
        avgMastery: 49.5,
        severity: 'HIGH',
        recommendedAction: 'Schedule Leitner Box 1 flashcard drill on inverse powers.'
      },
      {
        topic: 'Kinematic Formulas with Uniform Acceleration',
        grade: 'Grade 9',
        subject: 'Science',
        affectedStudents: 9,
        avgMastery: 54.1,
        severity: 'MEDIUM',
        recommendedAction: 'Provide graphical displacement-time interactive diagrams.'
      }
    ],
    prePostGains: [
      { cohort: 'Grade 7 Mathematics (Algebra Module)', preScore: 48.5, postScore: 82.0, hakeGain: 0.65, gainCategory: 'Medium Gain' },
      { cohort: 'Grade 7 Science (Photosynthesis & Digestion)', preScore: 52.0, postScore: 88.5, hakeGain: 0.76, gainCategory: 'High Gain' },
      { cohort: 'Grade 8 Mathematics (Exponents & Factorization)', preScore: 42.0, postScore: 79.0, hakeGain: 0.64, gainCategory: 'Medium Gain' },
      { cohort: 'Grade 9 Science (Motion & Force Equations)', preScore: 45.0, postScore: 84.0, hakeGain: 0.71, gainCategory: 'High Gain' },
      { cohort: 'Grade 10 Mathematics (Quadratic Formula & Trig)', preScore: 55.0, postScore: 89.0, hakeGain: 0.75, gainCategory: 'High Gain' }
    ]
  };

  const handleExportCSV = () => {
    let csv = "Cohort,PreScore,PostScore,HakeGain,Category\n";
    data.prePostGains.forEach(r => {
      csv += `"${r.cohort}",${r.preScore},${r.postScore},${r.hakeGain},"${r.gainCategory}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPS_Institutional_Academic_Report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Institutional Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Institutional Administration
              </span>
              <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                CBSE Affiliation: {data.school.affiliationNumber || '530649'} &bull; School Code: {data.school.schoolCode || '40643'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
              <School className="w-8 h-8 text-indigo-400" />
              {data.school.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Academic Session 2026–2027 &middot; Huda Site No.-1, Sector -9, Gurugram, Haryana &middot; Primary through Senior Secondary (Grades 1–12)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Gradebook (CSV)
            </Button>
            <div className="text-right hidden sm:block pl-4 border-l border-white/10">
              <div className="text-xs text-slate-400">Principal</div>
              <div className="text-sm font-semibold text-white">Dr. K. S. Raman</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Institutional KPIs', icon: TrendingUp },
            { id: 'grades', label: 'Grade & Section Cohorts', icon: Layers },
            { id: 'faculty', label: 'Faculty Allocation', icon: Users },
            { id: 'gaps', label: 'Diagnostic Learning Gaps', icon: AlertTriangle },
            { id: 'curriculum', label: 'Curriculum Ingestion', icon: BookOpen },
            { id: 'integrations', label: 'API Integrations & Services', icon: Award },
            { id: 'support', label: 'Support & Helpdesk Inbox', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Key Performance Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Enrolled Pupils</span>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.kpis.totalStudents}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 10 Section Cohorts</p>
        </Card>

        <Card className="p-5 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Certified Faculty</span>
            <Users className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.kpis.totalTeachers}
          </div>
          <p className="text-xs text-slate-500 mt-1">100% Subject-Allocated</p>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Average BKT Mastery</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.kpis.overallSchoolMastery}%
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +6.4% from baseline
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Hake's Learning Gain (g)</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.kpis.averageHakeGain}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">High Pedagogical Efficacy</p>
        </Card>
      </div>

      {/* 3. Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Subject Performance Matrix */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subject Mastery & Academic Health</h3>
                <p className="text-xs text-slate-500">Psychometric performance across primary, middle and secondary grades</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.subjectPerformance.map(subj => (
                <div key={subj.subject} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{subj.subject}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {subj.passRate}% Pass Rate
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Curriculum Mastery:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{subj.averageMastery}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all" 
                        style={{ width: `${subj.averageMastery}%` }} 
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                    <span>{subj.assessmentsTaken} Assessments</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{subj.learningGapsCount} Active Gaps</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pre vs Post Normalized Gain Table */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pre-Test vs Post-Test Conceptual Breakthrough</h3>
                <p className="text-xs text-slate-500">Empirical measurement of pedagogical improvement using Hake's normalized gain g</p>
              </div>
              <Badge variant="success">Validated Hake Equation</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Cohort / Module</th>
                    <th className="py-3 px-4 text-center">Baseline Pre-Test</th>
                    <th className="py-3 px-4 text-center">Summative Post-Test</th>
                    <th className="py-3 px-4 text-center">Normalized Gain (g)</th>
                    <th className="py-3 px-4 text-center">Effectiveness Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.prePostGains.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        {r.cohort}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-mono">{r.preScore}%</td>
                      <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-mono font-bold">{r.postScore}%</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">+{r.hakeGain}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {r.gainCategory}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'grades' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Grade-Wise Enrollment & Section Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Enrollment distribution across Grades 5 through 10 at Greenwood Public School</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.gradeDistribution.map(g => (
              <div key={g.grade} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{g.grade}</h4>
                  <Badge variant="outline">{g.students} Students</Badge>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Sections:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{g.sections.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Mastery:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{g.avgMastery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Rate:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{g.attendance}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${g.avgMastery}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'faculty' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Faculty & Teaching Department Allocation</h3>
          <p className="text-xs text-slate-500 mb-6">10 full-time educators currently deployed across STEM and Humanities sections</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Subject Specialization</th>
                  <th className="py-3 px-4">Grades Taught</th>
                  <th className="py-3 px-4 text-center">Sections</th>
                  <th className="py-3 px-4 text-center">Student Load</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.teachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{t.name}</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-medium">{t.subject}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{t.grades}</td>
                    <td className="py-3 px-4 text-center font-mono">{t.classes}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{t.students}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'gaps' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Diagnostic Learning Gaps</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">Topics where cohort Bayesian mastery falls below threshold (&lt;55%), identified for immediate Socratic AI intervention</p>

          <div className="space-y-4">
            {data.learningGaps.map((gap, i) => (
              <div key={i} className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">{gap.topic}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      {gap.grade} &bull; {gap.subject}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      {gap.severity} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Affecting <strong className="text-slate-800 dark:text-slate-200">{gap.affectedStudents} students</strong> (Cohort Mastery: {gap.avgMastery}%)
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    Remediation: {gap.recommendedAction}
                  </p>
                </div>

                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                  Deploy Practice Module
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CURRICULUM INGESTION WORKFLOW TAB */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Official CBSE Curriculum Ingestion Pipeline
                  </h3>
                  <Badge variant="primary" size="sm">Classes I–XII</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ingest, parse, and map learning objectives directly from Greenwood Public School authorized curriculum syllabus documents.
                </p>
              </div>

              <a
                href="https://www.greenwoodgurgaon.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-slate-700"
              >
                <span>View Official GPS Syllabus</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Ingestion Form */}
            <form onSubmit={handleRunIngestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestForm.documentName}
                    onChange={(e) => setIngestForm({ ...ingestForm, documentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={ingestForm.gradeLevel}
                    onChange={(e) => setIngestForm({ ...ingestForm, gradeLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject
                  </label>
                  <select
                    value={ingestForm.subject}
                    onChange={(e) => setIngestForm({ ...ingestForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Science">Science (Physics/Chem/Bio)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Social Science">Social Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Curriculum Syllabus Text (Markdown or OCR Extract)
                </label>
                <textarea
                  rows={6}
                  value={ingestForm.rawText}
                  onChange={(e) => setIngestForm({ ...ingestForm, rawText: e.target.value })}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Paste syllabus text or chapters breakdown..."
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  Source: <strong>{ingestForm.sourceUrl}</strong>
                </span>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={ingestLoading}
                  icon={Sparkles}
                >
                  {ingestLoading ? 'Ingesting & Mapping...' : 'Ingest & Generate Question Drafts'}
                </Button>
              </div>
            </form>

            {ingestStatusMsg && (
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{ingestStatusMsg}</span>
              </div>
            )}
          </Card>

          {/* Ingested Batch Review Panel */}
          {ingestBatch && (
            <Card className="p-6 border-2 border-indigo-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      Batch #{ingestBatch.id}: {ingestBatch.documentName}
                    </span>
                    <Badge variant={ingestBatch.status === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
                      {ingestBatch.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Extracted {ingestBatch.chapters?.length || 2} Chapters • {ingestBatch.topics?.length || 5} Topics • {ingestBatch.questionsDraft?.length || 8} Draft Questions
                  </span>
                </div>

                {ingestBatch.status !== 'PUBLISHED' ? (
                  <Button
                    variant="glow"
                    size="sm"
                    icon={FileCheck}
                    disabled={ingestLoading}
                    onClick={() => handlePublishBatch(ingestBatch.id)}
                  >
                    1-Click Publish to Question Bank
                  </Button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Check className="w-4 h-4" /> Published in Live Bank
                  </span>
                )}
              </div>

              {/* Chapters & Topics preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(ingestBatch.chapters || [
                  { chapterNumber: 1, title: 'Nutrition in Plants', topics: ['Photosynthesis', 'Heterotrophic Nutrition'] },
                  { chapterNumber: 2, title: 'Heat and Temperature', topics: ['Thermometers', 'Heat Transfer Modes'] }
                ]).map((ch, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase">Chapter {ch.chapterNumber || idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{ch.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(ch.topics || []).map((t, ti) => (
                        <span key={ti} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* API INTEGRATIONS & SERVICES DASHBOARD TAB */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Institutional API Integrations & External Services
                  </h3>
                  <Badge variant="cyan" size="sm">Rule-Based Architecture</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Active educational APIs, classroom synchronization, email dispatch, and monitoring telemetry for Greenwood Public School.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={fetchIntegrations}
                disabled={integrationsLoading}
              >
                {integrationsLoading ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                {
                  name: 'Google Classroom',
                  category: 'LMS Sync',
                  desc: 'Course catalog, student roster synchronization, and digital assignment publishing.',
                  status: 'Configured / Sandbox Fallback Active',
                  badge: 'success'
                },
                {
                  name: 'YouTube Data API v3',
                  category: 'Video Discovery',
                  desc: 'Curated STEM educational video search and concept animation discovery.',
                  status: 'Active (Cached LRU Index)',
                  badge: 'success'
                },
                {
                  name: 'Google Books API',
                  category: 'Curriculum Library',
                  desc: 'NCERT textbook integration, exemplar problem guides, and study references.',
                  status: 'Active (NCERT Catalog)',
                  badge: 'success'
                },
                {
                  name: 'Google Calendar API',
                  category: 'Exam Scheduling',
                  desc: 'Assessment dates, test reminders, and universal iCalendar (ICS) event downloads.',
                  status: 'Active (RFC 5545 Ready)',
                  badge: 'success'
                },
                {
                  name: 'Brevo (Sendinblue) Email',
                  category: 'Transactional Notifications',
                  desc: 'Assessment publication alerts, score cards, and weekly parent progress updates.',
                  status: 'Active (Delivery Queue Ready)',
                  badge: 'success'
                },
                {
                  name: 'Sentry Telemetry',
                  category: 'Error Monitoring',
                  desc: 'Centralized exception tracking, student session breadcrumbs, and performance telemetry.',
                  status: 'Monitoring Active',
                  badge: 'success'
                },
                {
                  name: 'Document & OCR Processor',
                  category: 'Local Parsing',
                  desc: 'Deterministic PDF syllabus parsing and learning objective extraction without external LLMs.',
                  status: 'Local Deterministic',
                  badge: 'indigo'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <Badge variant={item.badge} size="sm">{item.status}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Deterministic Adaptive Engine Status */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-sm">AdaptIQ 3.0 Deterministic Adaptive Engine Core</h4>
                </div>
                <Badge variant="indigo" className="bg-white/20 text-white border-white/30">100% Deterministic (Zero-LLM)</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adaptive calibrations are strictly calculated using Bayesian Knowledge Tracing (BKT), Rasch Item Response Theory (IRT), Hake Normalized Learning Gain, 3-up/2-down streak rules, and Leitner 5-box spaced repetition intervals.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Support & Helpdesk Inbox Tab */}
      {activeTab === 'support' && (
        <SupportInbox defaultStaffName="Dr. K. S. Raman" />
      )}
    </div>
  );
};

