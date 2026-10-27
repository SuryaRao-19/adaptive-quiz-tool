import api from './api';

export const createClass = async (classData) => {
  const res = await api.post('/classes', classData);
  return res.data;
};

export const getMyClasses = async () => {
  const res = await api.get('/classes');
  return res.data;
};

export const joinClass = async (joinCode) => {
  const res = await api.post('/classes/join', { joinCode });
  return res.data;
};

export const getClassById = async (id) => {
  const res = await api.get(`/classes/${id}`);
  return res.data;
};

export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return res.data;
};

export const previewRosterImport = async (classId, roster) => {
  const res = await api.post(`/classes/${classId}/import-roster/preview`, { roster });
  return res.data;
};

export const importClassRoster = async (classId, roster) => {
  const res = await api.post(`/classes/${classId}/import-roster`, { roster });
  return res.data;
};

export const resetStudentPin = async (classId, studentId) => {
  const res = await api.post(`/classes/${classId}/students/${studentId}/reset-pin`);
  return res.data;
};

export const removeStudentFromClass = async (classId, studentId) => {
  const res = await api.delete(`/classes/${classId}/students/${studentId}`);
  return res.data;
};
