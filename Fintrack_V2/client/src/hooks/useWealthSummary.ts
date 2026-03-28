import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Ensure the token or fetching respects the auth pattern of the user's setup
// FinTrack might employ cookies or a localStorage token, so we create a standard axios instance.
const apiClient = axios.create({
  baseURL: '/api/v2', // Vite/Next proxy will handle rewriting, or this is a relative path.
});

// An interceptor to attach JWT token if stored in localStorage (common approach).
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const fetchWealthSummary = async () => {
  // If the user's Next.js setup proxies /api/v2, this will work out of the box. 
  // Otherwise, we might need absolute URL to backend e.g. http://localhost:3000
  const response = await apiClient.get('/wealth/summary');
  return response.data;
};

export const useWealthSummary = () => {
  return useQuery({
    queryKey: ['wealthSummary'],
    queryFn: fetchWealthSummary,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 mins
  });
};
