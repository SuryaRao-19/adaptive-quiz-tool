import api from './api';

export const getQuestions = async (params = {}) => {
  const response = await api.get('/questions', { params });
  return response.data;
};

export const getTopics = async (params = {}) => {
  const response = await api.get('/questions/topics', { params });
  return response.data;
};

export const generateQuestions = async (data) => {
  const response = await api.post('/questions/generate', data);
  return response.data;
};

export const updateQuestionStatus = async (id, status) => {
  const response = await api.patch(`/questions/${id}/status`, { status });
  return response.data;
};

export const updateQuestion = async (id, data) => {
  const response = await api.put(`/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const addQuestion = async (data) => {
  const response = await api.post('/questions', data);
  return response.data;
};
