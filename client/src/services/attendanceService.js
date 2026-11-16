import api from './api';

export const markAttendance = async (data) => {
  const response = await api.post('/attendance', data);
  return response.data;
};

export const getClassroomAttendance = async (classroomId, date) => {
  const response = await api.get('/attendance', {
    params: { classroomId, date }
  });
  return response.data;
};

export const getAttendanceSummary = async (classroomId, month, year) => {
  const response = await api.get('/attendance/summary', {
    params: { classroomId, month, year }
  });
  return response.data;
};

