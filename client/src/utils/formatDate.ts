export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const isFuture = (dateStr: string) => new Date(dateStr) > new Date();
