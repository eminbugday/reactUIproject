import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your machine's IP when testing on a physical device
export const API_BASE_URL = 'http://localhost:5142/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
