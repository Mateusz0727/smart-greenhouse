import axios from "axios";
import { getAccessToken, saveAccessToken } from "./services/AuthService";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true 
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
         

          saveAccessToken(newToken);
          api.defaults.headers.Authorization = `Bearer ${newToken}`;
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          window.location.href = "/"; 
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      const newToken = getAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
const refreshAccessToken = async () => {
  try {
    const response = await api.post("users/refresh");
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (err) {
    throw new Error("Nie udało się odświeżyć tokena");
  }
};
export default api;