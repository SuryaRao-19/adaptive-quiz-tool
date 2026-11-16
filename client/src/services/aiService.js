import api from './api';

/**
 * AdaptIQ AI Learning Hub Service
 * Routes all AI requests through the secure AdaptIQ server API.
 * Never calls Gemini directly from client browser code.
 */

export const generateAIQuiz = async (data) => {
  const response = await api.post('/ai/generate-quiz', data);
  return response.data;
};

export const explainStudentAnswer = async (data) => {
  const response = await api.post('/ai/explain-answer', data);
  return response.data;
};

export const getPersonalizedStudyPlan = async (data = {}) => {
  const response = await api.post('/ai/study-plan', data);
  return response.data;
};

export const generateAIPracticeTest = async (data) => {
  const response = await api.post('/ai/generate-practice-test', data);
  return response.data;
};

export const consultTeacherAssistant = async (data) => {
  const response = await api.post('/ai/teacher-assistant', data);
  return response.data;
};

export const getAIPerformanceInsights = async (data = {}) => {
  const response = await api.post('/ai/performance-insights', data);
  return response.data;
};

export const approveAIContent = async (data) => {
  const response = await api.post('/ai/approve-content', data);
  return response.data;
};

export const getAIUsageTelemetry = async () => {
  const response = await api.get('/ai/usage');
  return response.data;
};

