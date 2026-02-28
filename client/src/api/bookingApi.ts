import axiosInstance from './axiosInstance';

export const bookingApi = {
  create: (data: { event_id: number; seats_requested: number }) =>
    axiosInstance.post('/bookings', data),
  getMy: () => axiosInstance.get('/bookings/my'),
  cancel: (id: number) => axiosInstance.delete(`/bookings/${id}/cancel`),
  getByEvent: (eventId: number) => axiosInstance.get(`/bookings/event/${eventId}`),
};
