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
  },
  
  getAnalyticsSummary: async () => {
    const response = await apiClient.get('/analytics/summary');
    return response.data;
  },
  
  getDailyEmissions: async () => {
    const response = await apiClient.get('/analytics/daily');
    return response.data;
  },

  getWeeklyEmissions: async () => {
    const response = await apiClient.get('/analytics/weekly');
    return response.data;
  },

  getMonthlyEmissions: async () => {
    const response = await apiClient.get('/analytics/monthly');
    return response.data;
  },
  
  getRecommendations: async () => {
    const response = await apiClient.get('/recommendations');
    return response.data;
  },
  
  getOrganisationRecommendations: async () => {
    const response = await apiClient.get('/recommendations/org');
    return response.data;
  }
};
