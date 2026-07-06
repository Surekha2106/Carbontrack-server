import { apiClient } from './apiClient';

export interface ActivityData {
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  logDate: string;
}

export const activityService = {
  getActivities: async () => {
    const response = await apiClient.get('/activities');
    return response.data;
  },
  
  logActivity: async (data: ActivityData) => {
    const response = await apiClient.post('/activities', data);
    return response.data;
  }
};
