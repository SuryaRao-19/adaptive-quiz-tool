import api from './api';

export const getAttemptsAnalytics = async (subject) => {
  const query = subject && subject !== 'All' ? `?subject=${encodeURIComponent(subject)}` : '';
  const res = await api.get(`/attempts/analytics${query}`);
  return res.data;
};

export const getClassAnalytics = async (classId) => {
  const res = await api.get(`/attempts/class-analytics/${classId}`);
  return res.data;
};

export const recordAttempt = async (attemptData) => {
  const res = await api.post('/attempts', attemptData);
  return res.data;
};

// Legacy compatibility
export const getStudentProgress = async (subject) => {
  return getAttemptsAnalytics(subject);
};

export const getComparisonReport = async (subject) => {
  const res = await api.get(`/progress/comparison-report?subject=${encodeURIComponent(subject)}`);
  return res.data;
};

export const getTeacherOverview = async () => {
  const res = await api.get('/progress/teacher-overview');
  return res.data;
};

export const exportGradebookCsv = async (subject = 'Math') => {
  const res = await api.get(`/progress/export-gradebook?subject=${encodeURIComponent(subject)}&format=csv`, {
    responseType: 'blob'
  });
  return res.data;
};

export const exportGradebookXlsx = async (subject = 'Math') => {
  const res = await api.get(`/progress/export-gradebook?subject=${encodeURIComponent(subject)}&format=xlsx`, {
    responseType: 'blob'
  });
  return res.data;
};

export const exportQtiPackage = async (subject = 'Math', topic = '') => {
  const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : '';
  const res = await api.get(`/progress/export-qti?subject=${encodeURIComponent(subject)}${topicParam}`, {
    responseType: 'blob'
  });
  return res.data;
};
