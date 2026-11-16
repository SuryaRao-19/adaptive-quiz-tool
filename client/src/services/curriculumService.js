import api from './api';

export const getGrades = async () => {
  const response = await api.get('/curriculum/grades');
  return response.data;
};

export const getSubjectsByGrade = async (grade = 7) => {
  const response = await api.get(`/curriculum/subjects?grade=${grade}`);
  return response.data;
};

export const getCurriculumStructure = async (grade = 7, subject = 'Mathematics') => {
  const response = await api.get('/curriculum/structure', {
    params: { grade, subject }
  });
  return response.data;
};

export const getCurriculumQuestions = async (params = {}) => {
  const response = await api.get('/curriculum/questions', { params });
  return response.data;
};

export const getSchoolProfile = async () => {
  const response = await api.get('/school/profile');
  return response.data;
};

export const getSchoolKpis = async () => {
  const response = await api.get('/school/kpis');
  return response.data;
};

export const getAssignments = async (params = {}) => {
  const response = await api.get('/assignments', { params });
  return response.data;
};

export const createAssignment = async (data) => {
  const response = await api.post('/assignments', data);
  return response.data;
};

