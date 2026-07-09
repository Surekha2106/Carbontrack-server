import { apiClient } from './apiClient';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    // For now we will mock this or point to the API if available
    // const response = await apiClient.put('/users/me', data);
    // return response.data;
    return new Promise(resolve => setTimeout(() => resolve({ success: true, ...data }), 800));
  }
};
