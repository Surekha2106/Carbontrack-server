import { apiClient } from './apiClient';

export const badgeService = {
  getBadges: async () => {
    const response = await apiClient.get('/badges');
    return response.data;
  }
};
