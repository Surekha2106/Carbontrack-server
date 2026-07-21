import { apiClient } from './apiClient';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },
  
  changePassword: async (data: any) => {
    const response = await apiClient.put('/users/me/password', data);
    return response.data;
  },
  
  getLeaderboard: async () => {
    const response = await apiClient.get('/users/leaderboard');
    return response.data;
  }
};
