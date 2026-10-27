import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAdaptiveQuestion, submitQuizAnswers } from '../services/quizService';
import { QuizCard } from '../components/QuizCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

const BATCH_SIZE = 10;

export const PracticeQuiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || 'Math';
  const topic = searchParams.get('topic') || 'Fractions';

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Session answer history
  const [sessionAnswers, setSessionAnswers] = useState([]); // [{ questionId, selectedOptionIndex, isCorrect }]
  const [recentBooleans, setRecentBooleans] = useState([]); // [true, true, false]
  const [seenQuestionIds, setSeenQuestionIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [batchCompleted, setBatchCompleted] = useState(false);

  // Fetch the next question
  const fetchNextQuestion = async (targetDifficulty, history, excluded) => {
    try {
      setLoading(true);
      setError('');
      setSelectedOption(null);
      setIsSubmitted(false);
      setFeedback(null);

      const data = await getAdaptiveQuestion(subject, topic, targetDifficulty, history, excluded);
      setCurrentQuestion(data.question);
      setCurrentDifficulty(data.servedDifficulty);
      setSeenQuestionIds([...excluded, data.question._id]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load practice questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion(currentDifficulty, recentBooleans, seenQuestionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectOption = (idx) => {
    if (!isSubmitted) {
      setSelectedOption(idx);
    }
  };

  // Grade current question via submit endpoint
  const handleCheckAnswer = async () => {
    if (selectedOption === null || !currentQuestion) return;

    try {
      setIsSubmitted(true);
      // Single question check
      const res = await submitQuizAnswers({
        quizType: 'practice',
        subject,
        topic,
        answers: [{
          questionId: currentQuestion._id,
          selectedOptionIndex: selectedOption
        }]
      });

      const evaluated = res.results[0];
      setFeedback(evaluated);

      const isCorrect = evaluated.isCorrect;
      const updatedBooleans = [...recentBooleans, isCorrect];
      setRecentBooleans(updatedBooleans);

      setSessionAnswers([
        ...sessionAnswers,
        {
          questionId: currentQuestion._id,
          selectedOptionIndex: selectedOption,
          isCorrect
        }
      ]);
    } catch (err) {
      setError('Failed to evaluate answer.');
    }
  };

  const handleContinueNext = () => {
    if (questionNumber >= BATCH_SIZE) {
      setBatchCompleted(true);
      return;
    }

    setQuestionNumber(questionNumber + 1);
    fetchNextQuestion(currentDifficulty, recentBooleans, seenQuestionIds);
  };

  if (loading && !currentQuestion) {
    return <LoadingSpinner message={`Loading adaptive practice for ${topic}...`} />;
  }

  // Batch Complete Summary
  if (batchCompleted) {
    const totalCorrect = sessionAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((totalCorrect / sessionAnswers.length) * 100);

    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Practice Session Completed!
          </h1>
          <p className="text-slate-600 mb-6">
            You scored <span className="font-bold text-teal-700 text-xl">{score}%</span> ({totalCorrect} of {sessionAnswers.length} correct) in <span className="font-bold text-slate-800">{topic}</span>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600 text-left">
            <p className="font-semibold text-slate-800 mb-1">Your Progress has been logged!</p>
            <p>Every practice question builds your mastery and brings you closer to the Post-Test unlock.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setBatchCompleted(false);
                setQuestionNumber(1);
                setSessionAnswers([]);
                fetchNextQuestion('medium', [], []);
              }}
              variant="teal"
              className="flex-1"
            >
              Practice 10 More Questions
            </Button>
            <Button
              onClick={() => navigate(`/dashboard?subject=${subject}`)}
              variant="outline"
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            {subject} • {topic}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Adaptive Practice</h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Difficulty</span>
          <span className="font-bold text-sm text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {currentDifficulty}
          </span>
        </div>
      </div>

      <ProgressBar
        current={questionNumber}
        total={BATCH_SIZE}
        label={`Question ${questionNumber} of ${BATCH_SIZE}`}
      />

      {error && (
        <div className="my-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {currentQuestion && (
        <QuizCard
          question={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={BATCH_SIZE}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          submitted={isSubmitted}
          isCorrect={feedback?.isCorrect}
          correctOptionIndex={feedback?.correctAnswerIndex}
        />
      )}

      {!isSubmitted && (
        <Button
          onClick={handleCheckAnswer}
          disabled={selectedOption === null}
          fullWidth
          variant="primary"
          className="text-lg"
        >
          Check Answer
        </Button>
      )}

      {isSubmitted && feedback && (
        <FeedbackModal
          isCorrect={feedback.isCorrect}
          explanation={feedback.explanation}
          onNext={handleContinueNext}
          isLastQuestion={questionNumber === BATCH_SIZE}
        />
      )}
    </div>
  );
};
