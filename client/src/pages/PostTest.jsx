import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPostTestQuestions, submitQuizAnswers } from '../services/quizService';
import { QuizCard } from '../components/QuizCard';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const PostTest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getPostTestQuestions(subject);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to access Post-Test.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject]);

  const handleSelectOption = (idx) => {
    setAnswers({
      ...answers,
      [questions[currentIndex]._id]: idx
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    const formatted = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: answers[q._id] !== undefined ? answers[q._id] : -1
    }));

    if (formatted.some((a) => a.selectedOptionIndex === -1)) {
      setError('Please answer all 15 questions before submitting your Post-Test.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submitQuizAnswers({
        quizType: 'post_test',
        subject,
        topic: 'Diagnostic',
        answers: formatted
      });
      navigate(`/report?subject=${subject}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting post-test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message={`Loading ${subject} Post-Test Assessment...`} />;

  if (error && questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl border border-red-200 text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-700 mb-2">Post-Test Notice</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Button onClick={() => navigate(`/dashboard?subject=${subject}`)} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentSelected = currentQ ? answers[currentQ._id] : undefined;
  const isAnswered = currentSelected !== undefined;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Summative Evaluation
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {subject} Post-Intervention Test
          </h1>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          15 Questions
        </span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        label={`Question ${currentIndex + 1} of ${questions.length}`}
      />

      {error && (
        <div className="my-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <QuizCard
        question={currentQ}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        selectedOption={currentSelected}
        onSelectOption={handleSelectOption}
      />

      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="outline"
          className="w-1/3"
        >
          ← Previous
        </Button>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isAnswered}
            variant="teal"
            className="w-2/3"
          >
            {submitting ? 'Calculating Gains...' : 'Complete Post-Test & View Report 🏆'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            variant="primary"
            className="w-2/3"
          >
            Next Question →
          </Button>
        )}
      </div>
    </div>
  );
};
