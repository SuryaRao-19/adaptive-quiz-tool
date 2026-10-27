import api from './api';

export const getResources = async (filter = {}) => {
  const params = new URLSearchParams();
  if (filter.subject && filter.subject !== 'All') params.append('subject', filter.subject);
  if (filter.topic && filter.topic !== 'All') params.append('topic', filter.topic);
  if (filter.difficulty && filter.difficulty !== 'All') params.append('difficulty', filter.difficulty);
  if (filter.search) params.append('search', filter.search);

  const res = await api.get(`/library?${params.toString()}`);
  return res.data;
};

export const addResource = async (resourceData) => {
  const res = await api.post('/library', resourceData);
  return res.data;
};

export const deleteResource = async (id) => {
  const res = await api.delete(`/library/${id}`);
  return res.data;
};
