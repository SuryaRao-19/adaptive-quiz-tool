import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getStudentProgress } from '../services/progressService';
import { TopicBadge } from '../components/TopicBadge';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSubject = searchParams.get('subject') || 'Math';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgress = async (subject) => {
    try {
      setLoading(true);
      setError('');
      const res = await getStudentProgress(subject);
      setData(res);
    } catch (err) {
      setError('Unable to load progress data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress(activeSubject);
  }, [activeSubject]);

  const handleSubjectChange = (subject) => {
    setSearchParams({ subject });
  };

  if (loading) return <LoadingSpinner message="Loading your mastery dashboard..." />;

  const weakTopics = data?.topics?.filter((t) => t.status === 'needs_focus') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Subject Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8">
        {['Math', 'Science'].map((subj) => (
          <button
            key={subj}
            onClick={() => handleSubjectChange(subj)}
            className={`px-6 py-3 font-bold text-base transition-all border-b-4 ${
              activeSubject === subj
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {subj === 'Math' ? '📐 Mathematics' : '🔬 Science'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Pre-Test Warning / Status */}
      {!data?.hasCompletedPreTest ? (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 mb-8 shadow-md">
          <div className="max-w-2xl">
            <span className="bg-blue-800 text-blue-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Step 1: Baseline Assessment Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-2">
              Start with the {activeSubject} Diagnostic Pre-Test
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              Before personalized practice begins, take this 15-question baseline test. It helps us pinpoint exactly which topics need your attention most.
            </p>
            <Button
              onClick={() => navigate(`/pre-test?subject=${activeSubject}`)}
              variant="teal"
              className="text-base"
            >
              Take Diagnostic Pre-Test Now →
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pre-Test Baseline
            </p>
            <p className="text-3xl font-extrabold text-blue-900 mt-2">
              {data.preTestScore}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Starting diagnostic score</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Practice Questions Done
            </p>
            <p className="text-3xl font-extrabold text-teal-700 mt-2">
              {data.totalPracticeQuestionsAnswered} / {data.requiredQuestionsForPostTest}
            </p>
            <p className="text-xs text-slate-500 mt-1">Target to unlock Post-Test</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Post-Test Status
            </p>
            {data.hasCompletedPostTest ? (
              <div>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {data.postTestScore}%
                </p>
                <Link
                  to={`/report?subject=${activeSubject}`}
                  className="text-xs font-bold text-blue-900 hover:underline mt-1 block"
                >
                  View Improvement Report →
                </Link>
              </div>
            ) : data.canTakePostTest ? (
              <div>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Unlocked!
                </span>
                <Link
                  to={`/post-test?subject=${activeSubject}`}
                  className="text-xs font-bold text-teal-700 hover:underline mt-1 block"
                >
                  Take Post-Test Now →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-slate-400 mt-2">Locked</p>
                <p className="text-xs text-slate-500 mt-1">
                  Need {data.requiredQuestionsForPostTest - data.totalPracticeQuestionsAnswered} more practice questions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Practice Section */}
      {data?.hasCompletedPreTest && weakTopics.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-amber-600 text-xl">⚠️</span>
            <h2 className="text-xl font-bold text-slate-900">
              Recommended Focus Areas (Weak Topics)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="bg-amber-50/60 border border-amber-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{topic.topic}</h3>
                    <TopicBadge status={topic.status} />
                  </div>
                  <ProgressBar
                    percentage={topic.masteryPercentage}
                    label={`Accuracy: ${topic.questionsCorrect}/${topic.questionsAttempted}`}
                  />
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() =>
                      navigate(`/practice?subject=${activeSubject}&topic=${encodeURIComponent(topic.topic)}`)
                    }
                    variant="teal"
                    className="w-full text-sm"
                  >
                    Practice {topic.topic} →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Topics Section */}
      {data?.hasCompletedPreTest && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            All Curriculum Topics & Mastery
          </h2>

          {data.topics.length === 0 ? (
            <p className="text-slate-500 text-sm">No practice topics recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.topics.map((t) => (
                <div key={t.topic} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-bold text-slate-800 text-base">{t.topic}</span>
                      <TopicBadge status={t.status} />
                      <span className="text-xs uppercase font-semibold text-slate-400">
                        Level: {t.currentLevel}
                      </span>
                    </div>
                    <ProgressBar
                      percentage={t.masteryPercentage}
                      label={`Accuracy: ${t.questionsCorrect}/${t.questionsAttempted} correct`}
                    />
                  </div>
                  <div className="sm:w-44 flex-shrink-0">
                    <Button
                      onClick={() =>
                        navigate(`/practice?subject=${activeSubject}&topic=${encodeURIComponent(t.topic)}`)
                      }
                      variant="outline"
                      className="w-full text-xs font-semibold"
                    >
                      Practice Topic
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
