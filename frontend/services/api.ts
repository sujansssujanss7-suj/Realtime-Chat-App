import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/config';
import { Message, ApiResponse, ApiMessageResponse } from '../types/chat';

// Create Axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Unable to connect to the server. Please ensure the backend is running.'));
    }
    if (error.response) {
      const data = error.response.data as { message?: string };
      return Promise.reject(new Error(data?.message || 'Server returned an error.'));
    }
    if (error.request) {
      return Promise.reject(new Error('No response from server. Check your internet connection.'));
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---

/**
 * Fetch all chat history from the server
 */
export const fetchMessages = async (): Promise<Message[]> => {
  const response = await axiosInstance.get<ApiResponse<Message>>('/api/messages');
  return response.data.messages ?? [];
};

/**
 * Create a message via REST API
 * Note: In the real-time flow, messages are sent via Socket.io.
 * This is available for fallback/direct API usage.
 */
export const postMessage = async (username: string, text: string): Promise<Message> => {
  const response = await axiosInstance.post<ApiMessageResponse>('/api/messages', {
    username: username.trim(),
    text: text.trim(),
  });
  return response.data.message;
};

/**
 * Health check — verify server is reachable
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    await axiosInstance.get('/api/health');
    return true;
  } catch {
    return false;
  }
};

export default axiosInstance;
