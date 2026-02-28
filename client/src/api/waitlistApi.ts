import axiosInstance from './axiosInstance';

export const waitlistApi = {
  join: (eventId: number) => axiosInstance.post(`/waitlist/${eventId}`),
  leave: (eventId: number) => axiosInstance.delete(`/waitlist/${eventId}`),
  getMy: () => axiosInstance.get('/waitlist/my'),
};
