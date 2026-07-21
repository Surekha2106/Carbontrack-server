import { apiClient } from './apiClient';

export const goalService = {
  getGoals: async () => {
    const response = await apiClient.get('/goals');
    return response.data;
  },
  
  getGoalProgress: async (id: number) => {
    const response = await apiClient.get(`/goals/${id}/progress`);
    return response.data;
  }
};
