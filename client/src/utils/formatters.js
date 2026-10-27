export const formatPercent = (val) => {
  if (val === null || val === undefined) return '0%';
  return `${Math.round(val)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
