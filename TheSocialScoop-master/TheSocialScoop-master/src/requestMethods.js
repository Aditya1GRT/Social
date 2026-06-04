import axios from "axios";

// API base URL — configurable via env var for deployment, defaults to local backend.
const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/";

// Reads the logged-in user's JWT from the redux-persist store in localStorage.
export const getToken = () => {
  try {
    const root = localStorage.getItem("persist:root");
    if (!root) return "";
    const user = JSON.parse(JSON.parse(root).user);
    return user?.currentUser?.accessToken || "";
  } catch (e) {
    return "";
  }
};

export const publicRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach the auth token (when present) to every request automatically.
publicRequest.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.token = `Bearer ${token}`;
  return config;
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

userRequest.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.token = `Bearer ${token}`;
  return config;
});
