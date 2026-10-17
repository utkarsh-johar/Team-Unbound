import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 unauthenticated gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return rejected promise so calling code can handle or catch
    return Promise.reject(error);
  }
);

export default api;
