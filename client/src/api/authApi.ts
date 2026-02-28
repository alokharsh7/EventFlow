import axiosInstance from './axiosInstance';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    axiosInstance.post('/auth/register', data),
  getMe: () => axiosInstance.get('/auth/me'),
};
