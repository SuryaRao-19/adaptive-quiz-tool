import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPreTestQuestions, submitQuizAnswers } from '../services/quizService';
import { QuizCard } from '../components/QuizCard';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const PreTest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getPreTestQuestions(subject);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pre-test questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject]);

  const handleSelectOption = (optionIndex) => {
    setAnswers({
      ...answers,
      [questions[currentIndex]._id]: optionIndex
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
    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: answers[q._id] !== undefined ? answers[q._id] : -1
    }));

    // Check if any unanswered
    const unanswered = formattedAnswers.some((a) => a.selectedOptionIndex === -1);
    if (unanswered) {
      setError('Please answer all questions before submitting your diagnostic test.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await submitQuizAnswers({
        quizType: 'pre_test',
        subject,
        topic: 'Diagnostic',
        answers: formattedAnswers
      });
      setResults(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message={`Loading ${subject} Diagnostic Pre-Test...`} />;

  if (error && questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl border border-red-200 text-center shadow-sm">
        <h2 className="text-xl font-bold text-red-700 mb-2">Pre-Test Notice</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Button onClick={() => navigate(`/dashboard?subject=${subject}`)} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Render Diagnostic Result Summary
  if (results) {
    return (
      <div className="max-w-2xl mx-auto my-8 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
            📊
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Diagnostic Baseline Recorded!
          </h1>
          <p className="text-slate-600 mb-6">
            You scored <span className="font-bold text-blue-900 text-xl">{results.scorePercentage}%</span> ({results.correctAnswers} of {results.totalQuestions} correct).
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-left">
            <h3 className="font-bold text-blue-950 mb-2 text-sm uppercase tracking-wide">
              What happens now?
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We’ve identified the specific topics where you need targeted practice. Your practice sessions will automatically adapt to your level so you can build strong foundational understanding.
            </p>
          </div>

          <Button
            onClick={() => navigate(`/dashboard?subject=${subject}`)}
            fullWidth
            variant="teal"
            className="text-lg"
          >
            Go to Your Practice Dashboard →
          </Button>
        </div>
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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {subject} Diagnostic Pre-Test
        </h1>
        <span className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Baseline Calibration
        </span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        label={`Question ${currentIndex + 1} of ${questions.length}`}
      />

      {error && (
        <div className="my-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
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
            {submitting ? 'Evaluating...' : 'Submit Diagnostic Test ✓'}
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
