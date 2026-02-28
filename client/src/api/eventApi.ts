import axiosInstance from './axiosInstance';

export const eventApi = {
  getAll: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return axiosInstance.get(`/events?${params}`);
  },
  getById: (id: string | number) => axiosInstance.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => axiosInstance.post('/events', data),
  update: (id: string | number, data: Record<string, unknown>) => axiosInstance.put(`/events/${id}`, data),
  remove: (id: string | number) => axiosInstance.delete(`/events/${id}`),
  getOrganizerEvents: () => axiosInstance.get('/organizer/events'),
};
