import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Printer, 
  Share2, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  School 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MOCK_STUDENT, MOCK_PRE_VS_POST_MATH } from '../services/mockData';

export const PostTestReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';

  const handlePrint = () => {
    window.print();
  };

  const preTestOverall = 48;
  const postTestOverall = 82;
  const overallGain = postTestOverall - preTestOverall;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 no-print">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>
          <Button
            size="sm"
            variant="glow"
            icon={Share2}
            onClick={() => alert("Report link copied to clipboard for school administration review!")}
          >
            Share Growth Certificate
          </Button>
        </div>
      </div>

      {/* Certified Growth Assessment Document (Printable) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card-hover p-8 sm:p-12 print-page">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-glow-primary">
              ✦
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                AdaptIQ Certified Learning Growth Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                SDG-4 Quality Education • Diagnostic & Summative Intervention Assessment
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">Verified Growth Audit</p>
            <p className="font-mono">ID: AIQ-2026-G7B-984</p>
          </div>
        </div>

        {/* Student & Cohort Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase block mb-1">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{MOCK_STUDENT.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block mb-1">Roll / Identifier</span>
            <span className="font-bold font-mono text-slate-900 text-sm">{MOCK_STUDENT.rollNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block mb-1">Subject & Grade</span>
            <span className="font-bold text-slate-900 text-sm">{subject} • Grade {MOCK_STUDENT.grade}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase block mb-1">Practice Period</span>
            <span className="font-bold text-slate-900 text-sm">4 Weeks Adaptive</span>
          </div>
        </div>

        {/* Hero Growth Score Callout */}
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Starting Baseline
            </span>
            <p className="text-4xl font-extrabold text-slate-700 font-mono mt-2">
              {preTestOverall}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Pre-Test Diagnostic</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Post-Intervention Score
            </span>
            <p className="text-4xl font-extrabold text-indigo-600 font-mono mt-2">
              {postTestOverall}%
            </p>
            <p className="text-xs text-indigo-600/80 font-medium mt-1">Summative Post-Test</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-emerald-950">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Verified Net Improvement
            </span>
            <p className="text-4xl font-extrabold text-emerald-600 font-mono mt-2">
              +{overallGain}%
            </p>
            <p className="text-xs text-emerald-800 font-medium mt-1">Measurable Academic Gain</p>
          </div>
        </div>

        {/* Topic-by-Topic Learning Gain Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">Curriculum Unit Delta Breakdown</h3>
            <span className="text-xs text-slate-400">Standardized 15-question parallel assessment</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] bg-slate-50/60">
                  <th className="py-3 px-4 rounded-l-xl">Curriculum Topic</th>
                  <th className="py-3 px-4">Pre-Test Accuracy</th>
                  <th className="py-3 px-4">Post-Test Accuracy</th>
                  <th className="py-3 px-4">Net Delta</th>
                  <th className="py-3 px-4 rounded-r-xl">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PRE_VS_POST_MATH.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.topic}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{row.preTest}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{row.postTest}%</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        +{row.gain}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">
                        Remediated
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Certification Signature Footnote */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Cryptographically sealed & audit-logged by AdaptIQ Adaptive Engine.</span>
          </div>
          <div className="font-mono text-[11px]">
            Issued for District Academic Review & SDG-4 Pilot Evaluation
          </div>
        </div>
      </div>
    </div>
  );
};
