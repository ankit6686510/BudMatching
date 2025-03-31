import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API base URL:', API_BASE_URL); // Debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a reasonable timeout
  withCredentials: true // Added for CORS credentials
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Response:', error); // Debugging
    
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection and make sure the server is running.',
      });
    }
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Token expired or invalid, log out user
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden:', error.response.data);
        break;
      case 500:
        console.error('Server Error:', error.response.data);
        break;
      default:
        console.error(`Error (${error.response.status}):`, error.response.data);
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default api; 