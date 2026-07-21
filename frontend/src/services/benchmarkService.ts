import { apiClient } from './apiClient';

export const benchmarkService = {
  getPeerBenchmark: async () => {
    const response = await apiClient.get('/benchmark');
    return response.data;
  }
};
