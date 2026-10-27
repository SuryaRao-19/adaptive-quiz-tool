import api from './api';

export const getPreTestQuestions = async (subject) => {
  const res = await api.get(`/quiz/pre-test?subject=${encodeURIComponent(subject)}`);
  return res.data;
};

export const getAdaptiveQuestion = async (subject, topic, currentDifficulty, recentHistory = [], excludeIds = []) => {
  const params = new URLSearchParams({
    subject,
    topic,
    currentDifficulty,
    recentHistory: recentHistory.join(','),
    excludeIds: excludeIds.join(',')
  });
  const res = await api.get(`/quiz/practice-question?${params.toString()}`);
  return res.data;
};

export const submitQuizAnswers = async (payload) => {
  const res = await api.post('/quiz/submit', payload);
  return res.data;
};

export const getPostTestQuestions = async (subject) => {
  const res = await api.get(`/quiz/post-test?subject=${encodeURIComponent(subject)}`);
  return res.data;
};

export const getSyllabusTopics = async (subject) => {
  const res = await api.get(`/quiz/topics?subject=${encodeURIComponent(subject || '')}`);
  return res.data;
};

// Teacher / Admin In-App Question Management
export const addQuestion = async (questionData) => {
  const res = await api.post('/questions', questionData);
  return res.data;
};

export const getQuestions = async (filter = {}) => {
  const params = new URLSearchParams(filter);
  const res = await api.get(`/questions?${params.toString()}`);
  return res.data;
};

export const deleteQuestion = async (id) => {
  const res = await api.delete(`/questions/${id}`);
  return res.data;
};
