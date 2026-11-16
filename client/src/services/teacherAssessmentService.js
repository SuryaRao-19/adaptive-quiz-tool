import api from './api';

export const getTeacherDashboard = async () => {
  const response = await api.get('/teacher/dashboard');
  return response.data;
};

export const getTeacherClassrooms = async () => {
  const response = await api.get('/teacher/classes');
  return response.data;
};

export const createTeacherAssessment = async (data) => {
  const response = await api.post('/teacher/assessments', data);
  return response.data;
};

export const duplicateTeacherAssessment = async (id) => {
  const response = await api.post(`/teacher/assessments/${id}/duplicate`);
  return response.data;
};

export const getLiveTestStatus = async (assessmentId) => {
  const response = await api.get(`/teacher/live/${assessmentId}`);
  return response.data;
};

export const controlLiveTest = async (assessmentId, action, payload = {}) => {
  const response = await api.post(`/teacher/live/${assessmentId}/control`, { action, payload });
  return response.data;
};

export const getSubmissionsForGrading = async (params = {}) => {
  const response = await api.get('/teacher/grading/submissions', { params });
  return response.data;
};

export const gradeSubmission = async (attemptId, grades) => {
  const response = await api.post(`/teacher/grading/${attemptId}`, { grades });
  return response.data;
};

export const publishAssessmentResults = async (assessmentId) => {
  const response = await api.post(`/teacher/assessments/${assessmentId}/publish-results`);
  return response.data;
};

export const getClassResultsAnalytics = async (params = {}) => {
  const response = await api.get('/teacher/results', { params });
  return response.data;
};

export const getDiagnosticBlueprint = async (params = {}) => {
  const response = await api.get('/teacher/diagnostic-blueprint', { params });
  return response.data;
};

