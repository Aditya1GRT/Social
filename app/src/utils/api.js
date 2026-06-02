import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';

const getToken = () => {
  try {
    const root = localStorage.getItem('persist:root');
    if (!root) return '';
    const user = JSON.parse(JSON.parse(root).user);
    return user?.currentUser?.accessToken || '';
  } catch {
    return '';
  }
};

export const api = axios.create({ baseURL: BASE, timeout: 15000 });

api.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.token = `Bearer ${t}`;
  return cfg;
});
