import api from './api';

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

// Aliased for backward compatibility
export const registerStudent = registerUser;

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const loginStudentWithPin = async ({ rollNumber, pin, joinCode }) => {
  const res = await api.post('/auth/pin-login', { rollNumber, pin, joinCode });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfile = async (profileData) => {
  const res = await api.patch('/auth/profile', profileData);
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await api.put('/auth/change-password', passwordData);
  return res.data;
};
