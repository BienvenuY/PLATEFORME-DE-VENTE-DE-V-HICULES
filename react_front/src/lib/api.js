import axios from "axios";

export const apiBaseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("carsbusiness_auth");
    if (raw) {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});
