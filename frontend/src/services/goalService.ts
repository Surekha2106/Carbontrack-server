import { apiClient } from './apiClient';

export const goalService = {
  getGoals: async () => {
    const response = await apiClient.get('/goals');
    return response.data;
  },
  
  getGoalProgress: async (id: number) => {
    const response = await apiClient.get(`/goals/${id}/progress`);
    return response.data;
  },
  
  createGoal: async (data: any) => {
    const response = await apiClient.post('/goals', data);
    return response.data;
  },
  
  updateGoal: async (id: number, data: any) => {
    const response = await apiClient.put(`/goals/${id}`, data);
    return response.data;
  },
  
  deleteGoal: async (id: number) => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
  }
};
