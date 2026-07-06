import { apiClient } from './apiClient';

export const goalService = {
  getGoals: async () => {
    const response = await apiClient.get('/goals');
    return response.data;
  }
};
