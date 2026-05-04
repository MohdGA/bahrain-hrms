import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // 503 = Render free tier waking up
    if (err.response?.status === 503 || !err.response) {
      err.userMessage = 'Server is waking up, please try again in 15 seconds.';
    }
    return Promise.reject(err);
  }
);

export default api;
