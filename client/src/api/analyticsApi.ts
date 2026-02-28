import axiosInstance from './axiosInstance';

export const analyticsApi = {
  overview: () => axiosInstance.get('/analytics/overview'),
  revenue: (period = '30d') => axiosInstance.get(`/analytics/revenue?period=${period}`),
  bookingsByEvent: () => axiosInstance.get('/analytics/bookings-by-event'),
  peakHours: () => axiosInstance.get('/analytics/peak-hours'),
  eventDetail: (eventId: number) => axiosInstance.get(`/analytics/event/${eventId}/detail`),
};
