import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComparisonReport } from '../services/progressService';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Report = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getComparisonReport(subject);
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load improvement report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [subject]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating your improvement report..." />;

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl border border-red-200 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Notice</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Button onClick={() => navigate(`/dashboard?subject=${subject}`)} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isPositiveGain = report.overallGainPercentage >= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
        <div>
          <button
            onClick={() => navigate(`/dashboard?subject=${subject}`)}
            className="text-sm font-semibold text-blue-900 hover:underline mb-1 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {subject} Learning Growth Report
          </h1>
        </div>
        <Button onClick={handlePrint} variant="outline" className="text-sm">
          🖨️ Print / Save PDF
        </Button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-200 pb-6 mb-6 flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{report.studentName}</h2>
            <p className="text-sm text-slate-500">Roll Number: {report.rollNumber} • Subject: {report.subject}</p>
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-slate-500">
            Certified Growth Assessment
          </div>
        </div>

        {/* Score Comparison Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pre-Test Baseline
            </p>
            <p className="text-4xl font-extrabold text-slate-800 mt-2">
              {report.preTestScore}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Initial diagnostic score</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Post-Intervention Test
            </p>
            <p className="text-4xl font-extrabold text-blue-900 mt-2">
              {report.postTestScore}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Score after adaptive practice</p>
          </div>

          <div className={`p-6 rounded-xl border ${isPositiveGain ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Overall Improvement
            </p>
            <p className="text-4xl font-extrabold mt-2">
              {isPositiveGain ? `+${report.overallGainPercentage}%` : `${report.overallGainPercentage}%`}
            </p>
            <p className="text-xs mt-1">Measurable learning gain</p>
          </div>
        </div>

        {/* Topic Breakdown Table */}
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Topic-by-Topic Learning Gain
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Baseline Pre-Test</th>
                <th className="py-3 px-4">Post-Test Score</th>
                <th className="py-3 px-4">Net Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {report.topicBreakdown.map((row) => (
                <tr key={row.topic} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-semibold text-slate-800">{row.topic}</td>
                  <td className="py-4 px-4 text-slate-600">{row.preTestAccuracy}%</td>
                  <td className="py-4 px-4 font-semibold text-blue-900">{row.postTestAccuracy}%</td>
                  <td className="py-4 px-4">
                    <span className={`font-bold px-2.5 py-1 rounded text-xs ${row.gain >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {row.gain >= 0 ? `+${row.gain}%` : `${row.gain}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          This report verifies measurable educational progress powered by the Adaptive Quiz and Practice Platform.
        </div>
      </div>
    </div>
  );
};
